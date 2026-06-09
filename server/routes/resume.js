const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/extract', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
      type: req.file.originalname.endsWith('.docx') ? 'docx' : 'pdf',
      buffer: req.file.buffer.toString('base64'),
      filename: req.file.originalname
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error uploading file.' })
  }
});

router.post('/analyze', authMiddleware, async (req, res) => {
  const { resume_text, intent, target_role, job_description } = req.body;
  if (!resume_text) return res.status(400).json({ error: 'Resume text required' });

  try {
    const profileResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, 
              p.preferred_language, p.city, p.skills_assessment, p.biggest_fear,
              p.biggest_blocker, p.education_level,
              fs.job_title as chosen_role
       FROM users u 
       JOIN profiles p ON p.user_id=u.id
       LEFT JOIN future_selves fs ON fs.user_id=u.id AND fs.is_chosen=true
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    const language = profile?.preferred_language || 'English';

    // Determine target role and context based on intent
    let intentContext = ''
    let resolvedTarget = ''

    if (intent === 'know') {
      resolvedTarget = target_role
      intentContext = `The student knows exactly what they want: "${target_role}". Analyze this resume specifically for this role. Be very specific about what's missing for THIS role.`
    } else if (intent === 'lost') {
      resolvedTarget = 'unknown'
      intentContext = `The student has no idea what they want. Analyze this resume and tell them: what roles is this resume already good for? What paths does their existing experience suggest? Give them direction, not just scores.`
    } else if (intent === 'opportunity') {
      resolvedTarget = 'specific opportunity'
      intentContext = `The student has a specific opportunity. Job description: "${job_description}". Analyze how well this resume matches THIS specific job. Tell them exactly what to add, remove, or rewrite to get this job.`
    } else if (intent === 'mirrova') {
      resolvedTarget = profile?.chosen_role || profile?.dream_direction || 'target role'
      intentContext = `Use the student's full Mirrova profile for deep personalization:
- Their chosen future role: ${profile?.chosen_role || 'not chosen yet'}
- Their dream direction: ${profile?.dream_direction || 'not specified'}
- Their biggest fear: ${profile?.biggest_fear || 'not specified'}
- Their biggest blocker: ${profile?.biggest_blocker || 'not specified'}
- Their education: ${profile?.education_level || 'not specified'}
- Their city: ${profile?.city || 'India'}
Analyze this resume against their specific chosen path and Mirrova profile. This should feel like advice from someone who knows them deeply.`
    }

    const prompt = `You are a brutally honest resume intelligence AI and expert career coach.

Student Profile:
- Name: ${profile?.name}
- Current field: ${profile?.current_field || 'not specified'}
- Target role: ${resolvedTarget}
- City: ${profile?.city || 'India'}

Intent context:
${intentContext}

Resume Content:
${resume_text.slice(0, 3000)}

Give a comprehensive resume analysis in ${language}. Return ONLY valid JSON:
{
  "intent_summary": "<one line summary of what this analysis is focused on based on their intent>",
  "ats_score": <number 0-100>,
  "overall_score": <number 0-100>,
  "target_role_identified": "<the role this resume is being analyzed for>",
  "recruiter_impression": "<what a recruiter thinks in 6 seconds>",
  "role_match_score": <0-100, how well this resume matches the target role>,
  "role_match_verdict": "<one honest sentence about how ready they are for this role>",
  "sections": {
    "summary": {"score": <0-100>, "feedback": "<feedback>", "rewrite": "<improved version>"},
    "experience": {"score": <0-100>, "feedback": "<feedback>", "top_fix": "<most important fix>"},
    "skills": {"score": <0-100>, "feedback": "<feedback>", "missing_skills": ["skill1", "skill2", "skill3"]},
    "education": {"score": <0-100>, "feedback": "<feedback>"}
  },
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "weak_bullets": [
    {"original": "<weak bullet>", "rewrite": "<stronger version>"},
    {"original": "<weak bullet>", "rewrite": "<stronger version>"},
    {"original": "<weak bullet>", "rewrite": "<stronger version>"}
  ],
  "skills_to_add": [
    {"skill": "<skill>", "why": "<why>", "how_long": "<time>"},
    {"skill": "<skill>", "why": "<why>", "how_long": "<time>"},
    {"skill": "<skill>", "why": "<why>", "how_long": "<time>"}
  ],
  "top_3_fixes": [
    {"fix": "<fix>", "impact": "High"},
    {"fix": "<fix>", "impact": "High"},
    {"fix": "<fix>", "impact": "Medium"}
  ],
  "brutal_truth": "<one thing nobody tells them>",
  "polish_tips": ["<tip1>", "<tip2>", "<tip3>"],
  "suggested_roles": ${intent === 'lost' ? '["<role1>", "<role2>", "<role3>"]' : 'null'}
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500
    });

    let result;
    try {
      const raw = completion.choices[0].message.content.trim();
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error' });
    }

    result.intent = intent

    await pool.query(
      'UPDATE profiles SET resume_text=$1, updated_at=NOW() WHERE user_id=$2',
      [resume_text.slice(0, 5000), req.user.id]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
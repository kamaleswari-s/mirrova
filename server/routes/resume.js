const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const multer = require('multer');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// POST /api/resume/extract — just pass buffer back as base64
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

// POST /api/resume/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  const { resume_text } = req.body;
  if (!resume_text) return res.status(400).json({ error: 'Resume text required' });

  try {
    const profileResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, p.preferred_language, p.city
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    const language = profile?.preferred_language || 'English';

    const prompt = `You are a brutally honest resume intelligence AI and expert career coach. Analyze this resume against the student's target role.

Student Profile:
- Name: ${profile?.name}
- Current field: ${profile?.current_field || 'not specified'}
- Target role: ${profile?.dream_direction || 'not specified'}
- City: ${profile?.city || 'India'}

Resume Content:
${resume_text.slice(0, 3000)}

Give a comprehensive resume analysis in ${language}. Return a JSON object:
{
  "ats_score": <number 0-100>,
  "overall_score": <number 0-100>,
  "recruiter_impression": "<what a recruiter thinks in 6 seconds in ${language}>",
  "sections": {
    "summary": {"score": <0-100>, "feedback": "<in ${language}>", "rewrite": "<improved version in ${language}>"},
    "experience": {"score": <0-100>, "feedback": "<in ${language}>", "top_fix": "<most important fix in ${language}>"},
    "skills": {"score": <0-100>, "feedback": "<in ${language}>", "missing_skills": ["skill1", "skill2", "skill3"]},
    "education": {"score": <0-100>, "feedback": "<in ${language}>"}
  },
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "weak_bullets": [
    {"original": "<weak bullet>", "rewrite": "<stronger version in ${language}>"},
    {"original": "<weak bullet>", "rewrite": "<stronger version in ${language}>"},
    {"original": "<weak bullet>", "rewrite": "<stronger version in ${language}>"}
  ],
  "skills_to_add": [
    {"skill": "<skill>", "why": "<why in ${language}>", "how_long": "<time>"},
    {"skill": "<skill>", "why": "<why>", "how_long": "<time>"},
    {"skill": "<skill>", "why": "<why>", "how_long": "<time>"}
  ],
  "top_3_fixes": [
    {"fix": "<fix in ${language}>", "impact": "High"},
    {"fix": "<fix in ${language}>", "impact": "High"},
    {"fix": "<fix in ${language}>", "impact": "Medium"}
  ],
  "brutal_truth": "<one thing nobody tells them in ${language}>",
  "polish_tips": ["<tip1 in ${language}>", "<tip2 in ${language}>", "<tip3 in ${language}>"]
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
const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/skills/assess
router.post('/assess', authMiddleware, async (req, res) => {
  const { skills } = req.body;
  try {
    await pool.query(
      'UPDATE profiles SET skills_assessment=$1, updated_at=NOW() WHERE user_id=$2',
      [JSON.stringify(skills), req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/skills
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT skills_assessment FROM profiles WHERE user_id=$1',
      [req.user.id]
    );
    const sa = result.rows[0]?.skills_assessment;
    if (!sa) return res.json(null);
    res.json(typeof sa === 'string' ? JSON.parse(sa) : sa);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/skills/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const profileResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, p.preferred_language
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const language = profile.preferred_language || 'English';

    const prompt = `Based on this student's profile, generate a relevant skills assessment list.

Student:
- Current field: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}

Generate exactly 12 skills that are most relevant for their transition from current field to dream direction.
Mix of: technical skills, soft skills, industry knowledge, tools.

Return a JSON array of 12 objects:
[
  {
    "skill": "<skill name in ${language}>",
    "category": "<one of: Technical, Soft Skills, Tools, Industry Knowledge>",
    "importance": "<one of: Critical, Important, Good to have>"
  }
]

Return ONLY valid JSON array. No markdown.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    let skills;
    try {
      const raw = completion.choices[0].message.content.trim();
      skills = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error' });
    }

    res.json(skills);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/skills/gap-analysis
router.post('/gap-analysis', authMiddleware, async (req, res) => {
  const { skills, ratings } = req.body;
  try {
    const profileResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.city, p.education_level, p.preferred_language
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    const language = profile?.preferred_language || 'English';

    // Build skills summary
    const ratingLabels = ['', 'Never tried', 'Beginner', 'Familiar', 'Confident', 'Expert']
    const skillsSummary = skills.map(s => ({
      skill: s.skill,
      importance: s.importance,
      category: s.category,
      rating: ratingLabels[ratings[s.skill] || 0] || 'Not rated'
    }))

    const criticalSkills = skillsSummary.filter(s => s.importance === 'Critical')
    const weakSkills = skillsSummary.filter(s => (ratings[s.skill] || 0) <= 2)
    const strongSkills = skillsSummary.filter(s => (ratings[s.skill] || 0) >= 4)

    const prompt = `You are a career intelligence AI. Analyze this student's skill ratings and generate a gap analysis.

Student:
- Dream direction: ${profile?.dream_direction || 'not specified'}
- Current field: ${profile?.current_field || 'not specified'}
- City: ${profile?.city || 'India'}
- Education: ${profile?.education_level || 'not specified'}

Skills Assessment:
${skillsSummary.map(s => `- ${s.skill} (${s.importance}): ${s.rating}`).join('\n')}

Critical skills rated low: ${criticalSkills.filter(s => (ratings[s.skill] || 0) <= 2).map(s => s.skill).join(', ') || 'none'}
Strong skills: ${strongSkills.map(s => s.skill).join(', ') || 'none yet'}

Generate a gap analysis in ${language}. Return JSON:
{
  "readiness_score": <number 0-100 based on skill ratings vs requirements>,
  "readiness_label": "<Not Ready/Getting There/Almost Ready/Market Ready>",
  "summary": "<2 sentence honest summary in ${language}>",
  "critical_gaps": [
    {"skill": "<skill>", "why_matters": "<why this is critical for their target role in ${language}>", "time_to_learn": "<realistic time>"},
    {"skill": "<skill>", "why_matters": "<why>", "time_to_learn": "<time>"},
    {"skill": "<skill>", "why_matters": "<why>", "time_to_learn": "<time>"}
  ],
  "strengths": ["<strength skill 1>", "<strength skill 2>", "<strength skill 3>"],
  "learn_in_order": [
    "<skill 1 to learn first and why in ${language}>",
    "<skill 2 second in ${language}>",
    "<skill 3 third in ${language}>"
  ]
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1200
    });

    let result;
    try {
      const raw = completion.choices[0].message.content.trim();
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error' });
    }

    // Save gap analysis to DB alongside skills assessment
    const existing = await pool.query(
      'SELECT skills_assessment FROM profiles WHERE user_id=$1', [req.user.id]
    );
    const sa = existing.rows[0]?.skills_assessment;
    const parsed = sa ? (typeof sa === 'string' ? JSON.parse(sa) : sa) : {}
    parsed.gap_analysis = result

    await pool.query(
      'UPDATE profiles SET skills_assessment=$1, updated_at=NOW() WHERE user_id=$2',
      [JSON.stringify(parsed), req.user.id]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
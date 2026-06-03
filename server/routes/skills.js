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

// POST /api/skills/generate-skills (AI generates relevant skills based on profile)
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

module.exports = router;
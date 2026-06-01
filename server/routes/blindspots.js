const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/blindspots/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const dataResult = await pool.query(
      `SELECT u.name, u.mode, p.*, fs.job_title, fs.company_type, fs.id as future_self_id
       FROM users u
       JOIN profiles p ON p.user_id=u.id
       LEFT JOIN future_selves fs ON fs.user_id=u.id AND fs.is_chosen=true
       WHERE u.id=$1 LIMIT 1`,
      [req.user.id]
    );
    const data = dataResult.rows[0];
    if (!data) return res.status(404).json({ error: 'Profile not found' });

    const prompt = `You are a brutally honest career coach and hiring manager with 15 years of experience.

Student Profile:
- Currently: ${data.current_field}
- Target role: ${data.job_title || data.dream_direction}
- Top skill they claim: ${data.top_skill}
- Their biggest fear: ${data.biggest_fear}

Generate a blind spot analysis. Return ONLY valid JSON:
{
  "recruiter_impression": "2-3 sentence brutally honest paragraph of what a hiring manager thinks in 6 seconds. Be specific and direct.",
  "critical_gaps": [
    {"skill": "skill name", "description": "why this is killing their chances", "fix": "specific 30-day fix"}
  ],
  "soft_gaps": [
    {"skill": "skill name", "description": "what is holding them back", "fix": "specific fix"}
  ],
  "strengths": [
    {"skill": "skill name", "description": "why this is genuinely valuable"}
  ]
}

Give 2 critical gaps, 2 soft gaps, 3 strengths. Be specific to their profile.
Return ONLY the JSON object. No markdown.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500
    });

    let analysis;
    try {
      const raw = completion.choices[0].message.content.trim();
      analysis = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Parse error', raw: completion.choices[0].message.content });
    }

    await pool.query(
      `INSERT INTO blind_spots (user_id, future_self_id, recruiter_impression, critical_gaps, soft_gaps, strengths)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [req.user.id, data.future_self_id,
       analysis.recruiter_impression,
       JSON.stringify(analysis.critical_gaps),
       JSON.stringify(analysis.soft_gaps),
       JSON.stringify(analysis.strengths)]
    );

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/blindspots
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM blind_spots WHERE user_id=$1 ORDER BY generated_at DESC LIMIT 1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.json(null);
    const row = result.rows[0];
    res.json({
      recruiter_impression: row.recruiter_impression,
      critical_gaps: row.critical_gaps,
      soft_gaps: row.soft_gaps,
      strengths: row.strengths
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
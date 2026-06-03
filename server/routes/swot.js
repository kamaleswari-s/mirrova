const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/swot/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const profileResult = await pool.query(
      `SELECT u.name, u.mode, p.*
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const futureResult = await pool.query(
      'SELECT * FROM future_selves WHERE user_id=$1 AND is_chosen=true',
      [req.user.id]
    );
    const chosenSelf = futureResult.rows[0];

    const rcResult = await pool.query(
      'SELECT reality_check FROM profiles WHERE user_id=$1',
      [req.user.id]
    );
    const realityCheck = rcResult.rows[0]?.reality_check;

    const language = profile.preferred_language || 'English';

    const prompt = `You are a career intelligence AI. Generate a detailed personal Career SWOT Analysis for this student.

Student Profile:
- Name: ${profile.name}
- Current field: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}
- Biggest fear: ${profile.biggest_fear || 'not specified'}
- Success vision: ${profile.success_vision || 'not specified'}
- Target role: ${chosenSelf?.job_title || 'not chosen yet'}
- Reality check score: ${realityCheck ? (typeof realityCheck === 'string' ? JSON.parse(realityCheck) : realityCheck)?.overall_score : 'not assessed'}

Generate a comprehensive Career SWOT Analysis in ${language}. Return a JSON object:
{
  "summary": "<2-3 sentence overview of the student's career position in ${language}>",
  "strengths": [
    {"title": "<strength title in ${language}>", "description": "<detailed explanation in ${language}>", "career_impact": "<how this helps their career in ${language}>"},
    {"title": "...", "description": "...", "career_impact": "..."},
    {"title": "...", "description": "...", "career_impact": "..."},
    {"title": "...", "description": "...", "career_impact": "..."}
  ],
  "weaknesses": [
    {"title": "<weakness title in ${language}>", "description": "<detailed explanation in ${language}>", "fix": "<specific actionable fix in ${language}>"},
    {"title": "...", "description": "...", "fix": "..."},
    {"title": "...", "description": "...", "fix": "..."},
    {"title": "...", "description": "...", "fix": "..."}
  ],
  "opportunities": [
    {"title": "<opportunity title in ${language}>", "description": "<detailed explanation in ${language}>", "how_to_seize": "<specific action to take in ${language}>"},
    {"title": "...", "description": "...", "how_to_seize": "..."},
    {"title": "...", "description": "...", "how_to_seize": "..."},
    {"title": "...", "description": "...", "how_to_seize": "..."}
  ],
  "threats": [
    {"title": "<threat title in ${language}>", "description": "<detailed explanation in ${language}>", "mitigation": "<how to protect against this in ${language}>"},
    {"title": "...", "description": "...", "mitigation": "..."},
    {"title": "...", "description": "...", "mitigation": "..."},
    {"title": "...", "description": "...", "mitigation": "..."}
  ],
  "strategic_recommendation": "<one powerful strategic recommendation based on the SWOT in ${language}>",
  "immediate_action": "<the single most important thing they should do in the next 7 days in ${language}>"
}

Return ONLY valid JSON. No markdown. No explanation.`

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

    // Save to DB
    await pool.query(
      'UPDATE profiles SET reality_check=COALESCE(reality_check, \'{}\'::jsonb) WHERE user_id=$1',
      [req.user.id]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/swot (load saved)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT swot FROM profiles WHERE user_id=$1',
      [req.user.id]
    );
    const swot = result.rows[0]?.swot;
    if (!swot) return res.json(null);
    res.json(typeof swot === 'string' ? JSON.parse(swot) : swot);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
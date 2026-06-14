const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { groqWithFallback } = require('../utils/groqWithFallback');

const router = express.Router();

const languageInstructions = {
  'English': 'Write everything in English.',
  'Hindi': 'Write the intro_quote and full_persona in Hindi (हिन्दी) using Devanagari script. Keep job_title, company_type and city in English.',
  'Tamil': 'Write the intro_quote and full_persona in Tamil (தமிழ்) using Tamil script. Keep job_title, company_type and city in English.',
  'Telugu': 'Write the intro_quote and full_persona in Telugu (తెలుగు) using Telugu script. Keep job_title, company_type and city in English.',
  'Kannada': 'Write the intro_quote and full_persona in Kannada (ಕನ್ನಡ) using Kannada script. Keep job_title, company_type and city in English.',
  'Bengali': 'Write the intro_quote and full_persona in Bengali (বাংলা) using Bengali script. Keep job_title, company_type and city in English.',
}

// POST /api/futures/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const profileResult = await pool.query(
      `SELECT u.name, u.mode, p.*
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    );
    const profile = profileResult.rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const language = profile.preferred_language || 'English'
    const langInstruction = languageInstructions[language] || languageInstructions['English']

    const prompt = `You are a career simulation AI. Based on this student's profile, generate exactly 3 distinct, realistic future career paths for them 5 years from now (year 2031).

Student Profile:
- Name: ${profile.name}
- Currently studying/working in: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}
- Biggest fear: ${profile.biggest_fear || 'not specified'}
- Mode: ${profile.mode}
- Preferred language: ${language}

LANGUAGE INSTRUCTION — CRITICAL:
${langInstruction}

Generate 3 different future paths grounded in real Indian companies, cities, and realistic salary ranges. Return a JSON array of 3 objects with these exact fields:
- path_index: 0, 1, or 2
- job_title: specific job title (always in English)
- company_type: type of company — reference real Indian company types or names where relevant (always in English)
- city: a real Indian city (always in English)
- salary_min: realistic monthly salary in INR for this role and city (number only)
- salary_max: realistic monthly salary in INR for this role and city (number only)
- year: 2031
- intro_quote: a powerful 1-sentence quote this future self would say (first person, emotional, confident) — write this in ${language}
- full_persona: 200-word description of this future self's life, daily work, wins, and one honest struggle they overcame — write this in ${language}
- resonance_score: a number between 60-95 representing how much this path resonates with the student's stated dreams

Return ONLY a valid JSON array. No markdown, no explanation. No extra text.`;

    const completion = await groqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2500
    });

    let futures;
    try {
      const raw = completion.choices[0].message.content.trim();
      futures = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error', raw: completion.choices[0].message.content });
    }

    await pool.query('DELETE FROM future_selves WHERE user_id=$1', [req.user.id]);

    const saved = [];
    for (const f of futures) {
      const result = await pool.query(
        `INSERT INTO future_selves
          (user_id, path_index, job_title, company_type, city, year,
           salary_min, salary_max, intro_quote, full_persona, resonance_score)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         RETURNING *`,
        [req.user.id, f.path_index, f.job_title, f.company_type,
         f.city, f.year || 2031, f.salary_min, f.salary_max,
         f.intro_quote, f.full_persona, f.resonance_score || 75]
      );
      saved.push(result.rows[0]);
    }

    res.json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/futures
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM future_selves WHERE user_id=$1 ORDER BY path_index',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/futures/:id/choose
router.patch('/:id/choose', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'UPDATE future_selves SET is_chosen=false WHERE user_id=$1', [req.user.id]
    );
    const result = await pool.query(
      'UPDATE future_selves SET is_chosen=true WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
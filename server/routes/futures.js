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

    // Pull free text story if available
    const freeText = profile.free_text_story || profile.heart_dump || null

    const prompt = `You are a career simulation AI. Based on this student's COMPLETE and SPECIFIC profile, generate exactly 3 distinct, realistic future career paths for them 5 years from now (year 2031).

CRITICAL RULE — READ THIS FIRST:
You must build these futures DIRECTLY from what this specific student has told you. Do NOT generate a generic Indian tech career template. Do NOT default to "started at Infosys" or "corporate ladder" unless the student explicitly said they want that. Every detail of the future self must be a logical, honest extension of THIS student's actual words, personality, fears, and aspirations.

If the student says they hate corporate — their future self is NOT in corporate.
If the student says they love building products — their future self is building something.
If the student says they're good at communication — that shows up in their role.
If the student has a non-traditional path — the future self reflects that, not a sanitized version.

Student's COMPLETE Profile:
- Name: ${profile.name}
- Currently studying: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}
- Biggest fear: ${profile.biggest_fear || 'not specified'}
- Biggest blocker: ${profile.biggest_blocker || 'not specified'}
- Success vision: ${profile.success_vision || 'not specified'}
- Built anything before: ${profile.built_anything || 'not specified'}
- City: ${profile.city || 'not specified'}
- Education: ${profile.education_level || 'not specified'}
- Hours available per day: ${profile.hours_per_day || 'not specified'}
- Recent rejection: ${profile.recent_rejection || 'none'}
- Mode they came in as: ${profile.mode || 'not specified'}
${freeText ? `- In their own words (free text they wrote): "${freeText}"` : ''}

GROUNDING RULES:
- The 3 paths must represent genuinely different directions — not just the same path at different companies
- One path should be the most aligned with what they explicitly said they want
- One path should be a realistic adjacent pivot they haven't considered
- One path should be the most ambitious version of their stated dream
- All paths must feel earned — show the struggle, the small steps, the real journey — not an overnight success
- Salary ranges must be realistic for their city and role in the Indian market in 2031
- Company types must reflect the actual Indian ecosystem for their field
- The full_persona must mention at least ONE specific thing from their profile — a fear they overcame, something they built, a skill they mentioned

LANGUAGE INSTRUCTION — CRITICAL:
${langInstruction}

Return a JSON array of 3 objects with these exact fields:
- path_index: 0, 1, or 2
- job_title: specific job title (always in English)
- company_type: type of company (always in English)
- city: a real Indian city (always in English)
- salary_min: realistic monthly salary in INR (number only)
- salary_max: realistic monthly salary in INR (number only)
- year: 2031
- intro_quote: a powerful 1-sentence quote this future self would say — raw, honest, specific to their journey, NOT generic inspiration (write in ${language})
- full_persona: 200-word description of this future self's daily life, work, one real struggle they overcame, and one thing they wish they'd known — must feel like a REAL person, not a LinkedIn post (write in ${language})
- resonance_score: 60-95, how much this path aligns with their stated dreams

Return ONLY a valid JSON array. No markdown, no explanation.`;

    const completion = await groqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.85,
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
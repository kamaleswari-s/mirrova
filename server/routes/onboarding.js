const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { groqWithFallback } = require('../utils/groqWithFallback');

const router = express.Router();

// POST /api/onboarding/save
router.post('/save', authMiddleware, async (req, res) => {
  const {
    current_field, dream_direction, top_skill,
    biggest_fear, recent_rejection, success_vision,
    resume_text, preferred_language,
    city, education_level, hours_per_day,
    built_anything, biggest_blocker,
    college_name, heart_dump
  } = req.body;

  try {
    await pool.query(
      `UPDATE profiles SET
        current_field=$1, dream_direction=$2, top_skill=$3,
        biggest_fear=$4, recent_rejection=$5, success_vision=$6,
        resume_text=$7, onboarding_complete=true,
        preferred_language=$8,
        city=$9, education_level=$10, hours_per_day=$11,
        built_anything=$12, biggest_blocker=$13,
        college_name=$14, heart_dump=$15,
        updated_at=NOW()
       WHERE user_id=$16`,
      [current_field, dream_direction, top_skill,
       biggest_fear, recent_rejection, success_vision,
       resume_text, preferred_language || 'English',
       city, education_level, hours_per_day,
       built_anything, biggest_blocker,
       college_name, heart_dump,
       req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/onboarding/extract
router.post('/extract', authMiddleware, async (req, res) => {
  const { text, language } = req.body;
  if (!text) return res.status(400).json({ error: 'Text required' });

  try {
    const prompt = `You are a career intelligence AI. A student has shared their story freely and honestly. Your job is to deeply understand them from their own words — not to guess or fill in generic answers.

Student's story:
"${text}"

Extract everything they mentioned and return a JSON object. Use null for anything genuinely not mentioned — do NOT guess or fill in defaults:
{
  "current_field": "<exactly what they study or work in — use their words>",
  "dream_direction": "<exactly what they said they want — even if it's vague or unconventional>",
  "top_skill": "<the skill they mentioned or that is clearly evident from their story>",
  "biggest_fear": "<their exact fear in their own words>",
  "recent_rejection": "<any rejection they mentioned, or null>",
  "success_vision": "<what success looks like to them — use their words>",
  "city": "<city or state they mentioned, or null>",
  "education_level": "<their education level and college if mentioned>",
  "hours_per_day": "<hours available to upskill if mentioned, or null>",
  "built_anything": "<projects, businesses, events they mentioned building>",
  "biggest_blocker": "<what is blocking them — use their exact words>",
  "college_name": "<college name if mentioned, or null>",
  "summary": "<2-3 sentence summary of who this student really is, based only on what they said — honest, specific, not generic>",
  "confidence": <number 0-100, how much of the profile you could fill from their story>
}

CRITICAL: The dream_direction and biggest_blocker must reflect what they ACTUALLY said. If they said they hate coding, that must show up. If they want a government job, that must show up. If they want to build things, that must show up. Do not sanitize or professionalize their answers.

Return ONLY valid JSON. No markdown.`

    const completion = await groqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 1000
    });

    let result;
    try {
      const raw = completion.choices[0].message.content.trim();
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error' });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/onboarding/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id=$1', [req.user.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
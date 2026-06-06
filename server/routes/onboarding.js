const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/onboarding/save
router.post('/save', authMiddleware, async (req, res) => {
  const {
    current_field, dream_direction, top_skill,
    biggest_fear, recent_rejection, success_vision,
    resume_text, preferred_language,
    city, education_level, hours_per_day,
    built_anything, biggest_blocker
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
        updated_at=NOW()
       WHERE user_id=$14`,
      [current_field, dream_direction, top_skill,
       biggest_fear, recent_rejection, success_vision,
       resume_text, preferred_language || 'English',
       city, education_level, hours_per_day,
       built_anything, biggest_blocker,
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
    const prompt = `You are a career intelligence AI. A student has shared their thoughts freely. Extract their career profile from this text.

Student's text (in ${language || 'English'}):
"${text}"

Extract all available information and return a JSON object. Use null for anything not mentioned:
{
  "current_field": "<what they study or work in>",
  "dream_direction": "<what they want to do>",
  "top_skill": "<their strongest skill>",
  "biggest_fear": "<their biggest fear about their future>",
  "recent_rejection": "<any rejection they mentioned>",
  "success_vision": "<what success looks like to them>",
  "city": "<city or state they mentioned>",
  "education_level": "<their education level and college>",
  "hours_per_day": "<hours available to upskill>",
  "built_anything": "<projects, businesses, events they built>",
  "biggest_blocker": "<what is blocking them right now>",
  "summary": "<2-3 sentence summary of what you understood about this student in ${language || 'English'}>",
  "confidence": <number 0-100, how confident you are in the extraction>
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/onboarding/discover
router.post('/discover', authMiddleware, async (req, res) => {
  const { time_flies, people_ask, life_vision, language } = req.body;
  try {
    const prompt = `You are a compassionate career intelligence AI helping a student who doesn't know what they want to do with their life.

Their answers:
- Activities where time flies: ${time_flies}
- What people come to them for help with: ${people_ask}
- Kind of life they want: ${life_vision}

Based on these 3 answers, suggest 3 possible career directions that would genuinely suit this student. Be specific to India's job market.

Return JSON:
{
  "directions": [
    {
      "title": "<specific career direction e.g. UX Designer, Content Strategist, Data Analyst>",
      "why": "<2 sentences explaining why this fits them based on their answers in ${language || 'English'}>",
      "market": "<one sentence about job market for this in India in ${language || 'English'}>",
      "first_step": "<the single most important first step they can take this week in ${language || 'English'}>"
    },
    {
      "title": "...",
      "why": "...",
      "market": "...",
      "first_step": "..."
    },
    {
      "title": "...",
      "why": "...",
      "market": "...",
      "first_step": "..."
    }
  ],
  "insight": "<one powerful insight about this student based on their 3 answers in ${language || 'English'}>"
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1200
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
    res.status(500).json({ error: 'Server error' });
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
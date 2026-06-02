const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompts = {
  English: `You are a brutally honest career intelligence AI. You analyze a student's profile and give them a Reality Check Score — not to demotivate them, but to show them exactly where they stand and what to do next. Be direct, specific, data-driven. No fluff.`,
  Hindi: `आप एक बेहद ईमानदार career intelligence AI हैं। आप एक student की profile analyze करके उन्हें Reality Check Score देते हैं — उन्हें demotivate करने के लिए नहीं, बल्कि यह दिखाने के लिए कि वे कहाँ खड़े हैं और आगे क्या करना है। Direct, specific और data-driven रहें।`,
  Tamil: `நீங்கள் ஒரு மிகவும் நேர்மையான career intelligence AI. ஒரு மாணவரின் profile-ஐ analyze செய்து Reality Check Score கொடுக்கிறீர்கள் — அவர்களை demotivate செய்வதற்காக அல்ல, அவர்கள் எங்கே நிற்கிறார்கள் என்பதை காட்டுவதற்காக.`,
  Telugu: `మీరు చాలా నిజాయితీగా ఉన్న career intelligence AI. ఒక విద్యార్థి యొక్క profile ని విశ్లేషించి Reality Check Score ఇస్తారు — వారిని demotivate చేయడానికి కాదు, వారు ఎక్కడ నిలబడ్డారో చూపించడానికి.`,
  Kannada: `ನೀವು ತುಂಬಾ ಪ್ರಾಮಾಣಿಕ career intelligence AI. ಒಬ್ಬ ವಿದ್ಯಾರ್ಥಿಯ profile ಅನ್ನು analyze ಮಾಡಿ Reality Check Score ಕೊಡುತ್ತೀರಿ — ಅವರನ್ನು demotivate ಮಾಡಲು ಅಲ್ಲ, ಅವರು ಎಲ್ಲಿ ನಿಂತಿದ್ದಾರೆ ಎಂದು ತೋರಿಸಲು.`,
  Bengali: `আপনি একটি সৎ career intelligence AI। একজন ছাত্রের profile বিশ্লেষণ করে Reality Check Score দেন — তাদের demotivate করতে নয়, তারা কোথায় আছে তা দেখাতে।`,
}

// POST /api/realitycheck/generate
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
    const systemPrompt = systemPrompts[language] || systemPrompts['English']

    const prompt = `Analyze this student's profile and generate a Reality Check Score.

Student Profile:
- Name: ${profile.name}
- Currently studying: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}
- Biggest fear: ${profile.biggest_fear || 'not specified'}
- Recent rejection: ${profile.recent_rejection || 'none mentioned'}
- Success vision: ${profile.success_vision || 'not specified'}

Generate a brutally honest reality check. Return a JSON object with these exact fields:

{
  "overall_score": <number 0-100>,
  "score_label": "<one of: Critical, Needs Work, Average, Good, Strong>",
  "headline": "<one punchy sentence summarizing their reality in ${language}>",
  "market_reality": "<2-3 sentences about the actual job market for their dream direction in India in ${language}>",
  "biggest_gap": "<the single most critical skill or experience gap blocking them in ${language}>",
  "hidden_strength": "<one genuine strength they may be undervaluing in ${language}>",
  "brutal_truth": "<one thing nobody is telling them that they need to hear in ${language}>",
  "this_week_action": "<the single most important thing they should do THIS WEEK in ${language}>",
  "dimensions": [
    { "label": "Skill Match", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Market Demand", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Clarity of Direction", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Action Readiness", "score": <0-100>, "note": "<brief note in ${language}>" }
  ]
}

Return ONLY valid JSON. No markdown. No explanation.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    let result;
    try {
      const raw = completion.choices[0].message.content.trim();
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error', raw: completion.choices[0].message.content });
    }

    // Save to DB
    await pool.query(
      `UPDATE profiles SET reality_check=$1, updated_at=NOW() WHERE user_id=$2`,
      [JSON.stringify(result), req.user.id]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/realitycheck
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT reality_check FROM profiles WHERE user_id=$1',
      [req.user.id]
    );
    const rc = result.rows[0]?.reality_check;
    if (!rc) return res.json(null);
    res.json(typeof rc === 'string' ? JSON.parse(rc) : rc);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
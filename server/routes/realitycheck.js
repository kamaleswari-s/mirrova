const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { groqWithFallback } = require('../utils/groqWithFallback');

const router = express.Router();

const systemPrompts = {
  English: `You are a brutally honest career intelligence AI for Indian students. You analyze a student's profile and give them a Reality Check Score — not to demotivate them, but to show them exactly where they stand and what to do next. Be direct, specific, data-driven. No fluff. Every student's score MUST be unique based on their specific profile — never give the same score twice.`,
  Hindi: `आप एक बेहद ईमानदार career intelligence AI हैं। हर student का score उनकी unique profile के आधार पर अलग होना चाहिए।`,
  Tamil: `நீங்கள் ஒரு மிகவும் நேர்மையான career intelligence AI. ஒவ்வொரு மாணவரின் score அவர்களின் தனித்துவமான profile-ஐ அடிப்படையாகக் கொண்டு வேறுபட வேண்டும்.`,
  Telugu: `మీరు చాలా నిజాయితీగా ఉన్న career intelligence AI. ప్రతి విద్యార్థి యొక్క score వారి unique profile ఆధారంగా భిన్నంగా ఉండాలి.`,
  Kannada: `ನೀವು ತುಂಬಾ ಪ್ರಾಮಾಣಿಕ career intelligence AI. ಪ್ರತಿ ವಿದ್ಯಾರ್ಥಿಯ score ಅವರ unique profile ಆಧಾರದಲ್ಲಿ ಭಿನ್ನವಾಗಿರಬೇಕು.`,
  Bengali: `আপনি একটি সৎ career intelligence AI। প্রতিটি ছাত্রের score তাদের unique profile এর উপর ভিত্তি করে আলাদা হওয়া উচিত।`,
}

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

    let skillsData = null
    if (profile.skills_assessment) {
      try {
        const sa = typeof profile.skills_assessment === 'string'
          ? JSON.parse(profile.skills_assessment)
          : profile.skills_assessment
        skillsData = sa.ratings || null
      } catch (e) {}
    }

    const skillsText = skillsData
      ? Object.entries(skillsData)
          .map(([skill, rating]) => {
            const labels = ['', 'Beginner', 'Familiar', 'Confident', 'Expert']
            return `${skill}: ${labels[rating] || rating}`
          })
          .join(', ')
      : 'Not assessed yet'

    const prompt = `Analyze this student's COMPLETE profile and generate a personalized Reality Check Score.

IMPORTANT: Base the score STRICTLY on this specific student's profile. The score must reflect their unique situation.

Student Profile:
- Name: ${profile.name}
- Currently studying: ${profile.current_field || 'not specified'}
- Dream direction: ${profile.dream_direction || 'not specified'}
- Top skill: ${profile.top_skill || 'not specified'}
- Biggest fear: ${profile.biggest_fear || 'not specified'}
- Recent rejection: ${profile.recent_rejection || 'none mentioned'}
- Success vision: ${profile.success_vision || 'not specified'}
- City/State: ${profile.city || 'not specified'}
- Education level & college: ${profile.education_level || 'not specified'}
- Hours per day available: ${profile.hours_per_day || 'not specified'}
- Built anything before: ${profile.built_anything || 'nothing mentioned'}
- Biggest blocker right now: ${profile.biggest_blocker || 'not specified'}
- Self-assessed skills: ${skillsText}

Scoring guide (be strict and honest):
- 0-30: Critical — major gaps, no direction, needs immediate intervention
- 31-50: Needs Work — some direction but significant gaps
- 51-70: Average — on track but missing key elements
- 71-85: Good — strong foundation with minor gaps
- 86-100: Strong — exceptional readiness

Consider:
- College tier matters (IIT/NIT vs private Tier 3 = different market reality)
- City matters (metro vs rural = different opportunities)
- Hours available matters (1hr/day vs 4hrs/day = different timeline)
- Built anything = huge positive signal
- Self-assessed skills reveal real capability gaps
- Biggest blocker reveals hidden challenges

Return ONLY valid JSON:
{
  "overall_score": <number 0-100>,
  "score_label": "<Critical/Needs Work/Average/Good/Strong>",
  "headline": "<one punchy sentence in ${language}>",
  "market_reality": "<2-3 sentences about actual job market for their dream in India in ${language}>",
  "biggest_gap": "<most critical gap in ${language}>",
  "hidden_strength": "<genuine undervalued strength in ${language}>",
  "brutal_truth": "<one thing nobody tells them in ${language}>",
  "this_week_action": "<most important thing to do THIS WEEK in ${language}>",
  "dimensions": [
    { "label": "Skill Match", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Market Demand", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Clarity of Direction", "score": <0-100>, "note": "<brief note in ${language}>" },
    { "label": "Action Readiness", "score": <0-100>, "note": "<brief note in ${language}>" }
  ]
}

Return ONLY valid JSON. No markdown. No explanation.`

    const completion = await groqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.9,
      max_tokens: 1500,
      systemExtra: systemPrompt
    });

    let result;
    try {
      const raw = completion.choices[0].message.content.trim();
      result = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error', raw: completion.choices[0].message.content });
    }

    await pool.query(
      `UPDATE profiles SET reality_check=$1, updated_at=NOW() WHERE user_id=$2`,
      [JSON.stringify(result), req.user.id]
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

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
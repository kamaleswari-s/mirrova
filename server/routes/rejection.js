const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const systemPrompts = {
  English: `You are a brutally honest career forensics AI. You analyze rejection emails and experiences to find the REAL reason someone was rejected — not the polite HR reason, but the actual truth. You are direct, specific, and actionable. No fluff. No false comfort.`,
  Hindi: `आप एक बेहद ईमानदार career forensics AI हैं। आप rejection emails और अनुभवों का विश्लेषण करके असली कारण बताते हैं — HR का polite कारण नहीं, बल्कि असली सच्चाई।`,
  Tamil: `நீங்கள் ஒரு மிகவும் நேர்மையான career forensics AI. நீங்கள் rejection emails மற்றும் அனுபவங்களை பகுப்பாய்வு செய்து உண்மையான காரணத்தை கண்டுபிடிக்கிறீர்கள்.`,
  Telugu: `మీరు చాలా నిజాయితీగా ఉన్న career forensics AI. మీరు rejection emails మరియు అనుభవాలను విశ్లేషించి నిజమైన కారణాన్ని కనుగొంటారు.`,
  Kannada: `ನೀವು ತುಂಬಾ ಪ್ರಾಮಾಣಿಕ career forensics AI. ನೀವು rejection emails ಮತ್ತು ಅನುಭವಗಳನ್ನು ವಿಶ್ಲೇಷಿಸಿ ನಿಜವಾದ ಕಾರಣವನ್ನು ಕಂಡುಹಿಡಿಯುತ್ತೀರಿ.`,
  Bengali: `আপনি একটি সৎ career forensics AI। আপনি rejection emails এবং অভিজ্ঞতা বিশ্লেষণ করে আসল কারণ খুঁজে বের করেন।`,
}

// POST /api/rejection/analyze
router.post('/analyze', authMiddleware, async (req, res) => {
  const { rejection_text, rejection_type, company, role } = req.body
  if (!rejection_text) return res.status(400).json({ error: 'Rejection text required' })

  try {
    const profileResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, p.preferred_language
       FROM users u JOIN profiles p ON p.user_id=u.id
       WHERE u.id=$1`, [req.user.id]
    )
    const profile = profileResult.rows[0]
    const language = profile?.preferred_language || 'English'
    const systemPrompt = systemPrompts[language] || systemPrompts['English']

    const prompt = `Analyze this rejection and give a brutally honest forensic breakdown.

Student Profile:
- Name: ${profile?.name}
- Current field: ${profile?.current_field || 'not specified'}
- Dream direction: ${profile?.dream_direction || 'not specified'}
- Top skill: ${profile?.top_skill || 'not specified'}

Rejection Details:
- Type: ${rejection_type || 'not specified'} (resume screening / interview / assessment / offer stage)
- Company: ${company || 'not specified'}
- Role: ${role || 'not specified'}
- What happened / rejection email content:
${rejection_text}

Give a forensic breakdown in ${language}. Return a JSON object:
{
  "rejection_stage": "<where exactly they were rejected: Resume Screening / Phone Screen / Technical Round / HR Round / Final Round / Offer Negotiation>",
  "real_reason": "<the actual honest reason they were rejected — not the polite HR version. Be specific in ${language}>",
  "what_they_said_vs_reality": "<what the rejection email said vs what it actually means in ${language}>",
  "pattern_warning": "<if this seems like a recurring pattern the student should watch out for in ${language}>",
  "top_3_fixes": [
    {"fix": "<specific actionable fix 1 in ${language}>", "timeline": "<how long to implement>", "impact": "<High/Medium/Low>"},
    {"fix": "<specific actionable fix 2 in ${language}>", "timeline": "<how long to implement>", "impact": "<High/Medium/Low>"},
    {"fix": "<specific actionable fix 3 in ${language}>", "timeline": "<how long to implement>", "impact": "<High/Medium/Low>"}
  ],
  "brutal_truth": "<one thing nobody is telling them that they MUST hear in ${language}>",
  "silver_lining": "<one genuine positive or learning from this rejection in ${language}>",
  "next_application_checklist": ["<specific thing to do before next application 1>", "<thing 2>", "<thing 3>"]
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1500
    })

    let result
    try {
      const raw = completion.choices[0].message.content.trim()
      result = JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch (e) {
      return res.status(500).json({ error: 'AI parse error' })
    }

    // Save to DB
    await pool.query(
      `UPDATE profiles SET reality_check=COALESCE(reality_check, '{}'::jsonb) WHERE user_id=$1`,
      [req.user.id]
    )

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router;
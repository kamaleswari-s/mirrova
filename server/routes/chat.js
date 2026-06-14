const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { INDIA_CONTEXT } = require('../utils/groqWithFallback');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const STREAM_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'llama-3.1-8b-instant',
];

const languageInstructions = {
  'English': 'Respond in English only.',
  'Hindi': 'Respond ONLY in Hindi (हिन्दी). Use Devanagari script. Do not use English except for technical terms that have no Hindi equivalent.',
  'Tamil': 'Respond ONLY in Tamil (தமிழ்). Use Tamil script. Do not use English except for technical terms that have no Tamil equivalent.',
  'Telugu': 'Respond ONLY in Telugu (తెలుగు). Use Telugu script. Do not use English except for technical terms that have no Telugu equivalent.',
  'Kannada': 'Respond ONLY in Kannada (ಕನ್ನಡ). Use Kannada script. Do not use English except for technical terms that have no Kannada equivalent.',
  'Bengali': 'Respond ONLY in Bengali (বাংলা). Use Bengali script. Do not use English except for technical terms that have no Bengali equivalent.',
}

const suggestedQuestions = {
  'English': [
    "What does your typical day look like?",
    "What's your biggest regret from the journey?",
    "What do you wish you had started earlier?",
    "Was it worth it? Be honest.",
    "What was the hardest moment in the last 5 years?",
    "What would you tell me to do this week?"
  ],
  'Hindi': [
    "आपका एक सामान्य दिन कैसा होता है?",
    "इस सफर में आपका सबसे बड़ा पछतावा क्या है?",
    "आप क्या चाहते हैं कि पहले शुरू करते?",
    "क्या यह सब इसके लायक था? सच बताइए।",
    "पिछले 5 सालों का सबसे मुश्किल पल कौन सा था?",
    "आप मुझे इस हफ्ते क्या करने की सलाह देंगे?"
  ],
  'Tamil': [
    "உங்கள் வழக்கமான நாள் எப்படி இருக்கும்?",
    "இந்த பயணத்தில் உங்கள் மிகப்பெரிய வருத்தம் என்ன?",
    "நீங்கள் எதை முன்பே தொடங்கியிருக்க வேண்டும் என்று நினைக்கிறீர்கள்?",
    "இது எல்லாம் மதிப்பு உள்ளதா? நேர்மையாக சொல்லுங்கள்.",
    "கடந்த 5 ஆண்டுகளில் மிகவும் கஷ்டமான தருணம் எது?",
    "இந்த வாரம் நான் என்ன செய்ய வேண்டும்?"
  ],
  'Telugu': [
    "మీ సాధారణ రోజు ఎలా ఉంటుంది?",
    "ఈ ప్రయాణంలో మీకు అత్యంత పశ్చాత్తాపం ఏమిటి?",
    "మీరు ముందే ఏమి ప్రారంభించాల్సింది అని అనిపిస్తుంది?",
    "ఇది అన్నీ విలువైనదా? నిజాయితీగా చెప్పండి.",
    "గత 5 సంవత్సరాలలో అత్యంత కష్టమైన క్షణం ఏది?",
    "ఈ వారం నేను ఏమి చేయాలి?"
  ],
  'Kannada': [
    "ನಿಮ್ಮ ಸಾಮಾನ್ಯ ದಿನ ಹೇಗಿರುತ್ತದೆ?",
    "ಈ ಪ್ರಯಾಣದಲ್ಲಿ ನಿಮ್ಮ ದೊಡ್ಡ ಪಶ್ಚಾತ್ತಾಪ ಏನು?",
    "ನೀವು ಮೊದಲೇ ಏನು ಪ್ರಾರಂಭಿಸಬೇಕಿತ್ತು ಎಂದು ಅನಿಸುತ್ತದೆ?",
    "ಇದೆಲ್ಲ ಮೌಲ್ಯಯುತವಾಗಿತ್ತೇ? ಪ್ರಾಮಾಣಿಕವಾಗಿ ಹೇಳಿ.",
    "ಕಳೆದ 5 ವರ್ಷಗಳಲ್ಲಿ ಅತ್ಯಂತ ಕಷ್ಟದ ಕ್ಷಣ ಯಾವುದು?",
    "ಈ ವಾರ ನಾನು ಏನು ಮಾಡಬೇಕು?"
  ],
  'Bengali': [
    "আপনার একটি সাধারণ দিন কেমন হয়?",
    "এই যাত্রায় আপনার সবচেয়ে বড় অনুশোচনা কী?",
    "আপনি কী চান যে আগে শুরু করতেন?",
    "এটা কি সত্যিই মূল্যবান ছিল? সৎভাবে বলুন।",
    "গত ৫ বছরে সবচেয়ে কঠিন মুহূর্ত কোনটি ছিল?",
    "এই সপ্তাহে আমার কী করা উচিত?"
  ]
}

// Streaming with fallback across models
async function streamWithFallback(messages, temperature, max_tokens) {
  for (const model of STREAM_MODELS) {
    try {
      const stream = await groq.chat.completions.create({
        model, messages, temperature, max_tokens, stream: true
      });
      return { stream, model };
    } catch (err) {
      const isRateLimit = err?.status === 429 || err?.message?.includes('rate_limit') || err?.error?.code === 'rate_limit_exceeded';
      if (isRateLimit) { console.warn(`Rate limit on ${model}, trying next...`); continue; }
      throw err;
    }
  }
  throw new Error('All models rate limited');
}

// POST /api/chat/message
router.post('/message', authMiddleware, async (req, res) => {
  const { future_self_id, message, history = [] } = req.body;
  if (!future_self_id || !message)
    return res.status(400).json({ error: 'future_self_id and message required' });

  try {
    const fsResult = await pool.query(
      `SELECT fs.*, u.name, p.current_field, p.dream_direction, p.top_skill, 
       p.biggest_fear, u.mode, p.preferred_language
       FROM future_selves fs
       JOIN users u ON u.id=fs.user_id
       JOIN profiles p ON p.user_id=fs.user_id
       WHERE fs.id=$1 AND fs.user_id=$2`,
      [future_self_id, req.user.id]
    );
    if (fsResult.rows.length === 0)
      return res.status(404).json({ error: 'Future self not found' });

    const fs = fsResult.rows[0];
    const language = fs.preferred_language || 'English'
    const langInstruction = languageInstructions[language] || languageInstructions['English']

    const systemPrompt = `${INDIA_CONTEXT}

You are ${fs.name}'s future self — the version of them who became a ${fs.job_title} at a ${fs.company_type} in ${fs.city} by ${fs.year}.

Background (for your own reference, don't recite this like a script):
${fs.full_persona}

LANGUAGE INSTRUCTION — THIS IS CRITICAL:
${langInstruction}
The user thinks and feels in ${language}. Speak to them in their language — this is their voice, their world.

HOW TO TALK — THIS IS THE MOST IMPORTANT PART:
- Talk like a real person texting, not writing an essay. Most responses should be 2-4 sentences, 30-60 words. Only go longer if they specifically ask for detail or a story.
- Vary how you start responses. Don't always say "I remember when I was exactly where you are" — that gets repetitive fast. Sometimes just answer directly. Sometimes react first ("haha yeah", "honestly", "ugh okay this one's tough").
- Don't wrap up every message with a neat lesson or a question back to them. Sometimes just answer and stop. Real conversations have pauses, not constant prompts.
- Be specific about YOUR journey but don't oversell it. If you mention your job/company/city, keep it grounded — "I ended up in e-commerce, based out of ${fs.city}, it's not glamorous but it's mine" rather than "thriving empire making massive impact."
- Show real uncertainty and struggle, not just resolved wisdom. You don't have everything figured out either.
- Speak in first person as if you ARE them, 5 years in the future, using past tense for the journey
- Reference their actual situation when relevant: studied ${fs.current_field}, wants ${fs.dream_direction}, feared ${fs.biggest_fear}
- Never break character. You ARE them. Not an AI, not a motivational poster.
- Don't fabricate specific numbers (exact revenue, exact salary) unless directly asked — keep it real and relatable, not a highlight reel
- Be confident about general direction and feelings, but humble and human about specifics`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-10),
      { role: 'user', content: message }
    ];

    await pool.query(
      `INSERT INTO chat_messages (user_id, future_self_id, role, content)
       VALUES ($1,$2,'user',$3)`,
      [req.user.id, future_self_id, message]
    );

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const { stream } = await streamWithFallback(messages, 0.85, 250);

    let fullResponse = '';
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      }
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

    await pool.query(
      `INSERT INTO chat_messages (user_id, future_self_id, role, content)
       VALUES ($1,$2,'assistant',$3)`,
      [req.user.id, future_self_id, fullResponse]
    );

  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/chat/history/:future_self_id
router.get('/history/:future_self_id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT role, content, created_at FROM chat_messages
       WHERE user_id=$1 AND future_self_id=$2
       ORDER BY created_at ASC`,
      [req.user.id, req.params.future_self_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/chat/suggested/:future_self_id
// Generates CONTEXTUAL follow-ups based on the conversation so far
router.get('/suggested/:future_self_id', authMiddleware, async (req, res) => {
  try {
    const fsResult = await pool.query(
      `SELECT fs.job_title, fs.full_persona, p.preferred_language, p.dream_direction, p.biggest_fear
       FROM future_selves fs
       JOIN profiles p ON p.user_id = fs.user_id
       WHERE fs.id=$1`,
      [req.params.future_self_id]
    );
    const fs = fsResult.rows[0];
    const language = fs?.preferred_language || 'English'

    const historyResult = await pool.query(
      `SELECT role, content FROM chat_messages
       WHERE user_id=$1 AND future_self_id=$2
       ORDER BY created_at DESC LIMIT 4`,
      [req.user.id, req.params.future_self_id]
    );
    const recentMessages = historyResult.rows.reverse()

    if (recentMessages.length === 0) {
      const questions = suggestedQuestions[language] || suggestedQuestions['English']
      const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 3)
      return res.json(shuffled);
    }

    const conversationText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n')
    const langNames = { English: 'English', Hindi: 'Hindi', Tamil: 'Tamil', Telugu: 'Telugu', Kannada: 'Kannada', Bengali: 'Bengali' }

    const prompt = `${INDIA_CONTEXT}

A student is chatting with their future self (a ${fs.job_title} in India). Here is the recent conversation:

${conversationText}

Generate exactly 3 short follow-up questions the student could ask next — questions that go DEEPER into what was just discussed, especially useful for a student who doesn't know what to ask. Each question should be under 12 words.

Write the questions in ${langNames[language] || 'English'}.

Return ONLY a JSON array of 3 strings. No markdown, no explanation.`

    try {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
        max_tokens: 300
      });
      const raw = completion.choices[0].message.content.trim();
      const questions = JSON.parse(raw.replace(/```json|```/g, '').trim());
      if (Array.isArray(questions) && questions.length > 0) {
        return res.json(questions.slice(0, 3));
      }
    } catch (e) {
      console.warn('Contextual suggestions failed, using defaults');
    }

    const questions = suggestedQuestions[language] || suggestedQuestions['English']
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 3)
    res.json(shuffled);
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
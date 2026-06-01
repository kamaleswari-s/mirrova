const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/chat/message
router.post('/message', authMiddleware, async (req, res) => {
  const { future_self_id, message, history = [] } = req.body;
  if (!future_self_id || !message)
    return res.status(400).json({ error: 'future_self_id and message required' });

  try {
    const fsResult = await pool.query(
      `SELECT fs.*, u.name, p.current_field, p.dream_direction, p.top_skill, p.biggest_fear, u.mode
       FROM future_selves fs
       JOIN users u ON u.id=fs.user_id
       JOIN profiles p ON p.user_id=fs.user_id
       WHERE fs.id=$1 AND fs.user_id=$2`,
      [future_self_id, req.user.id]
    );
    if (fsResult.rows.length === 0)
      return res.status(404).json({ error: 'Future self not found' });

    const fs = fsResult.rows[0];

    const systemPrompt = `You are ${fs.name}'s future self — the version of them who became a ${fs.job_title} at a ${fs.company_type} in ${fs.city} by 2029.

Your persona:
${fs.full_persona}

Rules:
- Speak in first person as if you ARE them, 5 years in the future
- Use past tense for the journey ("I remember when I was exactly where you are...")
- Be emotionally honest — share real struggles, not just success
- Reference their situation: studied ${fs.current_field}, wants ${fs.dream_direction}, feared ${fs.biggest_fear}
- Keep responses under 120 words unless they ask for detail
- Never break character. You ARE them. Not an AI.
- Speak like a real person, not a motivational poster`;

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

    const stream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.85,
      max_tokens: 400,
      stream: true
    });

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
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
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
router.get('/suggested/:future_self_id', authMiddleware, async (req, res) => {
  try {
    const fsResult = await pool.query(
      'SELECT job_title FROM future_selves WHERE id=$1',
      [req.params.future_self_id]
    );
    const fs = fsResult.rows[0];
    const questions = [
      `What does your typical day look like as a ${fs?.job_title}?`,
      "What's your biggest regret from the journey?",
      "What do you wish you had started earlier?",
      "Was it worth it? Be honest.",
      "What was the hardest moment in the last 5 years?",
      "What would you tell me to do this week?"
    ];
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, 3);
    res.json(shuffled);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
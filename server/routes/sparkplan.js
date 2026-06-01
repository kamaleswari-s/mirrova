const express = require('express');
const Groq = require('groq-sdk');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/sparkplan/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const dataResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, p.biggest_fear,
              fs.job_title, fs.company_type, fs.id as future_self_id
       FROM users u
       JOIN profiles p ON p.user_id=u.id
       LEFT JOIN future_selves fs ON fs.user_id=u.id AND fs.is_chosen=true
       WHERE u.id=$1 LIMIT 1`,
      [req.user.id]
    );
    const data = dataResult.rows[0];

    const prompt = `Create a 90-day action spark plan for a student transitioning from ${data.current_field} toward becoming a ${data.job_title || data.dream_direction}.

Their strongest skill is ${data.top_skill}.

Return ONLY valid JSON:
{
  "month1_theme": "Build Foundation",
  "month2_theme": "Create Proof",
  "month3_theme": "Put Yourself Out There",
  "tasks": [
    {
      "week": 1,
      "month": 1,
      "title": "specific task title",
      "description": "exact action to take",
      "duration": "estimated time",
      "completed": false
    }
  ]
}

Generate 9 weeks total (weeks 1-9), 3 tasks each week = 27 tasks total.
Make them genuinely useful and progressive.
Return ONLY the JSON. No markdown.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    });

    let plan;
    try {
      const raw = completion.choices[0].message.content.trim();
      plan = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Parse error' });
    }

    await pool.query(
      `INSERT INTO spark_plans (user_id, future_self_id, month1_theme, month2_theme, month3_theme, tasks)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [req.user.id, data.future_self_id,
       plan.month1_theme, plan.month2_theme, plan.month3_theme,
       JSON.stringify(plan.tasks)]
    );

    res.json(plan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// GET /api/sparkplan
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM spark_plans WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.json(null);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/sparkplan/task
router.patch('/task', authMiddleware, async (req, res) => {
  const { week, taskIndex, completed } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, tasks FROM spark_plans WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'No plan found' });

    const plan = result.rows[0];
    const tasks = plan.tasks;
    const weekTasks = tasks.filter(t => t.week === week);
    if (weekTasks[taskIndex]) weekTasks[taskIndex].completed = completed;

    await pool.query(
      'UPDATE spark_plans SET tasks=$1 WHERE id=$2',
      [JSON.stringify(tasks), plan.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sparkplan/checkin
router.post('/checkin', authMiddleware, async (req, res) => {
  const { week_number, rating, note } = req.body;
  try {
    await pool.query(
      'INSERT INTO checkins (user_id, week_number, rating, note) VALUES ($1,$2,$3,$4)',
      [req.user.id, week_number, rating, note]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
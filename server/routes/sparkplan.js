const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const { groqWithFallback } = require('../utils/groqWithFallback');

const router = express.Router();

// POST /api/sparkplan/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const dataResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill, p.biggest_fear,
              p.hours_per_day, p.biggest_blocker, p.city, p.education_level,
              p.skills_assessment, p.reality_check,
              fs.job_title, fs.company_type, fs.id as future_self_id
       FROM users u
       JOIN profiles p ON p.user_id=u.id
       LEFT JOIN future_selves fs ON fs.user_id=u.id AND fs.is_chosen=true
       WHERE u.id=$1 LIMIT 1`,
      [req.user.id]
    );
    const data = dataResult.rows[0];

    let gapData = null
    let criticalGaps = []
    let resumeScore = null

    if (data.skills_assessment) {
      try {
        const sa = typeof data.skills_assessment === 'string'
          ? JSON.parse(data.skills_assessment)
          : data.skills_assessment
        gapData = sa.gap_analysis || null
        criticalGaps = gapData?.critical_gaps?.map(g => g.skill) || []
      } catch (e) {}
    }

    if (data.reality_check) {
      try {
        const rc = typeof data.reality_check === 'string'
          ? JSON.parse(data.reality_check)
          : data.reality_check
        resumeScore = rc.overall_score || null
      } catch (e) {}
    }

    const hoursPerDay = data.hours_per_day || '1-2 hours'
    const targetRole = data.job_title || data.dream_direction || 'target role'

    const prompt = `Create a highly personalized 90-day Spark Plan for this student.

Student Profile:
- Name: ${data.name}
- Current field: ${data.current_field || 'not specified'}
- Target role: ${targetRole}
- Top skill: ${data.top_skill || 'not specified'}
- Biggest fear: ${data.biggest_fear || 'not specified'}
- Biggest blocker: ${data.biggest_blocker || 'not specified'}
- City: ${data.city || 'India'}
- Education: ${data.education_level || 'not specified'}
- Hours available per day: ${hoursPerDay}
- Critical skill gaps identified: ${criticalGaps.length > 0 ? criticalGaps.join(', ') : 'not assessed yet'}
- Reality check score: ${resumeScore ? resumeScore + '/100' : 'not assessed yet'}

IMPORTANT PERSONALIZATION RULES:
- Tasks must be realistic for ${hoursPerDay} per day
- If critical gaps exist (${criticalGaps.join(', ')}), the first month MUST address them
- Tasks should reference their specific target role: ${targetRole}
- Month themes must reflect their actual journey
- Each task must feel like it was written specifically for THIS student
- For each task, provide a specific YouTube search query and a specific free resource search query that would help complete this task
- Include a healthy mix of soft skill tasks (communication, teamwork, problem-solving, time management) alongside technical tasks — not just technical

Return ONLY valid JSON:
{
  "month1_theme": "<theme based on their biggest gap>",
  "month2_theme": "<theme for building proof>",
  "month3_theme": "<theme for getting visible>",
  "tasks": [
    {
      "week": 1,
      "month": 1,
      "title": "<specific task title>",
      "description": "<exact action to take, personalized>",
      "duration": "<realistic time>",
      "why": "<one line: why this matters for becoming ${targetRole}>",
      "skill_type": "<technical OR soft skill>",
      "youtube_query": "<specific 4-6 word YouTube search query>",
      "resource_query": "<specific search query to find free course or certification>",
      "book_query": "<specific search query to find best book>",
      "completed": false
    }
  ]
}

Generate exactly 27 tasks — 3 tasks per week, 9 weeks total.
Make each task genuinely useful, specific, and progressive.
Return ONLY the JSON. No markdown.`

    const completion = await groqWithFallback({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 4000
    });

    let plan;
    try {
      const raw = completion.choices[0].message.content.trim();
      plan = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      return res.status(500).json({ error: 'Parse error' });
    }

    plan.tasks = plan.tasks.map(task => ({
      ...task,
      resources: {
        youtube: {
          label: 'Watch on YouTube',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(task.youtube_query || task.title + ' ' + targetRole)}`,
          icon: '▶️'
        },
        course: {
          label: 'Find free course',
          url: `https://www.google.com/search?q=${encodeURIComponent(task.resource_query || 'free course ' + task.title)}`,
          icon: '🎓'
        },
        book: {
          label: 'Find a book',
          url: `https://www.google.com/search?q=${encodeURIComponent(task.book_query || 'best book ' + task.title)}`,
          icon: '📚'
        }
      }
    }))

    await pool.query('DELETE FROM spark_plans WHERE user_id=$1', [req.user.id]);
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
    res.status(500).json({ error: err.message || 'Server error' });
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
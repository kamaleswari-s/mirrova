const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const Groq = require('groq-sdk');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/teacher/create-class
router.post('/create-class', authMiddleware, async (req, res) => {
  const { class_name, institution } = req.body;
  try {
    // Make user a teacher
    await pool.query('UPDATE users SET role=$1 WHERE id=$2', ['teacher', req.user.id]);
    
    // Generate unique class code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const result = await pool.query(
      `INSERT INTO teacher_classes (teacher_id, class_name, class_code, institution)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, class_name, code, institution]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teacher/classes
router.get('/classes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tc.*, COUNT(ce.id) as student_count
       FROM teacher_classes tc
       LEFT JOIN class_enrollments ce ON ce.class_id = tc.id
       WHERE tc.teacher_id = $1
       GROUP BY tc.id
       ORDER BY tc.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teacher/class/:id/students
router.get('/class/:id/students', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_initials,
              p.current_field, p.dream_direction, p.top_skill,
              p.biggest_fear, p.preferred_language, p.reality_check,
              p.onboarding_complete,
              (SELECT COUNT(*) FROM future_selves fs WHERE fs.user_id = u.id) as futures_count,
              (SELECT COUNT(*) FROM future_selves fs WHERE fs.user_id = u.id AND fs.is_chosen = true) as has_chosen,
              (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_id = u.id) as chat_count,
              sp.month1_theme, sp.month2_theme, sp.month3_theme,
              (SELECT COUNT(*) FROM sparkplan_tasks st 
               JOIN spark_plans sp2 ON sp2.id = st.plan_id 
               WHERE sp2.user_id = u.id AND st.completed = true) as tasks_completed
       FROM class_enrollments ce
       JOIN users u ON u.id = ce.student_id
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN spark_plans sp ON sp.user_id = u.id
       WHERE ce.class_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teacher/class/:id/insights
router.get('/class/:id/insights', authMiddleware, async (req, res) => {
  try {
    const studentsResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, 
              p.top_skill, p.biggest_fear, p.reality_check
       FROM class_enrollments ce
       JOIN users u ON u.id = ce.student_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE ce.class_id = $1`,
      [req.params.id]
    );

    const students = studentsResult.rows;
    if (students.length === 0) {
      return res.json({
        total_students: 0,
        insights: null,
        common_fields: [],
        common_fears: [],
        common_dreams: []
      });
    }

    // Build aggregate profile
    const profileSummary = students.map(s => 
      `${s.name}: studying ${s.current_field || 'unknown'}, dreams of ${s.dream_direction || 'unknown'}, fears ${s.biggest_fear || 'unknown'}`
    ).join('\n');

    const prompt = `You are an educational AI assistant helping a teacher understand their class.

Here are ${students.length} students in this class:
${profileSummary}

Generate class-level insights for the teacher. Return a JSON object with:
{
  "class_summary": "<2-3 sentence overview of the class>",
  "top_skill_gaps": ["gap1", "gap2", "gap3"],
  "common_fears": ["fear1", "fear2"],
  "intervention_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "at_risk_count": <number of students who seem directionless>,
  "ready_count": <number who seem career-ready>,
  "this_week_for_teacher": "<one specific thing the teacher should do this week>"
}

Return ONLY valid JSON. No markdown.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    });

    let insights;
    try {
      const raw = completion.choices[0].message.content.trim();
      insights = JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch (e) {
      insights = null;
    }

    // Aggregate common fields and dreams
    const fields = {};
    const dreams = {};
    students.forEach(s => {
      if (s.current_field) fields[s.current_field] = (fields[s.current_field] || 0) + 1;
      if (s.dream_direction) dreams[s.dream_direction] = (dreams[s.dream_direction] || 0) + 1;
    });

    res.json({
      total_students: students.length,
      insights,
      common_fields: Object.entries(fields).sort((a,b) => b[1]-a[1]).slice(0,5),
      common_dreams: Object.entries(dreams).sort((a,b) => b[1]-a[1]).slice(0,5),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/teacher/join-class (for students)
router.post('/join-class', authMiddleware, async (req, res) => {
  const { class_code } = req.body;
  try {
    const classResult = await pool.query(
      'SELECT * FROM teacher_classes WHERE class_code=$1',
      [class_code.toUpperCase()]
    );
    if (classResult.rows.length === 0)
      return res.status(404).json({ error: 'Class not found. Check the code and try again.' });

    const cls = classResult.rows[0];

    // Check already enrolled
    const existing = await pool.query(
      'SELECT id FROM class_enrollments WHERE class_id=$1 AND student_id=$2',
      [cls.id, req.user.id]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Already enrolled in this class.' });

    await pool.query(
      'INSERT INTO class_enrollments (class_id, student_id) VALUES ($1, $2)',
      [cls.id, req.user.id]
    );

    res.json({ success: true, class_name: cls.class_name, institution: cls.institution });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/teacher/my-classes (for students - classes they joined)
router.get('/my-classes', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tc.class_name, tc.class_code, tc.institution,
              u.name as teacher_name
       FROM class_enrollments ce
       JOIN teacher_classes tc ON tc.id = ce.class_id
       JOIN users u ON u.id = tc.teacher_id
       WHERE ce.student_id = $1`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
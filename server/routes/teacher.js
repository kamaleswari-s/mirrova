const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');
const Groq = require('groq-sdk');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── FACULTY AUTH ──

// POST /api/teacher/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, college_name, invite_code } = req.body;
  try {
    if (invite_code !== 'MIRROVA2026')
      return res.status(400).json({ error: 'Invalid invite code. Contact Mirrova to get access.' })

    const existing = await pool.query('SELECT id FROM faculty WHERE email=$1', [email])
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered.' })

    const hash = await bcrypt.hash(password, 10)
    const result = await pool.query(
      `INSERT INTO faculty (name, email, password_hash, college_name, invite_code)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, college_name`,
      [name, email, hash, college_name, invite_code]
    )
    const faculty = result.rows[0]
    const token = jwt.sign({ id: faculty.id, role: 'faculty' }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, faculty })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/teacher/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM faculty WHERE email=$1', [email])
    if (result.rows.length === 0)
      return res.status(400).json({ error: 'No faculty account found with this email.' })

    const faculty = result.rows[0]
    const valid = await bcrypt.compare(password, faculty.password_hash)
    if (!valid)
      return res.status(400).json({ error: 'Incorrect password.' })

    const token = jwt.sign({ id: faculty.id, role: 'faculty' }, process.env.JWT_SECRET, { expiresIn: '30d' })
    res.json({ token, faculty: { id: faculty.id, name: faculty.name, email: faculty.email, college_name: faculty.college_name } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Faculty auth middleware
const facultyAuth = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'faculty') return res.status(403).json({ error: 'Not a faculty account' })
    req.faculty = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// GET /api/teacher/me
router.get('/me', facultyAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, college_name FROM faculty WHERE id=$1',
      [req.faculty.id]
    )
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ── STUDENT DATA ──

// GET /api/teacher/students — all students from same college
router.get('/students', facultyAuth, async (req, res) => {
  try {
    const faculty = await pool.query('SELECT college_name FROM faculty WHERE id=$1', [req.faculty.id])
    const college = faculty.rows[0]?.college_name

    const result = await pool.query(
      `SELECT 
        u.id, u.name, u.email, u.avatar_initials, u.created_at,
        p.current_field, p.dream_direction, p.top_skill,
        p.biggest_fear, p.recent_rejection, p.preferred_language,
        p.city, p.education_level, p.hours_per_day,
        p.onboarding_complete, p.college_name,
        p.reality_check, p.skills_assessment, p.swot,
        (SELECT COUNT(*) FROM future_selves fs WHERE fs.user_id = u.id) as futures_count,
        (SELECT COUNT(*) FROM future_selves fs WHERE fs.user_id = u.id AND fs.is_chosen = true) as has_chosen,
        (SELECT COUNT(*) FROM chat_messages cm WHERE cm.user_id = u.id) as chat_count,
        (SELECT COUNT(*) FROM sparkplan_tasks st JOIN spark_plans sp ON sp.id = st.plan_id WHERE sp.user_id = u.id AND st.completed = true) as tasks_completed,
        (SELECT COUNT(*) FROM sparkplan_tasks st JOIN spark_plans sp ON sp.id = st.plan_id WHERE sp.user_id = u.id) as tasks_total
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE p.college_name ILIKE $1
       AND p.onboarding_complete = true
       ORDER BY u.created_at DESC`,
      [`%${college}%`]
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/teacher/insights — AI class insights
router.get('/insights', facultyAuth, async (req, res) => {
  try {
    const faculty = await pool.query('SELECT college_name FROM faculty WHERE id=$1', [req.faculty.id])
    const college = faculty.rows[0]?.college_name

    const studentsResult = await pool.query(
      `SELECT u.name, p.current_field, p.dream_direction, p.top_skill,
              p.biggest_fear, p.reality_check, p.skills_assessment
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE p.college_name ILIKE $1 AND p.onboarding_complete = true`,
      [`%${college}%`]
    )

    const students = studentsResult.rows
    if (students.length === 0)
      return res.json({ total: 0, insights: null })

    // Score parsing
    const scores = students
      .map(s => s.reality_check?.overall_score)
      .filter(Boolean)

    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null

    const atRisk = students.filter(s =>
      !s.reality_check || (s.reality_check?.overall_score < 40)
    ).length

    const noDirection = students.filter(s => !s.dream_direction).length
    const hasSkills = students.filter(s => s.skills_assessment).length

    // Type distribution
    const type1 = noDirection
    const type2 = students.filter(s => s.dream_direction && (!s.reality_check || s.reality_check?.overall_score < 60)).length
    const type3 = students.filter(s => s.recent_rejection).length

    // AI insights
    const profileSummary = students.slice(0, 20).map(s =>
      `${s.name}: ${s.current_field || 'unknown field'} → ${s.dream_direction || 'no direction'}, fears: ${s.biggest_fear || 'unknown'}`
    ).join('\n')

    const prompt = `You are an educational AI helping a faculty member understand their students' career readiness.

College: ${college}
Total students: ${students.length}
Average Reality Check score: ${avgScore || 'not yet assessed'}
At-risk students (score < 40): ${atRisk}
Students without career direction: ${noDirection}

Student profiles:
${profileSummary}

Generate actionable class insights. Return JSON:
{
  "class_summary": "<2-3 sentences about the overall class career readiness>",
  "top_skill_gaps": ["gap1", "gap2", "gap3"],
  "common_fears": ["fear1", "fear2", "fear3"],
  "intervention_suggestions": ["specific suggestion 1", "specific suggestion 2", "specific suggestion 3"],
  "this_week_for_teacher": "<one specific high-impact action the teacher should take this week>",
  "market_alignment": "<how well this class aligns with current job market demands>"
}

Return ONLY valid JSON. No markdown.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1000
    })

    let aiInsights
    try {
      const raw = completion.choices[0].message.content.trim()
      aiInsights = JSON.parse(raw.replace(/```json|```/g, '').trim())
    } catch {
      aiInsights = null
    }

    res.json({
      total: students.length,
      avg_score: avgScore,
      at_risk: atRisk,
      no_direction: noDirection,
      has_skills: hasSkills,
      type1, type2, type3,
      insights: aiInsights
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ── STUDENT ONBOARDING — save college name ──
// POST /api/teacher/link-faculty — student links their faculty email
router.post('/link-faculty', authMiddleware, async (req, res) => {
  const { faculty_email, college_name } = req.body
  try {
    await pool.query(
      `UPDATE profiles SET faculty_email=$1, college_name=$2 WHERE user_id=$3`,
      [faculty_email, college_name, req.user.id]
    )
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router;
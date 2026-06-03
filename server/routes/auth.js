const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  const { name, email, password, mode = 'choosing' } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });
  try {
    const existing = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, avatar_initials, mode)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, avatar_initials, mode, theme`,
      [name, email, hash, initials, mode]
    );
    const user = result.rows[0];

    await pool.query('INSERT INTO profiles (user_id) VALUES ($1)', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });
  try {
    const result = await pool.query(
      'SELECT id, name, email, password_hash, avatar_initials, mode, theme FROM users WHERE email=$1',
      [email]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password_hash, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.avatar_initials, u.mode, u.theme, u.created_at,
              p.current_field, p.dream_direction, p.top_skill, p.biggest_fear,
              p.onboarding_complete, p.preferred_language
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id=$1`,
      [req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/theme
router.patch('/theme', authMiddleware, async (req, res) => {
  const { theme } = req.body;
  if (!['ivory', 'midnight', 'espresso', 'academia'].includes(theme))
    return res.status(400).json({ error: 'Invalid theme' });
  try {
    await pool.query('UPDATE users SET theme=$1 WHERE id=$2', [theme, req.user.id]);
    res.json({ theme });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/auth/profile
router.patch('/profile', authMiddleware, async (req, res) => {
  const { name, preferred_language } = req.body;
  try {
    if (name) {
      const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      await pool.query(
        'UPDATE users SET name=$1, avatar_initials=$2 WHERE id=$3',
        [name, initials, req.user.id]
      );
    }
    if (preferred_language) {
      await pool.query(
        'UPDATE profiles SET preferred_language=$1 WHERE user_id=$2',
        [preferred_language, req.user.id]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// GET /api/auth/passport/:userId — public shareable profile
router.get('/passport/:userId', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, u.avatar_initials, u.mode, u.created_at,
              p.current_field, p.dream_direction, p.top_skill,
              p.preferred_language, p.reality_check, p.skills_assessment,
              p.onboarding_complete
       FROM users u LEFT JOIN profiles p ON p.user_id = u.id
       WHERE u.id=$1`,
      [req.params.userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'User not found' });

    const user = result.rows[0];

    // Get chosen future self
    const futureResult = await pool.query(
      'SELECT * FROM future_selves WHERE user_id=$1 AND is_chosen=true',
      [req.params.userId]
    );

    // Get spark plan progress
    const planResult = await pool.query(
      'SELECT * FROM spark_plans WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
      [req.params.userId]
    );

    res.json({
      name: user.name,
      avatar_initials: user.avatar_initials,
      current_field: user.current_field,
      dream_direction: user.dream_direction,
      top_skill: user.top_skill,
      preferred_language: user.preferred_language,
      member_since: user.created_at,
      reality_check: user.reality_check ? (typeof user.reality_check === 'string' ? JSON.parse(user.reality_check) : user.reality_check) : null,
      skills_assessment: user.skills_assessment ? (typeof user.skills_assessment === 'string' ? JSON.parse(user.skills_assessment) : user.skills_assessment) : null,
      chosen_self: futureResult.rows[0] || null,
      plan: planResult.rows[0] || null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
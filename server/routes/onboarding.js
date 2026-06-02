const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/onboarding/save
router.post('/save', authMiddleware, async (req, res) => {
  const {
    current_field, dream_direction, top_skill,
    biggest_fear, recent_rejection, success_vision,
    resume_text, preferred_language
  } = req.body;

  try {
    await pool.query(
      `UPDATE profiles SET
        current_field=$1, dream_direction=$2, top_skill=$3,
        biggest_fear=$4, recent_rejection=$5, success_vision=$6,
        resume_text=$7, onboarding_complete=true,
        preferred_language=$8, updated_at=NOW()
       WHERE user_id=$9`,
      [current_field, dream_direction, top_skill,
       biggest_fear, recent_rejection, success_vision,
       resume_text, preferred_language || 'English', req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/onboarding/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM profiles WHERE user_id=$1', [req.user.id]
    );
    res.json(result.rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
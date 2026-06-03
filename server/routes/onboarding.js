const express = require('express');
const pool = require('../db/pool');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.post('/save', authMiddleware, async (req, res) => {
  const {
    current_field, dream_direction, top_skill,
    biggest_fear, recent_rejection, success_vision,
    resume_text, preferred_language,
    city, education_level, hours_per_day,
    built_anything, biggest_blocker
  } = req.body;

  try {
    await pool.query(
      `UPDATE profiles SET
        current_field=$1, dream_direction=$2, top_skill=$3,
        biggest_fear=$4, recent_rejection=$5, success_vision=$6,
        resume_text=$7, onboarding_complete=true,
        preferred_language=$8,
        city=$9, education_level=$10, hours_per_day=$11,
        built_anything=$12, biggest_blocker=$13,
        updated_at=NOW()
       WHERE user_id=$14`,
      [current_field, dream_direction, top_skill,
       biggest_fear, recent_rejection, success_vision,
       resume_text, preferred_language || 'English',
       city, education_level, hours_per_day,
       built_anything, biggest_blocker,
       req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

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
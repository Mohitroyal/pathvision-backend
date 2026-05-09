const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM weekly_reports ORDER BY year DESC, week_number DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { user_id, week_number, year, efficiency_score, tasks_completed, focus_hours, ai_insights } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO weekly_reports (user_id, week_number, year, efficiency_score, tasks_completed, focus_hours, ai_insights) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, week_number, year, efficiency_score || 0, tasks_completed || 0, focus_hours || 0, ai_insights]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

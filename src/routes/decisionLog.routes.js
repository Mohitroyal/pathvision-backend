const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM decision_log ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { project_id, user_id, title, reasoning, category, date } = req.body;
  try {
    const defaultUserRes = await db.query('SELECT id FROM users LIMIT 1');
    const defaultProjectRes = await db.query('SELECT id FROM projects LIMIT 1');
    
    const finalUserId = user_id || (defaultUserRes.rows[0] ? defaultUserRes.rows[0].id : null);
    const finalProjectId = project_id || (defaultProjectRes.rows[0] ? defaultProjectRes.rows[0].id : null);

    const result = await db.query(
      'INSERT INTO decision_log (project_id, user_id, title, reasoning, category, date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [finalProjectId, finalUserId, title, reasoning, category, date || new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

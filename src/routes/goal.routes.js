const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM goals ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { user_id, project_id, title, description, progress, target_value, current_value, deadline } = req.body;
  try {
    // Attempt to get a default project and user if not provided
    const defaultUserRes = await db.query('SELECT id FROM users LIMIT 1');
    const defaultProjectRes = await db.query('SELECT id FROM projects LIMIT 1');
    
    const finalUserId = user_id || (defaultUserRes.rows[0] ? defaultUserRes.rows[0].id : null);
    const finalProjectId = project_id || (defaultProjectRes.rows[0] ? defaultProjectRes.rows[0].id : null);

    const finalTarget = target_value || 100;
    const finalCurrent = current_value || (progress ? progress * 100 : 0);

    const result = await db.query(
      'INSERT INTO goals (user_id, project_id, title, description, target_value, current_value, deadline) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [finalUserId, finalProjectId, title, description, finalTarget, finalCurrent, deadline]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { current_value } = req.body;
  try {
    const result = await db.query(
      'UPDATE goals SET current_value = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [current_value, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

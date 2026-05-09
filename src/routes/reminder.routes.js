const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT * FROM reminders ORDER BY remind_at ASC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { message, remind_at, task_id } = req.body;
    const result = await db.query(
      'INSERT INTO reminders (message, remind_at, task_id) VALUES ($1, $2, $3) RETURNING *',
      [message, remind_at, task_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

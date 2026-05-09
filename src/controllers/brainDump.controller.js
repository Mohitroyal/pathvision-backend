const db = require('../config/db');

exports.getBrainDumps = async (req, res, next) => {
  try {
    const { user_id } = req.query;
    let query = 'SELECT b.*, t.title as task_title FROM brain_dump b LEFT JOIN tasks t ON b.linked_task = t.id';
    let params = [];

    if (user_id) {
      query += ' WHERE b.user_id = $1';
      params = [user_id];
    }

    query += ' ORDER BY b.created_at DESC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createBrainDump = async (req, res, next) => {
  try {
    const { user_id, linked_task, content, metadata } = req.body;
    const result = await db.query(
      `INSERT INTO brain_dump (user_id, linked_task, content, metadata) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [user_id, linked_task, content, metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

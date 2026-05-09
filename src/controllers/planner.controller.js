const db = require('../config/db');

exports.getPlannerBlocks = async (req, res, next) => {
  try {
    const { user_id, date } = req.query;
    let query = 'SELECT * FROM planner_blocks';
    let params = [];

    if (user_id && date) {
      query += ' WHERE user_id = $1 AND DATE(start_time) = $2';
      params = [user_id, date];
    } else if (user_id) {
      query += ' WHERE user_id = $1';
      params = [user_id];
    }

    query += ' ORDER BY start_time ASC';
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createPlannerBlock = async (req, res, next) => {
  try {
    const { user_id, task_id, title, start_time, end_time, metadata } = req.body;
    const result = await db.query(
      `INSERT INTO planner_blocks (user_id, task_id, title, start_time, end_time, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [user_id, task_id, title, start_time, end_time, metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

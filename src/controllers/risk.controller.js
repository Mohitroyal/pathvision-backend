const db = require('../config/db');

exports.getAllRisks = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT r.*, p.name as project_name, t.title as task_title 
      FROM risks r 
      LEFT JOIN projects p ON r.project_id = p.id 
      LEFT JOIN tasks t ON r.related_task = t.id 
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createRisk = async (req, res, next) => {
  try {
    const { project_id, related_task, title, description, impact_level, probability, status, metadata } = req.body;
    const result = await db.query(
      `INSERT INTO risks (project_id, related_task, title, description, impact_level, probability, status, metadata) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [project_id, related_task, title, description, impact_level || 'medium', probability || 'medium', status || 'open', metadata || {}]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

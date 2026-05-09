const db = require('../config/db');

exports.getAllMilestones = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT m.*, p.name as project_name 
      FROM milestones m 
      LEFT JOIN projects p ON m.project_id = p.id 
      ORDER BY m.due_date ASC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createMilestone = async (req, res, next) => {
  try {
    const { project_id, title, description, due_date, metadata, is_pinned } = req.body;
    const result = await db.query(
      `INSERT INTO milestones (project_id, title, description, due_date, metadata, is_pinned) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [project_id, title, description, due_date, metadata || {}, is_pinned || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, due_date, is_completed, metadata, is_pinned } = req.body;
    const result = await db.query(
      `UPDATE milestones 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           due_date = COALESCE($3, due_date), 
           is_completed = COALESCE($4, is_completed), 
           metadata = COALESCE($5, metadata),
           is_pinned = COALESCE($6, is_pinned),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 
       RETURNING *`,
      [title, description, due_date, is_completed, metadata, is_pinned, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteMilestone = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM milestones WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    res.json({ message: 'Milestone deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
};

const db = require('../config/db');

exports.getPinnedItems = async (req, res, next) => {
  try {
    const tasks = await db.query(`
      SELECT t.*, 'task' as entity_type, p.name as project_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      WHERE t.is_pinned = TRUE
    `);

    const projects = await db.query(`
      SELECT p.*, 'project' as entity_type, u.full_name as owner_name 
      FROM projects p 
      LEFT JOIN users u ON p.owner_id = u.id 
      WHERE p.is_pinned = TRUE
    `);

    const milestones = await db.query(`
      SELECT m.*, 'milestone' as entity_type, p.name as project_name 
      FROM milestones m 
      LEFT JOIN projects p ON m.project_id = p.id 
      WHERE m.is_pinned = TRUE
    `);

    res.json({
      tasks: tasks.rows,
      projects: projects.rows,
      milestones: milestones.rows,
      total_count: tasks.rows.length + projects.rows.length + milestones.rows.length
    });
  } catch (error) {
    next(error);
  }
};

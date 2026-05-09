const db = require('../config/db');
const eventService = require('../services/event.service');

exports.getAllTasks = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT t.*, p.name as project_name, u.full_name as assigned_user 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const { project_id, title, description, status, priority, assigned_to, due_date, metadata, is_pinned } = req.body;
    const result = await db.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, assigned_to, due_date, metadata, is_pinned) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
       RETURNING *`,
      [project_id, title, description, status || 'todo', priority || 'medium', assigned_to, due_date, metadata || {}, is_pinned || false]
    );

    const task = result.rows[0];
    
    // Central Event Dispatch - This handles Reminders, Planner, and Activity logs
    eventService.dispatch('task_created', task);

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigned_to, due_date, metadata, is_pinned } = req.body;
    
    // Get old status to check for completion event
    const oldResult = await db.query('SELECT status FROM tasks WHERE id = $1', [id]);
    const oldStatus = oldResult.rows[0]?.status;

    const result = await db.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           priority = COALESCE($4, priority), 
           assigned_to = COALESCE($5, assigned_to), 
           due_date = COALESCE($6, due_date), 
           metadata = COALESCE($7, metadata),
           is_pinned = COALESCE($8, is_pinned),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9 
       RETURNING *`,
      [title, description, status, priority, assigned_to, due_date, metadata, is_pinned, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = result.rows[0];

    // Check for completion event
    if (status === 'done' && oldStatus !== 'done') {
      eventService.dispatch('task_completed', updatedTask);
    } else {
      eventService.dispatch('task_updated', updatedTask);
    }

    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    eventService.dispatch('task_deleted', { id });
    res.json({ message: 'Task deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
};

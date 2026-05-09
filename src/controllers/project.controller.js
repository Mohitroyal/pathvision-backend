const db = require('../config/db');

exports.getAllProjects = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.*, u.full_name as owner_name 
      FROM projects p 
      LEFT JOIN users u ON p.owner_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const { name, description, status, start_date, end_date, owner_id, metadata, is_pinned, milestones } = req.body;
    
    // Use the pool to get a client for the transaction
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const projectResult = await client.query(
        `INSERT INTO projects (name, description, status, start_date, end_date, owner_id, metadata, is_pinned) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING *`,
        [name, description, status || 'active', start_date, end_date, owner_id, metadata || {}, is_pinned || false]
      );
      
      const project = projectResult.rows[0];
      
      // If milestones were provided, insert them
      if (milestones && Array.isArray(milestones)) {
        for (const title of milestones) {
          if (title && title.trim().length > 0) {
            await client.query(
              `INSERT INTO milestones (project_id, title, is_completed, due_date) VALUES ($1, $2, $3, $4)`,
              [project.id, title.trim(), false, project.end_date]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      res.status(201).json(project);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, start_date, end_date, owner_id, metadata, is_pinned, milestones } = req.body;
    
    const client = await db.pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        `UPDATE projects 
         SET name = COALESCE($1, name), 
             description = COALESCE($2, description), 
             status = COALESCE($3, status), 
             start_date = COALESCE($4, start_date), 
             end_date = COALESCE($5, end_date), 
             owner_id = COALESCE($6, owner_id), 
             metadata = COALESCE($7, metadata),
             is_pinned = COALESCE($8, is_pinned),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $9 
         RETURNING *`,
        [name, description, status, start_date, end_date, owner_id, metadata, is_pinned, id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Project not found' });
      }

      // If milestones were provided, insert them (new ones)
      if (milestones && Array.isArray(milestones)) {
        for (const title of milestones) {
          if (title && title.trim().length > 0) {
            // Check if this milestone already exists for this project to avoid duplicates
            const exists = await client.query(
              "SELECT id FROM milestones WHERE project_id = $1 AND title = $2",
              [id, title.trim()]
            );
            if (exists.rows.length === 0) {
              await client.query(
                `INSERT INTO milestones (project_id, title, is_completed, due_date) VALUES ($1, $2, $3, $4)`,
                [id, title.trim(), false, result.rows[0].end_date]
              );
            }
          }
        }
      }

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
};

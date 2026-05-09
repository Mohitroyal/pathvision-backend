const db = require('../config/db');

exports.getAllUsers = async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, email, full_name, role, avatar_url, created_at FROM users ORDER BY full_name ASC');
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

exports.createUser = async (req, res, next) => {
  try {
    const { email, full_name, role, avatar_url } = req.body;
    // Note: This is for team management, password would be set by user later or a default one
    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role, avatar_url) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, email, full_name, role, avatar_url`,
      [email, 'temporary_hash', full_name, role || 'user', avatar_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email, full_name, role, avatar_url } = req.body;
    const result = await db.query(
      `UPDATE users 
       SET email = COALESCE($1, email), 
           full_name = COALESCE($2, full_name), 
           role = COALESCE($3, role), 
           avatar_url = COALESCE($4, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 
       RETURNING id, email, full_name, role, avatar_url`,
      [email, full_name, role, avatar_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully', id: result.rows[0].id });
  } catch (error) {
    next(error);
  }
};

const db = require('../config/db');

class ActivityService {
  async log(action, entityType, entityId, metadata = {}) {
    try {
      await db.query(
        'INSERT INTO system_activity (action, entity_type, entity_id, metadata) VALUES ($1, $2, $3, $4)',
        [action, entityType, entityId, metadata]
      );
    } catch (e) {
      console.error('Activity log error:', e);
    }
  }

  async getRecent() {
    const result = await db.query('SELECT * FROM system_activity ORDER BY created_at DESC LIMIT 50');
    return result.rows;
  }
}

module.exports = new ActivityService();

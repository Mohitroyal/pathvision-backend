const db = require('../config/db');

class DashboardService {
  async getStats() {
    const tasksRes = await db.query('SELECT status, COUNT(*) FROM tasks GROUP BY status');
    const projectsRes = await db.query('SELECT status, COUNT(*) FROM projects GROUP BY status');
    const risksRes = await db.query("SELECT COUNT(*) FROM risks WHERE status = 'open'");
    const milestonesRes = await db.query('SELECT COUNT(*) FROM milestones WHERE is_completed = false');
    const recentActivity = await db.query('SELECT * FROM system_activity ORDER BY created_at DESC LIMIT 10');

    return {
      tasks: tasksRes.rows,
      projects: projectsRes.rows,
      openRisks: parseInt(risksRes.rows[0].count),
      pendingMilestones: parseInt(milestonesRes.rows[0].count),
      activity: recentActivity.rows
    };
  }
}

module.exports = new DashboardService();

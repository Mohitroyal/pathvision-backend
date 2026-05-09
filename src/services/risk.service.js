const db = require('../config/db');

class RiskService {
  async resolveFromTask(taskId) {
    await db.query(
      "UPDATE risks SET status = 'resolved' WHERE related_task = $1",
      [taskId]
    );
  }

  /**
   * Scans for tasks that are either overdue or approaching their deadline
   * approaching: one day before the deadline
   */
  async scanRisks() {
    // 1. Detect OVERDUE tasks
    const overdueResult = await db.query(
      "SELECT * FROM tasks WHERE due_date < CURRENT_TIMESTAMP AND status != 'done'"
    );

    for (const task of overdueResult.rows) {
      await db.query(
        "INSERT INTO risks (project_id, related_task, title, description, impact_level, status) VALUES ($1, $2, $3, $4, 'high', 'open') ON CONFLICT DO NOTHING",
        [
          task.project_id, 
          task.id, 
          `OVERDUE CRITICAL: ${task.title}`,
          `Task was due on ${new Date(task.due_date).toLocaleDateString()}. Immediate action required.`
        ]
      );
    }

    // 2. Detect APPROACHING tasks (1 day before deadline)
    const approachingResult = await db.query(
      "SELECT * FROM tasks WHERE due_date > CURRENT_TIMESTAMP AND due_date <= CURRENT_TIMESTAMP + INTERVAL '1 day' AND status != 'done'"
    );

    for (const task of approachingResult.rows) {
      await db.query(
        "INSERT INTO risks (project_id, related_task, title, description, impact_level, status) VALUES ($1, $2, $3, $4, 'medium', 'open') ON CONFLICT DO NOTHING",
        [
          task.project_id, 
          task.id, 
          `DEADLINE APPROACHING: ${task.title}`,
          `Task is due within 24 hours (${new Date(task.due_date).toLocaleDateString()}). Escalating to radar.`
        ]
      );
    }
  }

  async getAll() {
    // Run scan every time we fetch risks to ensure the radar is dynamic
    await this.scanRisks();
    const result = await db.query('SELECT * FROM risks ORDER BY created_at DESC');
    return result.rows;
  }
}

module.exports = new RiskService();

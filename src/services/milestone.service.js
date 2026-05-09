const db = require('../config/db');

class MilestoneService {
  async updateFromTask(task) {
    if (!task.metadata?.milestone) return;

    // Logic: If task completed, update milestone completion if all tasks for that milestone are done
    // For simplicity: Mark milestone as completed if this specific task was the primary one
    await db.query(
      'UPDATE milestones SET is_completed = true WHERE title = $1 AND project_id = $2',
      [task.metadata.milestone, task.project_id]
    );
  }

  async getAll() {
    const result = await db.query('SELECT * FROM milestones ORDER BY due_date ASC');
    return result.rows;
  }
}

module.exports = new MilestoneService();

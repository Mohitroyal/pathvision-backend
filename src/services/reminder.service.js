const db = require('../config/db');

class ReminderService {
  async createFromTask(task) {
    const message = `Reminder for "${task.title}"${task.metadata?.privateNotes ? ': ' + task.metadata.privateNotes : ''}`;
    let remindAt = new Date(Date.now() + 3600000); 
    
    try {
      if (task.metadata?.reminder && !isNaN(Date.parse(task.metadata.reminder))) {
        remindAt = new Date(task.metadata.reminder);
      }
    } catch (e) {}

    await db.query(
      'INSERT INTO reminders (task_id, message, remind_at) VALUES ($1, $2, $3)',
      [task.id, message, remindAt]
    );
  }

  async getAll() {
    const result = await db.query('SELECT * FROM reminders ORDER BY remind_at ASC');
    return result.rows;
  }
}

module.exports = new ReminderService();

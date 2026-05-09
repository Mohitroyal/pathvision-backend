const db = require('./src/config/db');

async function checkAll() {
  try {
    const tasks = await db.query('SELECT title, is_pinned FROM tasks');
    const projects = await db.query('SELECT name, is_pinned FROM projects');
    const milestones = await db.query('SELECT title, is_pinned FROM milestones');
    console.log('TASKS:', tasks.rows);
    console.log('PROJECTS:', projects.rows);
    console.log('MILESTONES:', milestones.rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkAll();

const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'migrate-pinning.sql'), 'utf8');
    await db.query(sql);
    console.log('MIGRATION SUCCESSFUL');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err);
    process.exit(1);
  }
}

migrate();

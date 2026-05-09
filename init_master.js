const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  port: 5433,
  user: 'postgres',
  password: 'pathvision123',
  database: 'pathvision_os'
});

async function init() {
  try {
    await pool.query("INSERT INTO users (full_name, email, password_hash, role) VALUES ('Mohit', 'mohit@pathvision.os', 'no_hash', 'admin') ON CONFLICT (email) DO NOTHING");
    console.log('Master User Ready');
    
    // Also create a default project
    await pool.query("INSERT INTO projects (name, description, status) VALUES ('General OS', 'Main Operating System project', 'active') ON CONFLICT DO NOTHING");
    console.log('Default Project Ready');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

init();

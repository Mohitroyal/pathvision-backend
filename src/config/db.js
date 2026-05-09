const { Pool } = require('pg');
const config = require('./env.config');

const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  ssl: config.database.ssl,
});

// Live Connection Test
if (config.nodeEnv !== 'production') {
  pool.connect()
    .then(client => {
      console.log('✅ PostgreSQL Connected successfully to PathVision OS Database');
      console.log(`Host: ${config.database.host}, Port: ${config.database.port}, DB: ${config.database.name}`);
      client.release();
    })
    .catch(err => {
      console.error('❌ PostgreSQL Connection Error:', err.message);
    });
}

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};

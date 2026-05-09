const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
  const passwords = [process.env.DB_PASSWORD, 'postgres', '', 'root', 'admin'];
  const host = process.env.DB_HOST || '127.0.0.1';
  
  for (const pwd of passwords) {
    const client = new Client({
      host: host,
      port: 5432,
      user: 'postgres',
      password: pwd,
      database: 'postgres'
    });

    try {
      console.log(`Trying password: "${pwd}"...`);
      await client.connect();
      console.log(`✅ Success with password: "${pwd}"`);
      await client.end();
      return pwd;
    } catch (err) {
      console.log(`❌ Failed with password: "${pwd}": ${err.message}`);
    }
  }
  return null;
}

testConnection();

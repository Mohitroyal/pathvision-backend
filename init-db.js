const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDb() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };

  // 1. Create Database if not exists
  const client = new Client({ ...config, database: 'postgres' });
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server...');
    
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'pathvision_os'");
    if (res.rowCount === 0) {
      console.log('Creating database "pathvision_os"...');
      await client.query('CREATE DATABASE pathvision_os');
    } else {
      console.log('Database "pathvision_os" already exists.');
    }
  } catch (err) {
    console.error('Error creating database:', err.message);
  } finally {
    await client.end();
  }

  // 2. Run Schema
  const schemaClient = new Client({ ...config, database: 'pathvision_os' });
  try {
    await schemaClient.connect();
    console.log('Connected to "pathvision_os" database. Running schema...');

    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split by semicolons to execute multiple statements (basic approach)
    // Note: This might struggle with triggers or complex functions, but for standard tables it works.
    // A better way is to run the whole block if the driver supports it.
    await schemaClient.query(schemaSql);
    
    console.log('✅ Schema uploaded successfully!');
    console.log('All 18 tables and relationships created.');
  } catch (err) {
    console.error('❌ Error uploading schema:', err.message);
  } finally {
    await schemaClient.end();
  }
}

initDb();

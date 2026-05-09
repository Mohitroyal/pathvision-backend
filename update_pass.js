const { Client } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function run() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'pathvision_os'
    });
    try {
        await client.connect();
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash('9346843889', salt);
        const res = await client.query('UPDATE users SET password_hash = $1 WHERE email = $2', [hash, 'mohithroyal16450@gmail.com']);
        console.log('Rows affected:', res.rowCount);
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        await client.end();
    }
}
run();

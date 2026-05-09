const { Client } = require('pg');
require('dotenv').config();

async function addTranslationsTable() {
    const config = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'pathvision_os'
    };

    const client = new Client(config);
    try {
        await client.connect();
        console.log('Checking for translations table...');
        
        await client.query(`
            CREATE TABLE IF NOT EXISTS translations (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                original_text TEXT NOT NULL,
                translated_text TEXT NOT NULL,
                source_language VARCHAR(50) DEFAULT 'Auto',
                target_language VARCHAR(50) DEFAULT 'English',
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        console.log('✅ Translations table is ready in the database!');
    } catch (err) {
        console.error('❌ Error adding translations table:', err.message);
    } finally {
        await client.end();
    }
}

addTranslationsTable();

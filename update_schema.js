const { Client } = require('pg');
require('dotenv').config();

async function updateDb() {
  const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'pathvision_os',
  };

  const client = new Client(config);
  try {
    await client.connect();
    console.log('Connected to "pathvision_os" database. Running schema updates...');

    const updates = [
      `CREATE TABLE IF NOT EXISTS expenses (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          category VARCHAR(100),
          date DATE DEFAULT CURRENT_DATE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS income (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          source VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          date DATE DEFAULT CURRENT_DATE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS debts (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          creditor_debtor VARCHAR(255) NOT NULL,
          amount DECIMAL(15,2) NOT NULL,
          due_date DATE,
          type VARCHAR(50) DEFAULT 'to_pay',
          status VARCHAR(50) DEFAULT 'pending',
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS decision_log (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
          user_id UUID REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR(255) NOT NULL,
          reasoning TEXT,
          category VARCHAR(100),
          date DATE DEFAULT CURRENT_DATE,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS weekly_reports (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID REFERENCES users(id) ON DELETE CASCADE,
          week_number INTEGER NOT NULL,
          year INTEGER NOT NULL,
          efficiency_score DECIMAL DEFAULT 0,
          tasks_completed INTEGER DEFAULT 0,
          focus_hours DECIMAL DEFAULT 0,
          ai_insights TEXT,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_income_user ON income(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_debts_user ON debts(user_id)`,
      `CREATE INDEX IF NOT EXISTS idx_decision_project ON decision_log(project_id)`,
      `CREATE INDEX IF NOT EXISTS idx_weekly_report_user ON weekly_reports(user_id, year, week_number)`
    ];

    for (const sql of updates) {
      try {
        await client.query(sql);
        console.log('Executed:', sql.split('\n')[0].substring(0, 50) + '...');
      } catch (e) {
        console.warn('Skipped or Error in statement:', sql.split('\n')[0].substring(0, 50), e.message);
      }
    }

    console.log('✅ Database schema updated successfully!');
  } catch (err) {
    console.error('❌ Error updating database:', err.message);
  } finally {
    await client.end();
  }
}

updateDb();

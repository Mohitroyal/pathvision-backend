const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bykivmvznqbgnnjlokxd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5a2l2bXZ6bnFiZ25uamxva3hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMDY1MTksImV4cCI6MjA5Mzg4MjUxOX0.LUarkyRAHVQHCa68d9iFC4CorXxsdzCIn_xfF_tla2c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('--- PathVision OS DB Audit ---');
  
  const tables = [
    'users', 'profiles', 'departments', 'projects', 'tasks', 
    'planner_blocks', 'reminders', 'risks', 'milestones', 
    'goals', 'brain_dump', 'translations', 'expenses', 
    'income', 'debts', 'decision_log', 'weekly_reports',
    'system_activity', 'search_index'
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`[ ] ${table.padEnd(20)}: MISSING/ERROR (${error.message})`);
    } else {
      console.log(`[x] ${table.padEnd(20)}: OK`);
    }
  }
}

checkDatabase();

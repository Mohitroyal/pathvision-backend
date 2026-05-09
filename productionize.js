const fs = require('fs');
const path = require('path');

const dirs = [
  'src/routes',
  'src/controllers',
  'src/services',
  'src/middleware',
  'src/ai',
  'src/realtime',
  'src/config',
  'src/utils'
];

dirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${dir}`);
  }
});

// Create base config
const configContent = `// src/config/supabase.js
require('dotenv').config();
const { createClient } = require('@supabase/supabase-client');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };
`;

fs.writeFileSync(path.join(__dirname, 'src/config/supabase.js'), configContent);
console.log('Created Supabase config');

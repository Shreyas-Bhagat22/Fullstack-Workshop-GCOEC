const path = require('path');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your_supabase_project_url') &&
  !supabaseAnonKey.includes('your_supabase_anon_key')
);

if (!isConfigured) {
  console.warn('\n⚠️  [SUPABASE CONFIGURATION NOTICE]');
  console.warn('   SUPABASE_URL or SUPABASE_ANON_KEY is missing or contains placeholder values.');
  console.warn('   Please configure server/.env with your Supabase project credentials.\n');
}

// Safely initialize the client (uses placeholder if not configured to prevent startup crashes)
const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isConfigured ? supabaseAnonKey : 'placeholder-anon-key'
);

/**
 * Diagnostic helper to check connection to Supabase and verify tasks table exists
 */
const checkSupabaseConnection = async () => {
  if (!isConfigured) {
    console.log('ℹ️  Supabase: Awaiting project credentials in server/.env');
    return false;
  }

  try {
    const { error } = await supabase.from('tasks').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.warn('\n⚠️  [SUPABASE SETUP REQUIRED]');
        console.warn('   The "tasks" table does not exist in your Supabase database yet.');
        console.warn('   👉 Please open the Supabase SQL Editor and run supabase/schema.sql to create it.\n');
      } else {
        console.warn(`⚠️  Supabase Table Check Notice: ${error.message}`);
      }
      return false;
    }
    console.log(`✅ Supabase Connected Successfully: ${supabaseUrl}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Supabase Connection Error: ${err.message}`);
    return false;
  }
};

module.exports = { supabase, isConfigured, checkSupabaseConnection };

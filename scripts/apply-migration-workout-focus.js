// Script to apply the workout_focus array migration
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase URL or service role key');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('Starting workout_focus array migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250911_workout_focus_array.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the SQL directly using the Supabase client
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration completed successfully!');
    
    // Verify the migration by checking a sample workout
    const { data: sampleWorkout, error: fetchError } = await supabase
      .from('workouts')
      .select('workout_focus')
      .limit(1)
      .single();
    
    if (fetchError) {
      console.warn('Warning: Could not verify migration:', fetchError.message);
    } else {
      console.log('Sample workout focus after migration:', sampleWorkout.workout_focus);
      console.log('Type of workout_focus:', Array.isArray(sampleWorkout.workout_focus) ? 'Array' : typeof sampleWorkout.workout_focus);
    }
    
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  }
}

applyMigration();

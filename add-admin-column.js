#!/usr/bin/env node

/**
 * Add Admin Column Migration Script
 * 
 * This script adds the missing is_admin column to the profiles table.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Simple environment variable loader
function loadEnvFile() {
  try {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.error('❌ Could not load .env.local file');
    process.exit(1);
  }
}

// Load environment variables
loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addAdminColumn() {
  try {
    console.log('🔧 Checking if is_admin column exists in profiles table...');
    console.log('');
    
    // First, let's check if we can query the profiles table
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Error accessing profiles table:', testError.message);
      return;
    }
    
    console.log('✅ Profiles table is accessible');
    
    // Try to query the is_admin column to see if it exists
    const { data: adminTest, error: adminError } = await supabase
      .from('profiles')
      .select('is_admin')
      .limit(1);
    
    if (adminError && adminError.message.includes('column "is_admin" does not exist')) {
      console.log('❌ is_admin column does not exist');
      console.log('');
      console.log('🔧 Manual Steps Required:');
      console.log('1. Go to your Supabase dashboard: ' + supabaseUrl.replace('/rest/v1', ''));
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the following SQL:');
      console.log('');
      console.log('ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;');
      console.log('');
      console.log('4. After running the SQL, restart your development server');
      console.log('5. Try accessing the admin page again');
      console.log('');
      console.log('💡 Alternative: You can also copy the SQL from add-admin-column.sql file');
      
    } else if (adminError) {
      console.error('❌ Unexpected error:', adminError.message);
    } else {
      console.log('✅ is_admin column already exists!');
      console.log('');
      console.log('🎉 The column is there. The issue might be elsewhere.');
      console.log('');
      console.log('🔧 Next steps:');
      console.log('1. Restart your development server');
      console.log('2. Clear your browser cache');
      console.log('3. Try accessing the admin page again');
      console.log('4. Run "npm run create-admin" to create an admin user');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('🔧 Manual Steps Required:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run: ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;');
  }
}

// Run the check
addAdminColumn();
#!/usr/bin/env node

/**
 * Create Admin User Script
 * 
 * This script creates an admin user for testing the admin dashboard.
 * Run this after you have registered a regular user account.
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

async function createAdminUser() {
  try {
    console.log('🔧 Admin User Setup Script');
    console.log('');
    
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, full_name, user_type, is_admin');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }
    
    if (!users || users.length === 0) {
      console.log('❌ No users found. Please register a user first through the app.');
      console.log('');
      console.log('Steps:');
      console.log('1. Go to http://localhost:3003/register');
      console.log('2. Create a user account');
      console.log('3. Run this script again');
      return;
    }
    
    console.log('📋 Found users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.full_name || 'No name'}) - ${user.user_type || 'No type'} ${user.is_admin ? '(ADMIN)' : ''}`);
    });
    
    console.log('');
    console.log('🔧 Making the first user an admin...');
    
    // Make the first user an admin
    const firstUser = users[0];
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        user_type: 'admin'
      })
      .eq('id', firstUser.id);
    
    if (updateError) {
      console.error('❌ Error updating user:', updateError.message);
      return;
    }
    
    console.log('✅ Successfully made user an admin!');
    console.log(`📧 Admin user: ${firstUser.email}`);
    console.log('');
    console.log('🎉 You can now:');
    console.log('1. Login with this email at http://localhost:3003/login');
    console.log('2. Access the admin dashboard at http://localhost:3003/admin');
    console.log('');
    console.log('💡 Note: You may need to logout and login again for changes to take effect.');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
createAdminUser();
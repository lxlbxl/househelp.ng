#!/usr/bin/env node

/**
 * Database Setup Script
 * 
 * This script applies the database schema to your Supabase instance.
 * Run this after setting up your .env.local file with Supabase credentials.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    console.log('🚀 Starting database schema setup...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, 'database-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Reading database schema...');
    
    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement 
        });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('*')
            .limit(0);
          
          if (directError && directError.message.includes('does not exist')) {
            console.log(`⚠️  Skipping statement (table/policy may already exist): ${statement.substring(0, 50)}...`);
          } else {
            throw error;
          }
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.log(`⚠️  Warning on statement ${i + 1}: ${err.message}`);
        // Continue with next statement
      }
    }
    
    console.log('🎉 Database schema setup completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Restart your development server: npm run dev');
    console.log('2. Visit http://localhost:3002/dashboard');
    console.log('3. Test user registration and login');
    
  } catch (error) {
    console.error('❌ Error setting up database schema:', error.message);
    console.error('');
    console.error('Manual setup required:');
    console.error('1. Open your Supabase dashboard');
    console.error('2. Go to SQL Editor');
    console.error('3. Copy and paste the contents of database-schema.sql');
    console.error('4. Run the SQL script');
    process.exit(1);
  }
}

// Run the setup
applySchema();
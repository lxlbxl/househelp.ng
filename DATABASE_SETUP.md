# Database Setup Guide

## Quick Fix for Current Issues

The application is showing errors because the database schema hasn't been applied yet. Follow these steps to fix the issues:

### Step 1: Apply Database Schema

1. **Open your Supabase Dashboard**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project: `cfwymhqprkslrsqljnmr`

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply the Database Schema**
   - Copy the entire contents of `database-schema.sql` file
   - Paste it into the SQL Editor
   - Click "Run" to execute the schema

### Step 2: Verify Tables Created

After running the schema, verify these tables exist:
- `profiles`
- `helper_profiles` 
- `household_profiles`
- `agency_profiles`
- `agency_helpers`
- `agency_analytics`
- `agency_reputation`
- `matches`
- `bookings`
- `reviews`
- `payments`
- `verification_documents`
- `contact_messages`
- `analytics`

### Step 3: Test the Application

1. **Restart the development server**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Test the routes**
   - Visit `http://localhost:3002/dashboard`
   - The 404 error should be resolved
   - The "bookings" table error should be fixed

## Common Issues

### Issue: "relation does not exist" errors
**Solution**: Make sure you've applied the complete `database-schema.sql` file to your Supabase database.

### Issue: 404 on /dashboard
**Solution**: The dashboard route exists but requires proper database setup and user authentication.

### Issue: Circular reference errors
**Solution**: The schema has been fixed to resolve circular references between tables.

## Database Schema Features

The schema includes:
- **Row Level Security (RLS)** for all tables
- **User type routing** (helper, household, agency, admin)
- **Agency management system** with helpers, analytics, and reputation
- **Booking and payment system**
- **Verification and document management**
- **Automated triggers** for timestamp updates
- **Admin policies** for full system management

## Next Steps

After applying the schema:
1. Create test users through the registration flow
2. Test different user types (helper, household, agency)
3. Verify the dashboard routing works correctly
4. Test the agency management features
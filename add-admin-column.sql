-- Migration to add missing is_admin column to profiles table
-- Run this in your Supabase SQL editor

-- Add the is_admin column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added is_admin column to profiles table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in profiles table';
    END IF;
END $$;

-- Update any existing admin users (optional - you can skip this if no admins exist yet)
-- UPDATE profiles SET is_admin = true WHERE user_type = 'admin';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'is_admin';
-- Quick fix for existing policies error
-- Run this script to safely handle existing policies

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own helper profile" ON helper_profiles;
DROP POLICY IF EXISTS "Users can update their own helper profile" ON helper_profiles;
DROP POLICY IF EXISTS "Users can insert their own helper profile" ON helper_profiles;
DROP POLICY IF EXISTS "Households can view helper profiles" ON helper_profiles;

DROP POLICY IF EXISTS "Users can view their own household profile" ON household_profiles;
DROP POLICY IF EXISTS "Users can update their own household profile" ON household_profiles;
DROP POLICY IF EXISTS "Users can insert their own household profile" ON household_profiles;
DROP POLICY IF EXISTS "Helpers can view household profiles" ON household_profiles;

-- Now recreate the policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Helper profiles policies
CREATE POLICY "Users can view their own helper profile" ON helper_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own helper profile" ON helper_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own helper profile" ON helper_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Households can view helper profiles" ON helper_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'household'
    )
  );

-- Household profiles policies
CREATE POLICY "Users can view their own household profile" ON household_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own household profile" ON household_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own household profile" ON household_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Helpers can view household profiles" ON household_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.user_type = 'helper'
    )
  );
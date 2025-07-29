-- Database Schema for Househelp App
-- Run this in your Supabase SQL editor to create the required tables

-- Note: Supabase handles JWT secrets automatically, no need to set them manually

-- Create profiles table (main user table)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  user_type TEXT CHECK (user_type IN ('helper', 'household', 'agency', 'admin')),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helper_profiles table
CREATE TABLE IF NOT EXISTS helper_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  experience_years INTEGER,
  expected_salary DECIMAL(10,2),
  services TEXT[], -- Array of services offered
  skills TEXT[], -- Array of skills
  availability TEXT[], -- Array of available days/times
  location TEXT,
  bio TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create household_profiles table
CREATE TABLE IF NOT EXISTS household_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  household_size INTEGER,
  location TEXT,
  preferred_services TEXT[], -- Array of services needed
  budget_range TEXT,
  special_requirements TEXT,
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agency_profiles table
CREATE TABLE IF NOT EXISTS agency_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  agency_name TEXT NOT NULL,
  business_name TEXT,
  business_registration_number TEXT,
  tax_identification_number TEXT,
  contact_person TEXT,
  contact_email TEXT,
  business_license TEXT,
  location TEXT,
  description TEXT,
  services_offered TEXT[],
  commission_rate DECIMAL(5,2) DEFAULT 15.00, -- Percentage commission
  verification_status TEXT CHECK (verification_status IN ('pending', 'verified', 'rejected')) DEFAULT 'pending',
  total_helpers INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agency_helpers table (junction table for agency-helper relationships)
CREATE TABLE IF NOT EXISTS agency_helpers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  commission_rate DECIMAL(5,2), -- Override agency default if needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, helper_id)
);

-- Create agency_analytics table
CREATE TABLE IF NOT EXISTS agency_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_bookings INTEGER DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  active_helpers INTEGER DEFAULT 0,
  new_helpers INTEGER DEFAULT 0,
  customer_satisfaction DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, period_start, period_end)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')) DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(helper_id, household_id)
);

-- Salary Negotiations Table
CREATE TABLE salary_negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  helper_expected_salary DECIMAL(10,2) NOT NULL,
  household_offered_salary DECIMAL(10,2),
  final_agreed_salary DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'negotiating', 'agreed', 'rejected')),
  negotiation_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for Salary Negotiations
ALTER TABLE salary_negotiations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own salary negotiations" ON salary_negotiations
  FOR SELECT USING (
    helper_id IN (SELECT id FROM helper_profiles WHERE user_id = auth.uid()) OR
    household_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create salary negotiations for their matches" ON salary_negotiations
  FOR INSERT WITH CHECK (
    helper_id IN (SELECT id FROM helper_profiles WHERE user_id = auth.uid()) OR
    household_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own salary negotiations" ON salary_negotiations
  FOR UPDATE USING (
    helper_id IN (SELECT id FROM helper_profiles WHERE user_id = auth.uid()) OR
    household_id IN (SELECT id FROM household_profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all salary negotiations" ON salary_negotiations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE,
  household_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  services TEXT[] NOT NULL,
  total_amount DECIMAL(10,2),
  agency_commission DECIMAL(10,2) DEFAULT 0,
  helper_payout DECIMAL(10,2),
  status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create agency_reputation table (for reviews and ratings)
CREATE TABLE IF NOT EXISTS agency_reputation (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, reviewer_id, booking_id)
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table for tracking transactions
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT CHECK (payment_type IN ('booking', 'subscription', 'commission', 'payout')) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_method TEXT,
  transaction_ref TEXT,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  document_type TEXT CHECK (document_type IN ('id_card', 'passport', 'drivers_license', 'background_check', 'business_license')) NOT NULL,
  document_url TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT FALSE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics table for admin insights
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(12,2) NOT NULL,
  metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_helpers ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Helper profiles policies
CREATE POLICY "Anyone can view helper profiles" ON helper_profiles
  FOR SELECT TO authenticated;

CREATE POLICY "Helpers can manage their own profile" ON helper_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Household profiles policies
CREATE POLICY "Households can view their own profile" ON household_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Households can manage their own profile" ON household_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Agency profiles policies
CREATE POLICY "Anyone can view agency profiles" ON agency_profiles
  FOR SELECT TO authenticated;

CREATE POLICY "Agencies can manage their own profile" ON agency_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Agency helpers policies
CREATE POLICY "Agencies can view their helpers" ON agency_helpers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agency_profiles 
      WHERE id = agency_helpers.agency_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can manage their helpers" ON agency_helpers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_profiles 
      WHERE id = agency_helpers.agency_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Helpers can view their agency relationships" ON agency_helpers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM helper_profiles 
      WHERE id = agency_helpers.helper_id AND user_id = auth.uid()
    )
  );

-- Agency analytics policies
CREATE POLICY "Agencies can view their analytics" ON agency_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agency_profiles 
      WHERE id = agency_analytics.agency_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Agencies can manage their analytics" ON agency_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM agency_profiles 
      WHERE id = agency_analytics.agency_id AND user_id = auth.uid()
    )
  );

-- Agency reputation policies
CREATE POLICY "Anyone can view agency reputation" ON agency_reputation
  FOR SELECT TO authenticated;

CREATE POLICY "Users can create agency reviews" ON agency_reputation
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Agencies can view their reputation" ON agency_reputation
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agency_profiles 
      WHERE id = agency_reputation.agency_id AND user_id = auth.uid()
    )
  );

-- Matches policies
CREATE POLICY "Users can view their own matches" ON matches
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM helper_profiles WHERE id = matches.helper_id
      UNION
      SELECT user_id FROM household_profiles WHERE id = matches.household_id
    )
  );

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM helper_profiles WHERE id = matches.helper_id
      UNION
      SELECT user_id FROM household_profiles WHERE id = matches.household_id
    )
  );

CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM helper_profiles WHERE id = matches.helper_id
      UNION
      SELECT user_id FROM household_profiles WHERE id = matches.household_id
    )
  );

-- Admin policies for all tables
CREATE POLICY "Admins can manage all data" ON helper_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all household data" ON household_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage all agency data" ON agency_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all bookings" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage verification documents" ON verification_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage contact messages" ON contact_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can view analytics" ON analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Admin policies for new agency tables
CREATE POLICY "Admins can manage agency helpers" ON agency_helpers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage agency analytics" ON agency_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can manage agency reputation" ON agency_reputation
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_helper_profiles_updated_at BEFORE UPDATE ON helper_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_household_profiles_updated_at BEFORE UPDATE ON household_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_profiles_updated_at BEFORE UPDATE ON agency_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_helpers_updated_at BEFORE UPDATE ON agency_helpers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_analytics_updated_at BEFORE UPDATE ON agency_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_reputation_updated_at BEFORE UPDATE ON agency_reputation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_documents_updated_at BEFORE UPDATE ON verification_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_messages_updated_at BEFORE UPDATE ON contact_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
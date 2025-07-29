-- Create agency profiles table
CREATE TABLE agency_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_registration_number TEXT NOT NULL,
  tax_identification_number TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Nigeria',
  website TEXT,
  description TEXT,
  verification_status verification_status DEFAULT 'pending',
  tier TEXT DEFAULT 'basic' CHECK (tier IN ('basic', 'verified', 'premium')),
  commission_rate DECIMAL(3,2) DEFAULT 0.20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create agency helpers table to link helpers to agencies
CREATE TABLE agency_helpers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE NOT NULL,
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE NOT NULL,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'suspended', 'terminated')),
  contract_start_date TIMESTAMP WITH TIME ZONE,
  contract_end_date TIMESTAMP WITH TIME ZONE,
  salary DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, helper_id)
);

-- Create agency dashboard analytics table
CREATE TABLE agency_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE NOT NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  total_helpers INTEGER DEFAULT 0,
  active_helpers INTEGER DEFAULT 0,
  placements_made INTEGER DEFAULT 0,
  revenue_generated DECIMAL(12,2) DEFAULT 0,
  commission_earned DECIMAL(12,2) DEFAULT 0,
  average_helper_rating DECIMAL(3,2) DEFAULT 0,
  reliability_index DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, period_start, period_end)
);

-- Create agency reputation table
CREATE TABLE agency_reputation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID REFERENCES agency_profiles(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  response_time_rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  helper_quality_rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agency_id, reviewer_id)
);

-- Create RLS policies for agency tables

-- Agency profiles policies
CREATE POLICY "Agency profiles are viewable by everyone" ON agency_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own agency profile" ON agency_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agency profile" ON agency_profiles
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND id = agency_profiles.user_id
  ));

-- Agency helpers policies
CREATE POLICY "Agency helpers are viewable by agency and helpers" ON agency_helpers
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_helpers.agency_id AND agency_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM helper_profiles
    WHERE helper_profiles.id = agency_helpers.helper_id AND helper_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Agencies can manage their helpers" ON agency_helpers
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_helpers.agency_id AND agency_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Agencies can update their helpers" ON agency_helpers
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_helpers.agency_id AND agency_profiles.user_id = auth.uid()
  ));

-- Agency analytics policies
CREATE POLICY "Agencies can view their analytics" ON agency_analytics
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_analytics.agency_id AND agency_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Agencies can insert their analytics" ON agency_analytics
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_analytics.agency_id AND agency_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Agencies can update their analytics" ON agency_analytics
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_analytics.agency_id AND agency_profiles.user_id = auth.uid()
  ));

-- Agency reputation policies
CREATE POLICY "Agency reputation is viewable by everyone" ON agency_reputation
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reputation for agencies" ON agency_reputation
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Agencies can update their reputation" ON agency_reputation
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM agency_profiles
    WHERE agency_profiles.id = agency_reputation.agency_id AND agency_profiles.user_id = auth.uid()
  ));

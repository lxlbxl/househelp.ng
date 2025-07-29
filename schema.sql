-- Create custom types
CREATE TYPE user_role AS ENUM ('helper', 'household', 'admin');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');

-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create helper profiles table
CREATE TABLE helper_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  skills TEXT[] NOT NULL,
  experience_years INTEGER NOT NULL,
  bio TEXT,
  availability TEXT NOT NULL, -- 'immediate' or 'date'
  availability_date TIMESTAMP WITH TIME ZONE,
  work_preference TEXT NOT NULL, -- 'live_in', 'live_out', or 'both'
  location TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  verification_status verification_status DEFAULT 'pending',
  verification_documents JSONB,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create household profiles table
CREATE TABLE household_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  help_type TEXT[] NOT NULL,
  preferences JSONB NOT NULL, -- Contains live_in, age_range, languages, religion
  additional_info TEXT,
  verification_status verification_status DEFAULT 'pending',
  verification_documents JSONB,
  rating DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create matches table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  helper_id UUID REFERENCES helper_profiles(id) ON DELETE CASCADE NOT NULL,
  household_id UUID REFERENCES household_profiles(id) ON DELETE CASCADE NOT NULL,
  status match_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(helper_id, household_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  payer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  payee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  status payment_status DEFAULT 'pending',
  payment_method TEXT NOT NULL, -- 'paystack', 'flutterwave', etc.
  payment_reference TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create verification requests table
CREATE TABLE verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  document_type TEXT NOT NULL, -- 'id', 'address_proof', etc.
  document_url TEXT NOT NULL,
  status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, reviewer_id)
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'match', 'message', 'payment', etc.
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  related_id UUID, -- Can reference various entities based on type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact messages table
CREATE TABLE contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Helper profiles policies
CREATE POLICY "Helper profiles are viewable by everyone" ON helper_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own helper profile" ON helper_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own helper profile" ON helper_profiles
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND id = helper_profiles.user_id
  ));

-- Household profiles policies
CREATE POLICY "Household profiles are viewable by everyone" ON household_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own household profile" ON household_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own household profile" ON household_profiles
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND id = household_profiles.user_id
  ));

-- Matches policies
CREATE POLICY "Matches are viewable by involved users" ON matches
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM helper_profiles
    WHERE helper_profiles.id = matches.helper_id AND helper_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM household_profiles
    WHERE household_profiles.id = matches.household_id AND household_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can create matches" ON matches
  FOR INSERT WITH CHECK (true); -- Further checks in application logic

CREATE POLICY "Users can update their own matches" ON matches
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM helper_profiles
    WHERE helper_profiles.id = matches.helper_id AND helper_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM household_profiles
    WHERE household_profiles.id = matches.household_id AND household_profiles.user_id = auth.uid()
  ));

-- Messages policies
CREATE POLICY "Messages are viewable by match participants" ON messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM matches
    JOIN helper_profiles ON helper_profiles.id = matches.helper_id
    WHERE matches.id = messages.match_id AND helper_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM matches
    JOIN household_profiles ON household_profiles.id = matches.household_id
    WHERE matches.id = messages.match_id AND household_profiles.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages for their matches" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = messages.match_id AND (
      EXISTS (
        SELECT 1 FROM helper_profiles
        WHERE helper_profiles.id = matches.helper_id AND helper_profiles.user_id = auth.uid()
      ) OR EXISTS (
        SELECT 1 FROM household_profiles
        WHERE household_profiles.id = matches.household_id AND household_profiles.user_id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can update read status of their messages" ON messages
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM matches
    JOIN helper_profiles ON helper_profiles.id = matches.helper_id
    WHERE matches.id = messages.match_id AND helper_profiles.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM matches
    JOIN household_profiles ON household_profiles.id = matches.household_id
    WHERE matches.id = messages.match_id AND household_profiles.user_id = auth.uid()
  ));

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE helper_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Contact messages policies
CREATE POLICY "Users can insert their own contact messages" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own contact messages" ON contact_messages
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Admins can view all contact messages" ON contact_messages
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

CREATE POLICY "Admins can update contact messages" ON contact_messages
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  ));

-- Create functions for real-time features

-- Function to handle new message notifications
CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (user_id, type, content, related_id)
  SELECT 
    CASE 
      WHEN hp.user_id = NEW.sender_id THEN hhp.user_id 
      ELSE hp.user_id 
    END,
    'message',
    'You have a new message',
    NEW.id
  FROM matches m
  JOIN helper_profiles hp ON hp.id = m.helper_id
  JOIN household_profiles hhp ON hhp.id = m.household_id
  WHERE m.id = NEW.match_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_message();

-- Function to handle new match notifications
CREATE OR REPLACE FUNCTION handle_new_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify helper
  INSERT INTO notifications (user_id, type, content, related_id)
  SELECT 
    hp.user_id,
    'match',
    'You have a new match request',
    NEW.id
  FROM helper_profiles hp
  WHERE hp.id = NEW.helper_id;
  
  -- Notify household
  INSERT INTO notifications (user_id, type, content, related_id)
  SELECT 
    hhp.user_id,
    'match',
    'You have a new match request',
    NEW.id
  FROM household_profiles hhp
  WHERE hhp.id = NEW.household_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_match
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE PROCEDURE handle_new_match();

-- Function to handle match status updates
CREATE OR REPLACE FUNCTION handle_match_update()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    -- Notify helper
    INSERT INTO notifications (user_id, type, content, related_id)
    SELECT 
      hp.user_id,
      'match_update',
      CASE 
        WHEN NEW.status = 'accepted' THEN 'Your match request was accepted'
        WHEN NEW.status = 'rejected' THEN 'Your match request was declined'
        ELSE 'Your match status was updated'
      END,
      NEW.id
    FROM helper_profiles hp
    WHERE hp.id = NEW.helper_id;
    
    -- Notify household
    INSERT INTO notifications (user_id, type, content, related_id)
    SELECT 
      hhp.user_id,
      'match_update',
      CASE 
        WHEN NEW.status = 'accepted' THEN 'Your match request was accepted'
        WHEN NEW.status = 'rejected' THEN 'Your match request was declined'
        ELSE 'Your match status was updated'
      END,
      NEW.id
    FROM household_profiles hhp
    WHERE hhp.id = NEW.household_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_match_update
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE PROCEDURE handle_match_update();

-- Function to update profile ratings based on reviews
CREATE OR REPLACE FUNCTION update_profile_rating()
RETURNS TRIGGER AS $$
DECLARE
  helper_id UUID;
  household_id UUID;
  helper_user_id UUID;
  household_user_id UUID;
BEGIN
  -- Get the match details
  SELECT m.helper_id, m.household_id, hp.user_id, hhp.user_id 
  INTO helper_id, household_id, helper_user_id, household_user_id
  FROM matches m
  JOIN helper_profiles hp ON hp.id = m.helper_id
  JOIN household_profiles hhp ON hhp.id = m.household_id
  WHERE m.id = NEW.match_id;
  
  -- Update helper rating if the review is for the helper
  IF NEW.reviewee_id = helper_user_id THEN
    UPDATE helper_profiles
    SET rating = (
      SELECT AVG(rating)
      FROM reviews
      WHERE reviewee_id = helper_user_id
    )
    WHERE user_id = helper_user_id;
  END IF;
  
  -- Update household rating if the review is for the household
  IF NEW.reviewee_id = household_user_id THEN
    UPDATE household_profiles
    SET rating = (
      SELECT AVG(rating)
      FROM reviews
      WHERE reviewee_id = household_user_id
    )
    WHERE user_id = household_user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_review
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_profile_rating();
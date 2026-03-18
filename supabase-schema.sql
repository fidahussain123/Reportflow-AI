-- =====================================================
-- ReportFlow AI - Complete Database Schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- IMPORTANT: Run this BEFORE creating any users!
-- If you already tried to create a user and got an error,
-- delete that user from Authentication > Users first.

-- =====================================================
-- STEP 1: Drop existing objects if they exist (clean slate)
-- =====================================================

-- Drop triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;

-- Drop functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS increment_credits(UUID) CASCADE;
DROP FUNCTION IF EXISTS reset_monthly_credits() CASCADE;
DROP FUNCTION IF EXISTS user_has_credits(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_tier_credit_limit(subscription_tier) CASCADE;

-- Drop views
DROP VIEW IF EXISTS user_stats;

-- Drop tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS usage_logs;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS profiles;

-- Drop types
DROP TYPE IF EXISTS subscription_tier CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS platform_type CASCADE;

-- =====================================================
-- STEP 2: Create ENUMS
-- =====================================================

CREATE TYPE subscription_tier AS ENUM (
  'free',
  'starter',
  'agency', 
  'scale',
  'white_label'
);

CREATE TYPE report_status AS ENUM (
  'processing',
  'completed',
  'failed'
);

CREATE TYPE platform_type AS ENUM (
  'google',
  'meta',
  'both'
);

-- =====================================================
-- STEP 3: Create PROFILES TABLE
-- =====================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  agency_name TEXT,
  avatar_url TEXT,
  
  -- Subscription info
  subscription_tier subscription_tier DEFAULT 'free' NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_period_end TIMESTAMPTZ,
  
  -- Usage tracking
  credits_used INTEGER DEFAULT 0 NOT NULL,
  credits_limit INTEGER DEFAULT 3 NOT NULL,
  credits_reset_at TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- =====================================================
-- STEP 4: Create REPORTS TABLE
-- =====================================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  client_name TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  period TEXT NOT NULL,
  platform platform_type NOT NULL,
  
  google_ads_data JSONB,
  meta_ads_data JSONB,
  
  report_text TEXT NOT NULL,
  status report_status DEFAULT 'completed' NOT NULL,
  pdf_path TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
CREATE INDEX idx_reports_status ON reports(status);

-- =====================================================
-- STEP 5: Create USAGE_LOGS TABLE
-- =====================================================

CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  report_id UUID REFERENCES reports(id) ON DELETE SET NULL,
  
  action TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_usage_logs_user ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_user_date ON usage_logs(user_id, created_at DESC);

-- =====================================================
-- STEP 6: Enable Row Level Security
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: Create RLS Policies
-- =====================================================

-- PROFILES policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role and triggers"
  ON profiles FOR INSERT
  WITH CHECK (true);

-- REPORTS policies
CREATE POLICY "Users can view own reports"
  ON reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON reports FOR DELETE
  USING (auth.uid() = user_id);

-- USAGE_LOGS policies
CREATE POLICY "Users can view own usage"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 8: Create Functions
-- =====================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to increment credits
CREATE OR REPLACE FUNCTION increment_credits(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET credits_used = credits_used + 1
  WHERE id = p_user_id;
END;
$$;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET 
    credits_used = 0,
    credits_reset_at = date_trunc('month', NOW()) + INTERVAL '1 month'
  WHERE credits_reset_at <= NOW();
END;
$$;

-- Function to check credits
CREATE OR REPLACE FUNCTION user_has_credits(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_used INTEGER;
  v_limit INTEGER;
BEGIN
  SELECT credits_used, credits_limit
  INTO v_used, v_limit
  FROM profiles
  WHERE id = p_user_id;
  
  RETURN COALESCE(v_used < v_limit, false);
END;
$$;

-- Function to get tier credit limit
CREATE OR REPLACE FUNCTION get_tier_credit_limit(tier subscription_tier)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN CASE tier
    WHEN 'free' THEN 3
    WHEN 'starter' THEN 25
    WHEN 'agency' THEN 100
    WHEN 'scale' THEN 500
    WHEN 'white_label' THEN 999999
    ELSE 3
  END;
END;
$$;

-- =====================================================
-- STEP 9: Create Triggers
-- =====================================================

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Trigger for updated_at on reports
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- STEP 10: Create Storage Bucket
-- =====================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

-- Storage policies
CREATE POLICY "Users can upload own PDFs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view own PDFs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own PDFs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'reports' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- STEP 11: Create View for Stats
-- =====================================================

CREATE OR REPLACE VIEW user_stats AS
SELECT 
  p.id as user_id,
  p.credits_used,
  p.credits_limit,
  p.subscription_tier,
  COUNT(r.id) as total_reports,
  COUNT(r.id) FILTER (WHERE r.created_at >= date_trunc('month', NOW())) as reports_this_month
FROM profiles p
LEFT JOIN reports r ON r.user_id = p.id
GROUP BY p.id;

-- Grant access
GRANT SELECT ON user_stats TO authenticated;

-- =====================================================
-- DONE! Schema is ready.
-- =====================================================

-- To verify, run:
-- SELECT * FROM profiles;
-- SELECT * FROM reports;

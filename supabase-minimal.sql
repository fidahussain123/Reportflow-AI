-- =====================================================
-- MINIMAL SETUP WITH GOOGLE AUTH SUPPORT
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  agency_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  credits_used INTEGER DEFAULT 0,
  credits_limit INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role and triggers" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 4. Create policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 5. Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 6. Create the trigger function (handles both email and OAuth signups)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _full_name TEXT;
  _avatar_url TEXT;
BEGIN
  -- Get full_name from different possible sources
  _full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',           -- Email signup
    NEW.raw_user_meta_data->>'name',                 -- Google OAuth
    NEW.raw_user_meta_data->>'user_name',            -- Other OAuth
    ''
  );
  
  -- Get avatar from Google OAuth
  _avatar_url := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',              -- Google OAuth
    NULL
  );

  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    _full_name,
    _avatar_url
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

-- =====================================================
-- REPORTS TABLE (for storing generated reports)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  agency_name TEXT NOT NULL,
  period TEXT NOT NULL,
  platform TEXT NOT NULL,
  google_ads_data JSONB,
  meta_ads_data JSONB,
  report_text TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  pdf_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can delete own reports" ON public.reports;

-- Create policies for reports
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.reports TO service_role;

-- =====================================================
-- HELPER FUNCTION: Increment credits
-- =====================================================

CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET credits_used = credits_used + 1
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- DONE! 
-- =====================================================

SELECT 'Setup complete! Tables created: profiles, reports' as status;

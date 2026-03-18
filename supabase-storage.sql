-- =====================================================
-- STORAGE BUCKETS FOR REPORTFLOW AI
-- Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('logos', 'logos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('reports', 'reports', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Logo images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own logo" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own logo" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own PDFs" ON storage.objects;

-- 3. AVATARS POLICIES (public read, authenticated write)

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload avatar to their own folder
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 4. LOGOS POLICIES (public read, authenticated write)

-- Anyone can view logos (public bucket)
CREATE POLICY "Logo images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

-- Users can upload logo to their own folder
CREATE POLICY "Users can upload their own logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own logo
CREATE POLICY "Users can update their own logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own logo
CREATE POLICY "Users can delete their own logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 5. REPORTS POLICIES (private - only owner can access)

-- Users can view their own PDFs
CREATE POLICY "Users can view own PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can upload their own PDFs
CREATE POLICY "Users can upload own PDFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own PDFs
CREATE POLICY "Users can delete own PDFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'reports' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 6. Add logo_url column to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- =====================================================
-- DONE! Storage buckets created:
-- - avatars (public) - for profile pictures
-- - logos (public) - for agency logos  
-- - reports (private) - for PDF files
-- =====================================================

SELECT 'Storage buckets created successfully!' as status;

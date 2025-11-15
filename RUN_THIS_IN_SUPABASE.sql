-- 🔧 COMPLETE DATABASE FIX FOR UP! APP
-- Run this entire script in Supabase SQL Editor (https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/sql/new)

-- ============================================
-- 1. FIX INFINITE RECURSION IN RLS POLICIES
-- ============================================

-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- The old policy was querying users table FROM WITHIN a users table policy
-- This created infinite recursion

-- ============================================
-- 2. ADD PROFILE PICTURE COLUMN TO USERS
-- ============================================

-- Add profile_picture_url column if it doesn't exist
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- Add updated_at column if it doesn't exist  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. VERIFY ALL RLS POLICIES ARE CORRECT
-- ============================================

-- Ensure users can view their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can view own profile'
    ) THEN
        CREATE POLICY "Users can view own profile"
          ON public.users FOR SELECT
          USING (auth.uid() = id);
    END IF;
END $$;

-- Ensure users can update their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can update own profile'
    ) THEN
        CREATE POLICY "Users can update own profile"
          ON public.users FOR UPDATE
          USING (auth.uid() = id);
    END IF;
END $$;

-- Ensure users can insert their own profile
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'users' 
        AND policyname = 'Users can insert own profile'
    ) THEN
        CREATE POLICY "Users can insert own profile"
          ON public.users FOR INSERT
          WITH CHECK (auth.uid() = id);
    END IF;
END $$;

-- ============================================
-- 4. ADD STORAGE BUCKET FOR PROFILE PICTURES
-- ============================================

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public read access to profile pictures
CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Check that everything is working
SELECT 'Users table policies:' as check_type;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users';

SELECT 'Profile picture column exists:' as check_type;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'profile_picture_url';

SELECT 'Storage bucket created:' as check_type;
SELECT id, name, public FROM storage.buckets WHERE id = 'profile-pictures';

SELECT 'Storage policies:' as check_type;
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE '%profile picture%';

-- ============================================
-- SUCCESS! 🎉
-- ============================================
-- Your database is now ready for the UP! app with:
-- ✅ Fixed RLS infinite recursion
-- ✅ Profile picture support
-- ✅ Storage bucket configured
-- ✅ Proper access policies


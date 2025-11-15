# 🚨 CRITICAL: Run This SQL in Supabase NOW

Your app is showing the "infinite recursion" error because of a bug in the database RLS policies.

## Quick Fix (5 minutes):

### 1. Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/sql/new

### 2. Copy and paste this ENTIRE SQL script:

```sql
-- Fix infinite recursion in RLS policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Add profile picture column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own profile picture"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own profile picture"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own profile picture"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'profile-pictures' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public can view profile pictures"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-pictures');
```

### 3. Click "RUN" button

### 4. Verify Success
You should see: "Success. No rows returned"

### 5. Test the App
- Restart Expo: Press Ctrl+C in terminal, then run `npx expo start --clear`
- Open in Expo Go
- Try logging in again - the error should be gone!

---

## What This Fixes:

✅ **Infinite recursion error** - Removes the buggy admin policy  
✅ **Profile pictures** - Adds support for user avatars  
✅ **Storage** - Creates secure bucket for images  
✅ **Timestamps** - Auto-updates when user data changes

---

## After Running:

Your app will have:
- ✅ Working login/registration (no more errors!)
- ✅ Profile picture upload in onboarding
- ✅ User images in Life Wheel center
- ✅ All new UI enhancements

---

**DO THIS NOW** - it takes 2 minutes and fixes the critical database error! 🚀


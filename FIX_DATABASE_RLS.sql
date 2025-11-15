-- 🔧 FIX FOR INFINITE RECURSION ERROR IN RLS POLICIES
-- Run this in Supabase SQL Editor to fix the "infinite recursion detected" error

-- Drop the problematic admin policy that causes recursion
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- The issue: The old policy queried the users table FROM WITHIN a users table policy
-- This creates infinite recursion when trying to check if user is admin

-- Solution: Remove the recursive admin check
-- Admin functionality should be handled at the application level
-- Or use Supabase Auth custom claims instead of database lookups

-- Verify the fix - this should now work:
SELECT * FROM public.users WHERE id = auth.uid();


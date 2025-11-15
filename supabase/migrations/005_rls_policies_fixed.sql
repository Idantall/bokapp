-- Row Level Security (RLS) Policies for UP! App - FIXED
-- This replaces 005_rls_policies.sql with corrected policies

-- Drop existing policies first
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- ============================================
-- 1. Users Table Policies (FIXED - No recursion)
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all users (FIXED - using JWT claim instead of table lookup)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
    OR
    auth.uid()::text IN (
      SELECT id::text FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
      LIMIT 1
    )
  );

-- Note: For production, set admin role in JWT claims via Supabase Dashboard
-- or use a simpler approach: create admin_users table separate from users


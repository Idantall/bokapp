-- ========================================
-- MINIMAL DATABASE SETUP FOR UP! APP
-- Run this in Supabase SQL Editor
-- ========================================

-- 1. CREATE USERS TABLE
-- This extends auth.users with app-specific fields
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_picture_url TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('he', 'en')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CREATE LIFE AREAS TABLE
CREATE TABLE IF NOT EXISTS public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSERT DEFAULT LIFE AREAS
INSERT INTO public.life_areas (key, name_en, name_he, icon, color_hex, order_index)
VALUES
  ('health', 'Health & Fitness', 'בריאות וכושר', '❤️', '#FF5757', 1),
  ('family', 'Family & Friends', 'משפחה וחברים', '👨‍👩‍👧‍👦', '#FFB84D', 2),
  ('career', 'Career & Education', 'קריירה ולימודים', '💼', '#FFE66D', 3),
  ('relationships', 'Love & Relationships', 'אהבה ומערכות יחסים', '💑', '#FF4581', 4),
  ('finances', 'Finances', 'כספים', '💰', '#10B981', 5),
  ('free_time', 'Free Time & Hobbies', 'פנאי ותחביבים', '🎨', '#9F7AEA', 6),
  ('environment', 'Environment & Community', 'סביבה וקהילה', '🌍', '#4ADE94', 7),
  ('meaning', 'Meaning & Purpose', 'משמעות ומטרה', '🧩', '#FF8030', 8)
ON CONFLICT (key) DO NOTHING;

-- 4. CREATE AUTO-UPDATE TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR USERS TABLE
-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own record (for auto-creation)
CREATE POLICY "Users can create own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. RLS POLICIES FOR LIFE AREAS (READ-ONLY FOR ALL)
CREATE POLICY "Life areas are viewable by everyone"
  ON public.life_areas FOR SELECT
  TO authenticated
  USING (true);

-- 8. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_life_areas_key ON public.life_areas(key);

-- ========================================
-- DONE! Your database is ready.
-- ========================================

-- Verify setup:
SELECT 'Users table created' as status, COUNT(*) as user_count FROM public.users
UNION ALL
SELECT 'Life areas created' as status, COUNT(*) as life_area_count FROM public.life_areas;


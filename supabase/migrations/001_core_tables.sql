-- Core Database Tables for Wellness Wheel App

-- 1. Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  city TEXT,
  age_range TEXT,
  language TEXT NOT NULL DEFAULT 'he' CHECK (language IN ('he', 'en')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  onboarding_version TEXT,
  has_seen_home_tour BOOLEAN NOT NULL DEFAULT false,
  primary_focus_life_area_id UUID,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  timezone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Life Areas table (master list of 8 areas)
CREATE TABLE IF NOT EXISTS public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description_en TEXT,
  description_he TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Life Areas (user customization of active areas)
CREATE TABLE IF NOT EXISTS public.user_life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES public.life_areas(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, life_area_id)
);

-- 4. Progress Entries (satisfaction ratings per area over time)
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES public.life_areas(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 0 AND 5),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Goals (goals per life area)
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  life_area_id UUID NOT NULL REFERENCES public.life_areas(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT NOT NULL DEFAULT 'habit' CHECK (goal_type IN ('boolean', 'numeric', 'habit')),
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  target_date DATE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Mood Entries (daily mood tracking)
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
  energy_level INTEGER NOT NULL CHECK (energy_level BETWEEN 1 AND 5),
  stress_level INTEGER NOT NULL CHECK (stress_level BETWEEN 1 AND 5),
  sleep_hours NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Gratitude Entries (daily gratitude journal)
CREATE TABLE IF NOT EXISTS public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, entry_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_user_life_areas_user ON public.user_life_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_user ON public.progress_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_entries_area ON public.progress_entries(life_area_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON public.user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_area ON public.user_goals(life_area_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_user ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_user ON public.gratitude_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_gratitude_entries_date ON public.gratitude_entries(entry_date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER update_user_goals_updated_at
  BEFORE UPDATE ON public.user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


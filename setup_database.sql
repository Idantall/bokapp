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

-- AI & Communication Tables for Wellness Wheel App

-- 1. AI Threads (OpenAI thread persistence per user)
CREATE TABLE IF NOT EXISTS public.ai_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assistant_id TEXT NOT NULL,
  thread_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, assistant_id)
);

-- 2. AI Conversations (conversation grouping with context types)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id TEXT NOT NULL,
  context_type TEXT NOT NULL CHECK (context_type IN ('general', 'goal_setting', 'mood_analysis', 'progress_review')),
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI Messages (message history log)
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User Devices (Expo push tokens)
CREATE TABLE IF NOT EXISTS public.user_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expo_push_token TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('ios', 'android', 'web')),
  app_version TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, expo_push_token)
);

-- 5. User Notification Settings (reminder preferences)
CREATE TABLE IF NOT EXISTS public.user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  mood_reminder_time TIME,
  goal_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
  goal_reminder_time TIME,
  weekly_summary_enabled BOOLEAN NOT NULL DEFAULT true,
  weekly_summary_day INTEGER CHECK (weekly_summary_day BETWEEN 0 AND 6),
  weekly_summary_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Notification Logs (delivery tracking)
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('mood', 'goal', 'weekly_summary', 'admin_broadcast')),
  payload JSONB NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_threads_user ON public.ai_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_thread ON public.ai_conversations(thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON public.ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_user ON public.ai_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON public.user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_type ON public.notification_logs(type);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON public.notification_logs(created_at);

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_ai_threads_updated_at ON public.ai_threads;
CREATE TRIGGER update_ai_threads_updated_at
  BEFORE UPDATE ON public.ai_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON public.ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.user_notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Subscription & Usage Tables for Wellness Wheel App

-- 1. Subscription Plans (static reference table)
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL CHECK (key IN ('free', 'premium')),
  name TEXT NOT NULL,
  price_monthly_usd NUMERIC NOT NULL DEFAULT 0,
  max_goal_life_areas INTEGER,
  ai_message_limit_per_period INTEGER,
  description_en TEXT,
  description_he TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. User Subscriptions (billing state tracking)
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  provider TEXT NOT NULL CHECK (provider IN ('app_store', 'play_store', 'stripe', 'test')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'canceled', 'expired', 'incomplete')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Usage Counters (track AI message limits for free tier)
CREATE TABLE IF NOT EXISTS public.user_usage_counters (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_messages_used_in_period INTEGER NOT NULL DEFAULT 0,
  ai_messages_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Admin Broadcasts (admin notification history)
CREATE TABLE IF NOT EXISTS public.admin_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  segment TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_he TEXT NOT NULL,
  body_en TEXT NOT NULL,
  body_he TEXT NOT NULL,
  deep_link TEXT,
  payload JSONB,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_key ON public.subscription_plans(key);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period ON public.user_subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_admin ON public.admin_broadcasts(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_broadcasts_created ON public.admin_broadcasts(created_at);

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_usage_counters_updated_at ON public.user_usage_counters;
CREATE TRIGGER update_user_usage_counters_updated_at
  BEFORE UPDATE ON public.user_usage_counters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Database Views and Functions for Wellness Wheel App

-- 1. Life Wheel Progress View (latest ratings per area for each user)
CREATE OR REPLACE VIEW public.life_wheel_progress AS
SELECT DISTINCT ON (pe.user_id, pe.life_area_id)
  pe.user_id,
  pe.life_area_id,
  la.key AS life_area_key,
  la.name_en,
  la.name_he,
  la.icon,
  la.color,
  pe.rating,
  pe.notes,
  pe.created_at AS last_updated
FROM public.progress_entries pe
JOIN public.life_areas la ON pe.life_area_id = la.id
ORDER BY pe.user_id, pe.life_area_id, pe.created_at DESC;

-- 2. Mood Analytics View (mood trends with aggregations)
CREATE OR REPLACE VIEW public.mood_analytics AS
SELECT
  user_id,
  DATE(created_at) AS entry_date,
  AVG(mood_score) AS avg_mood,
  AVG(energy_level) AS avg_energy,
  AVG(stress_level) AS avg_stress,
  AVG(sleep_hours) AS avg_sleep,
  COUNT(*) AS entry_count
FROM public.mood_entries
GROUP BY user_id, DATE(created_at);

-- 3. Goal Progress Summary View
CREATE OR REPLACE VIEW public.goal_progress_summary AS
SELECT
  ug.user_id,
  ug.life_area_id,
  la.key AS life_area_key,
  la.name_en,
  la.name_he,
  COUNT(*) AS total_goals,
  COUNT(*) FILTER (WHERE ug.is_completed = true) AS completed_goals,
  COUNT(*) FILTER (WHERE ug.is_completed = false) AS active_goals,
  COUNT(*) FILTER (WHERE ug.is_completed = false AND ug.target_date < CURRENT_DATE) AS overdue_goals,
  ROUND(
    (COUNT(*) FILTER (WHERE ug.is_completed = true)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
    2
  ) AS completion_percentage
FROM public.user_goals ug
JOIN public.life_areas la ON ug.life_area_id = la.id
GROUP BY ug.user_id, ug.life_area_id, la.key, la.name_en, la.name_he;

-- 4. App Metrics Daily View (admin: DAU, signups, activity)
CREATE OR REPLACE VIEW public.app_metrics_daily AS
SELECT
  DATE(created_at) AS metric_date,
  'signups' AS metric_type,
  COUNT(DISTINCT id) AS value
FROM public.users
GROUP BY DATE(created_at)

UNION ALL

SELECT
  DATE(created_at) AS metric_date,
  'mood_entries' AS metric_type,
  COUNT(*) AS value
FROM public.mood_entries
GROUP BY DATE(created_at)

UNION ALL

SELECT
  DATE(created_at) AS metric_date,
  'goals_created' AS metric_type,
  COUNT(*) AS value
FROM public.user_goals
GROUP BY DATE(created_at)

UNION ALL

SELECT
  DATE(updated_at) AS metric_date,
  'goals_completed' AS metric_type,
  COUNT(*) AS value
FROM public.user_goals
WHERE is_completed = true
GROUP BY DATE(updated_at);

-- 5. App Metrics Life Areas View (admin: per-area stats)
CREATE OR REPLACE VIEW public.app_metrics_life_areas AS
SELECT
  la.id AS life_area_id,
  la.key,
  la.name_en,
  la.name_he,
  COUNT(DISTINCT pe.user_id) AS users_with_ratings,
  AVG(pe.rating) AS avg_rating_last_30_days,
  COUNT(DISTINCT ug.id) AS total_goals,
  COUNT(DISTINCT ug.id) FILTER (WHERE ug.is_completed = false) AS active_goals,
  COUNT(DISTINCT ug.id) FILTER (WHERE ug.is_completed = true) AS completed_goals
FROM public.life_areas la
LEFT JOIN public.progress_entries pe 
  ON la.id = pe.life_area_id 
  AND pe.created_at >= CURRENT_DATE - INTERVAL '30 days'
LEFT JOIN public.user_goals ug ON la.id = ug.life_area_id
GROUP BY la.id, la.key, la.name_en, la.name_he;

-- 6. App Metrics Plans View (admin: free vs premium breakdown)
CREATE OR REPLACE VIEW public.app_metrics_plans AS
SELECT
  u.plan,
  COUNT(*) AS user_count,
  COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '7 days') AS new_users_last_7_days,
  COUNT(*) FILTER (WHERE u.created_at >= CURRENT_DATE - INTERVAL '30 days') AS new_users_last_30_days,
  COUNT(*) FILTER (WHERE u.onboarding_completed = true) AS completed_onboarding,
  COUNT(*) FILTER (WHERE EXISTS (
    SELECT 1 FROM public.mood_entries me 
    WHERE me.user_id = u.id 
    AND me.created_at >= CURRENT_DATE - INTERVAL '7 days'
  )) AS active_last_7_days
FROM public.users u
GROUP BY u.plan;

-- 7. Calculate Life Balance Function (overall score 0-100)
CREATE OR REPLACE FUNCTION public.calculate_life_balance(p_user_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
  rating_count INTEGER;
BEGIN
  -- Get average rating across all life areas for the user (latest ratings only)
  SELECT 
    AVG(rating),
    COUNT(*)
  INTO avg_rating, rating_count
  FROM (
    SELECT DISTINCT ON (life_area_id)
      rating
    FROM public.progress_entries
    WHERE user_id = p_user_id
    ORDER BY life_area_id, created_at DESC
  ) latest_ratings;
  
  -- Return null if no ratings
  IF rating_count = 0 THEN
    RETURN NULL;
  END IF;
  
  -- Convert 0-5 scale to 0-100 scale
  RETURN ROUND((avg_rating / 5.0) * 100, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Check Goal Creation Allowed Function (enforce free tier limits)
CREATE OR REPLACE FUNCTION public.check_goal_creation_allowed(
  p_user_id UUID,
  p_life_area_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  user_plan TEXT;
  active_life_areas_count INTEGER;
BEGIN
  -- Get user's current plan
  SELECT plan INTO user_plan
  FROM public.users
  WHERE id = p_user_id;
  
  -- Premium users can create goals in any area
  IF user_plan = 'premium' THEN
    RETURN TRUE;
  END IF;
  
  -- For free users, check if they already have goals in a different life area
  SELECT COUNT(DISTINCT life_area_id)
  INTO active_life_areas_count
  FROM public.user_goals
  WHERE user_id = p_user_id
    AND is_completed = false;
  
  -- If no active goals, allow
  IF active_life_areas_count = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- If has goals, check if they're in the same area as the new goal
  IF EXISTS (
    SELECT 1
    FROM public.user_goals
    WHERE user_id = p_user_id
      AND life_area_id = p_life_area_id
      AND is_completed = false
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Free tier users can only have goals in one life area
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Get Mood Streak Function (consecutive days with mood entries)
CREATE OR REPLACE FUNCTION public.get_mood_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
BEGIN
  -- Count consecutive days backwards from today
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.mood_entries
      WHERE user_id = p_user_id
        AND DATE(created_at) = check_date
    ) THEN
      streak_count := streak_count + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Get Remaining AI Messages Function
CREATE OR REPLACE FUNCTION public.get_remaining_ai_messages(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  user_plan TEXT;
  messages_used INTEGER;
  plan_limit INTEGER;
BEGIN
  -- Get user's plan and usage
  SELECT u.plan, COALESCE(uuc.ai_messages_used_in_period, 0)
  INTO user_plan, messages_used
  FROM public.users u
  LEFT JOIN public.user_usage_counters uuc ON u.id = uuc.user_id
  WHERE u.id = p_user_id;
  
  -- Premium users have unlimited messages
  IF user_plan = 'premium' THEN
    RETURN -1; -- -1 indicates unlimited
  END IF;
  
  -- Get free tier limit
  SELECT ai_message_limit_per_period INTO plan_limit
  FROM public.subscription_plans
  WHERE key = 'free';
  
  -- Return remaining messages
  RETURN GREATEST(0, plan_limit - messages_used);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions to authenticated users
GRANT SELECT ON public.life_wheel_progress TO authenticated;
GRANT SELECT ON public.mood_analytics TO authenticated;
GRANT SELECT ON public.goal_progress_summary TO authenticated;

-- Admin views only for admin role
ALTER VIEW public.app_metrics_daily OWNER TO postgres;
ALTER VIEW public.app_metrics_life_areas OWNER TO postgres;
ALTER VIEW public.app_metrics_plans OWNER TO postgres;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.calculate_life_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_goal_creation_allowed(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_mood_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_remaining_ai_messages(UUID) TO authenticated;

-- Row Level Security (RLS) Policies for Wellness Wheel App

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_life_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_broadcasts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 1. Users Table Policies
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

-- Admins can view all users (but sensitive fields handled in app layer)
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. Life Areas Table Policies (Read-only for users)
-- ============================================

-- All authenticated users can read life areas
CREATE POLICY "Anyone can view life areas"
  ON public.life_areas FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 3. User Life Areas Policies
-- ============================================

CREATE POLICY "Users can view own life areas"
  ON public.user_life_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own life areas"
  ON public.user_life_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own life areas"
  ON public.user_life_areas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own life areas"
  ON public.user_life_areas FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 4. Progress Entries Policies
-- ============================================

CREATE POLICY "Users can view own progress entries"
  ON public.progress_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress entries"
  ON public.progress_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress entries"
  ON public.progress_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own progress entries"
  ON public.progress_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. User Goals Policies
-- ============================================

CREATE POLICY "Users can view own goals"
  ON public.user_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.user_goals FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

CREATE POLICY "Users can update own goals"
  ON public.user_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.user_goals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 6. Mood Entries Policies
-- ============================================

CREATE POLICY "Users can view own mood entries"
  ON public.mood_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON public.mood_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON public.mood_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. Gratitude Entries Policies
-- ============================================

CREATE POLICY "Users can view own gratitude entries"
  ON public.gratitude_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gratitude entries"
  ON public.gratitude_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gratitude entries"
  ON public.gratitude_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gratitude entries"
  ON public.gratitude_entries FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 8. AI Threads Policies
-- ============================================

CREATE POLICY "Users can view own AI threads"
  ON public.ai_threads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI threads"
  ON public.ai_threads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI threads"
  ON public.ai_threads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI threads"
  ON public.ai_threads FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. AI Conversations Policies
-- ============================================

CREATE POLICY "Users can view own AI conversations"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI conversations"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own AI conversations"
  ON public.ai_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own AI conversations"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 10. AI Messages Policies
-- ============================================

CREATE POLICY "Users can view own AI messages"
  ON public.ai_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own AI messages"
  ON public.ai_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. User Devices Policies
-- ============================================

CREATE POLICY "Users can view own devices"
  ON public.user_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices"
  ON public.user_devices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own devices"
  ON public.user_devices FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices"
  ON public.user_devices FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 12. User Notification Settings Policies
-- ============================================

CREATE POLICY "Users can view own notification settings"
  ON public.user_notification_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON public.user_notification_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON public.user_notification_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 13. Notification Logs Policies
-- ============================================

CREATE POLICY "Users can view own notification logs"
  ON public.notification_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Logs are inserted by Edge Functions with service role

-- ============================================
-- 14. Subscription Plans Policies (Read-only)
-- ============================================

CREATE POLICY "Anyone can view subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- 15. User Subscriptions Policies
-- ============================================

CREATE POLICY "Users can view own subscriptions"
  ON public.user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Subscriptions managed by Edge Functions with service role

-- ============================================
-- 16. User Usage Counters Policies
-- ============================================

CREATE POLICY "Users can view own usage counters"
  ON public.user_usage_counters FOR SELECT
  USING (auth.uid() = user_id);

-- Usage counters managed by Edge Functions with service role

-- ============================================
-- 17. Admin Broadcasts Policies
-- ============================================

-- Only admins can view broadcast history
CREATE POLICY "Admins can view all broadcasts"
  ON public.admin_broadcasts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can create broadcasts
CREATE POLICY "Admins can create broadcasts"
  ON public.admin_broadcasts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- Grant necessary permissions
-- ============================================

-- Grant authenticated users access to tables
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.life_areas TO authenticated;
GRANT ALL ON public.user_life_areas TO authenticated;
GRANT ALL ON public.progress_entries TO authenticated;
GRANT ALL ON public.user_goals TO authenticated;
GRANT ALL ON public.mood_entries TO authenticated;
GRANT ALL ON public.gratitude_entries TO authenticated;
GRANT ALL ON public.ai_threads TO authenticated;
GRANT ALL ON public.ai_conversations TO authenticated;
GRANT SELECT, INSERT ON public.ai_messages TO authenticated;
GRANT ALL ON public.user_devices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_notification_settings TO authenticated;
GRANT SELECT ON public.notification_logs TO authenticated;
GRANT SELECT ON public.subscription_plans TO authenticated;
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT SELECT ON public.user_usage_counters TO authenticated;
GRANT SELECT, INSERT ON public.admin_broadcasts TO authenticated;

-- Seed Data for Wellness Wheel App

-- ============================================
-- 1. Insert 8 Life Areas
-- ============================================

INSERT INTO public.life_areas (key, name_en, name_he, icon, color, description_en, description_he, order_index)
VALUES
  (
    'health',
    'Health',
    'בריאות',
    '🏃',
    '#22C55E',
    'Physical and mental wellbeing, exercise, nutrition, sleep',
    'בריאות גופנית ונפשית, פעילות גופנית, תזונה, שינה',
    1
  ),
  (
    'family',
    'Family',
    'משפחה',
    '👨‍👩‍👧‍👦',
    '#F59E0B',
    'Relationships with family members, quality time together',
    'יחסים עם בני משפחה, זמן איכות משותף',
    2
  ),
  (
    'career',
    'Career',
    'קריירה',
    '💼',
    '#3B82F6',
    'Professional development, work satisfaction, goals',
    'התפתחות מקצועית, שביעות רצון בעבודה, יעדים',
    3
  ),
  (
    'relationships',
    'Relationships',
    'קשרים',
    '❤️',
    '#EC4899',
    'Friendships, romantic relationships, social connections',
    'חברויות, קשרים רומנטיים, קשרים חברתיים',
    4
  ),
  (
    'finances',
    'Finances',
    'כלכלה',
    '💰',
    '#10B981',
    'Financial security, budgeting, savings, investments',
    'ביטחון כלכלי, תקציב, חסכונות, השקעות',
    5
  ),
  (
    'free_time',
    'Free Time',
    'פנאי',
    '🎨',
    '#8B5CF6',
    'Hobbies, leisure activities, personal interests',
    'תחביבים, פעילויות פנאי, תחומי עניין אישיים',
    6
  ),
  (
    'environment',
    'Environment',
    'סביבה',
    '🏡',
    '#06B6D4',
    'Living space, neighborhood, organization, comfort',
    'מרחב מחיה, שכונה, ארגון, נוחות',
    7
  ),
  (
    'meaning',
    'Meaning & Purpose',
    'משמעות ודת',
    '🙏',
    '#F97316',
    'Spiritual growth, values, purpose, contribution',
    'צמיחה רוחנית, ערכים, מטרה, תרומה',
    8
  )
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 2. Insert Subscription Plans
-- ============================================

INSERT INTO public.subscription_plans (key, name, price_monthly_usd, max_goal_life_areas, ai_message_limit_per_period, description_en, description_he)
VALUES
  (
    'free',
    'Free',
    0,
    1,
    5,
    'Access to one life area for goals and 5 AI coach messages',
    'גישה לתחום חיים אחד ליעדים ו-5 הודעות מאמן AI'
  ),
  (
    'premium',
    'Premium',
    9.99,
    NULL,
    NULL,
    'Unlimited goals across all life areas, unlimited AI messages, advanced analytics',
    'יעדים ללא הגבלה בכל תחומי החיים, הודעות AI ללא הגבלה, אנליטיקה מתקדמת'
  )
ON CONFLICT (key) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly_usd = EXCLUDED.price_monthly_usd,
  max_goal_life_areas = EXCLUDED.max_goal_life_areas,
  ai_message_limit_per_period = EXCLUDED.ai_message_limit_per_period,
  description_en = EXCLUDED.description_en,
  description_he = EXCLUDED.description_he,
  updated_at = now();

-- ============================================
-- 3. Create default usage counter for existing users
-- ============================================

-- Insert usage counters for any existing users who don't have one
INSERT INTO public.user_usage_counters (user_id)
SELECT id FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_usage_counters WHERE user_id = auth.users.id
)
ON CONFLICT (user_id) DO NOTHING;


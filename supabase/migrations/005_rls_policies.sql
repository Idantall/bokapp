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


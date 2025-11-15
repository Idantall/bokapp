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


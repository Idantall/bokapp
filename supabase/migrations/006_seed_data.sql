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


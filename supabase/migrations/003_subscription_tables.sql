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


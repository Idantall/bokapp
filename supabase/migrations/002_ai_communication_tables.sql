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


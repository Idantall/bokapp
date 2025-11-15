// Database Types for Wellness Wheel App

export type UserRole = 'user' | 'admin';
export type UserPlan = 'free' | 'premium';
export type Language = 'he' | 'en';

export interface User {
  id: string;
  email: string | null;
  full_name: string | null;
  city: string | null;
  age_range: string | null;
  language: Language;
  onboarding_completed: boolean;
  onboarding_version: string | null;
  has_seen_home_tour: boolean;
  primary_focus_life_area_id: string | null;
  plan: UserPlan;
  role: UserRole;
  timezone: string | null;
  created_at: string;
  updated_at: string;
}

export interface LifeArea {
  id: string;
  key: string;
  name_en: string;
  name_he: string;
  icon: string;
  color_hex: string;
  order_index: number;
  created_at: string;
}

export interface UserLifeArea {
  id: string;
  user_id: string;
  life_area_id: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export interface ProgressEntry {
  id: string;
  user_id: string;
  life_area_id: string;
  rating: number; // 0-5
  notes: string | null;
  created_at: string;
}

export type GoalType = 'boolean' | 'numeric' | 'habit';
export type GoalPriority = 'low' | 'medium' | 'high';

export interface UserGoal {
  id: string;
  user_id: string;
  life_area_id: string;
  title: string;
  description: string | null;
  goal_type: GoalType;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  target_date: string | null;
  is_completed: boolean;
  priority: GoalPriority;
  created_at: string;
  updated_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood_score: number; // 1-5
  energy_level: number; // 1-5
  stress_level: number; // 1-5
  sleep_hours: number | null;
  notes: string | null;
  created_at: string;
}

export interface GratitudeEntry {
  id: string;
  user_id: string;
  entry_date: string;
  content: string;
  created_at: string;
}

export type ContextType = 'general' | 'goal_setting' | 'mood_analysis' | 'progress_review';

export interface AiThread {
  id: string;
  user_id: string;
  assistant_id: string;
  thread_id: string;
  created_at: string;
  updated_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  thread_id: string;
  context_type: ContextType;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  expo_push_token: string;
  platform: 'ios' | 'android' | 'web';
  app_version: string | null;
  last_seen_at: string;
  created_at: string;
}

export interface UserNotificationSettings {
  user_id: string;
  mood_reminder_enabled: boolean;
  mood_reminder_time: string | null;
  goal_reminder_enabled: boolean;
  goal_reminder_time: string | null;
  weekly_summary_enabled: boolean;
  weekly_summary_day: number | null;
  weekly_summary_time: string | null;
  created_at: string;
  updated_at: string;
}

export type NotificationType = 'mood' | 'goal' | 'weekly_summary' | 'admin_broadcast';

export interface NotificationLog {
  id: string;
  user_id: string;
  type: NotificationType;
  payload: Record<string, any>;
  status: 'success' | 'error';
  error_message: string | null;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  key: 'free' | 'premium';
  name: string;
  price_monthly_usd: number;
  max_goal_life_areas: number | null;
  ai_message_limit_per_period: number | null;
  description_en: string | null;
  description_he: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  provider: 'app_store' | 'play_store' | 'stripe' | 'test';
  status: 'active' | 'trialing' | 'canceled' | 'expired' | 'incomplete';
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserUsageCounter {
  user_id: string;
  ai_messages_used_in_period: number;
  ai_messages_period_start: string;
  created_at: string;
  updated_at: string;
}

// View Types
export interface LifeWheelProgress {
  user_id: string;
  life_area_id: string;
  life_area_key: string;
  name_en: string;
  name_he: string;
  icon: string;
  color: string;
  rating: number;
  notes: string | null;
  last_updated: string;
}

export interface GoalProgressSummary {
  user_id: string;
  life_area_id: string;
  life_area_key: string;
  name_en: string;
  name_he: string;
  total_goals: number;
  completed_goals: number;
  active_goals: number;
  overdue_goals: number;
  completion_percentage: number;
}


# Supabase Database Setup

This directory contains all SQL migrations for the Wellness Wheel app database.

## Running Migrations

To set up your database, run each migration file in order through your Supabase SQL Editor:

1. Go to your [Supabase Dashboard](https://app.supabase.com/project/vpqxigieedjwqmxducku/sql/new)
2. Open the SQL Editor
3. Run each migration file in order:

### Migration Order

1. **001_core_tables.sql** - Core user, life areas, goals, mood, and gratitude tables
2. **002_ai_communication_tables.sql** - AI threads, conversations, messages, devices, and notifications
3. **003_subscription_tables.sql** - Subscription plans, user subscriptions, usage counters
4. **004_views_and_functions.sql** - Database views and helper functions
5. **005_rls_policies.sql** - Row Level Security policies for data isolation
6. **006_seed_data.sql** - Initial data (8 life areas + subscription plans)

## Database Schema Overview

### Core Tables
- `users` - User profiles with plan, language, role
- `life_areas` - 8 life areas (Health, Family, Career, etc.)
- `user_life_areas` - User customization of life areas
- `progress_entries` - Satisfaction ratings over time
- `user_goals` - Goals per life area
- `mood_entries` - Daily mood tracking
- `gratitude_entries` - Daily gratitude journal

### AI & Communication
- `ai_threads` - OpenAI thread persistence
- `ai_conversations` - Conversation grouping
- `ai_messages` - Message history
- `user_devices` - Push notification tokens
- `user_notification_settings` - Reminder preferences
- `notification_logs` - Delivery tracking

### Subscription & Usage
- `subscription_plans` - Free vs Premium plans
- `user_subscriptions` - User billing state
- `user_usage_counters` - AI message quotas
- `admin_broadcasts` - Admin notification history

### Views
- `life_wheel_progress` - Latest ratings per area
- `mood_analytics` - Mood trends
- `goal_progress_summary` - Goal statistics
- `app_metrics_daily` - Daily metrics (admin)
- `app_metrics_life_areas` - Per-area stats (admin)
- `app_metrics_plans` - Plan breakdown (admin)

### Functions
- `calculate_life_balance(user_id)` - Overall balance score 0-100
- `check_goal_creation_allowed(user_id, life_area_id)` - Free tier validation
- `get_mood_streak(user_id)` - Consecutive days with mood entries
- `get_remaining_ai_messages(user_id)` - AI message quota

## Security

All tables have Row Level Security (RLS) enabled:
- Users can only access their own data
- Admins can view aggregated metrics (no personal text)
- Edge Functions use service role for privileged operations

## Next Steps

After running all migrations:
1. Verify all tables are created in the Supabase Table Editor
2. Check that seed data is present (8 life areas, 2 subscription plans)
3. Test that RLS policies are working by querying as a test user
4. Deploy Edge Functions (see ../supabase/functions/README.md)


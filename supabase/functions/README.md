# Supabase Edge Functions

This directory contains all Edge Functions for the Wellness Wheel app.

## Functions

### 1. `ai-chat`
**Endpoint:** `/functions/v1/ai-chat`

Handles AI wellness coach conversations using OpenAI Assistants API v2.

**Features:**
- Thread persistence and auto-recovery
- Free tier quota enforcement (5 messages)
- Premium unlimited messages
- Bilingual support (Hebrew/English)
- Thread 404 handling with graceful recreation

**Environment Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_ASSISTANT_ID` - Assistant ID (default: asst_woJDvqiqm0qS0YYpwKaaglmL)

### 2. `generate-goal-suggestions`
**Endpoint:** `/functions/v1/generate-goal-suggestions`

Generates 3-5 SMART goal suggestions for a life area using AI.

**Features:**
- Context-aware suggestions based on life area
- Optional rating and description inputs
- Bilingual support
- Fallback suggestions when OpenAI unavailable

**Environment Variables:**
- `OPENAI_API_KEY` - Your OpenAI API key

### 3. `admin-broadcast-notification`
**Endpoint:** `/functions/v1/admin-broadcast-notification`

Sends push notifications to user segments (admin only).

**Features:**
- Admin-only access control
- User segmentation (all, free, premium, inactive, no mood today)
- Bilingual notifications based on user language
- Expo Push API integration
- Broadcast logging

**Environment Variables:**
- `EXPO_PUSH_ACCESS_TOKEN` - Expo push notification access token (optional)

### 4. `send-daily-reminders`
**Endpoint:** `/functions/v1/send-daily-reminders` (cron-triggered)

Sends scheduled reminders based on user preferences.

**Features:**
- Mood check-in reminders
- Goal reminders for upcoming/overdue goals
- Weekly summary notifications
- Timezone-aware scheduling (15-minute windows)
- Notification logging

**Environment Variables:**
- `EXPO_PUSH_ACCESS_TOKEN` - Expo push notification access token (optional)

**Cron Schedule:** Every 15 minutes (recommended)

## Deployment

### Prerequisites
1. [Supabase CLI](https://supabase.com/docs/guides/cli) installed
2. Linked to your Supabase project

### Deploy All Functions

```bash
cd /Users/idant/Bok App
supabase functions deploy ai-chat
supabase functions deploy generate-goal-suggestions
supabase functions deploy admin-broadcast-notification
supabase functions deploy send-daily-reminders
```

### Set Environment Variables

```bash
# OpenAI API Key
supabase secrets set OPENAI_API_KEY=your_openai_api_key

# OpenAI Assistant ID (already set in code)
supabase secrets set OPENAI_ASSISTANT_ID=asst_woJDvqiqm0qS0YYpwKaaglmL

# Expo Push Token (optional, for notifications)
supabase secrets set EXPO_PUSH_ACCESS_TOKEN=your_expo_push_token
```

### Set up Cron Job for Daily Reminders

In your Supabase dashboard, go to **Database > Cron Jobs** and create:

```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',  -- Every 15 minutes
  $$
    SELECT
      net.http_post(
        url:='https://vpqxigieedjwqmxducku.supabase.co/functions/v1/send-daily-reminders',
        headers:=jsonb_build_object(
          'Content-Type','application/json',
          'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
        ),
        body:=jsonb_build_object()
      ) as request_id;
  $$
);
```

## Testing Locally

```bash
# Start Supabase locally
supabase start

# Serve a function
supabase functions serve ai-chat --env-file ./supabase/.env.local

# Test with curl
curl -X POST http://localhost:54321/functions/v1/ai-chat \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","contextType":"general","language":"en"}'
```

## Notes

- All functions use service role key internally for database operations
- RLS policies are bypassed with service role (secure by design)
- CORS enabled for all functions
- Error responses include structured error codes for client handling


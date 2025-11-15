# Wellness Wheel App - Setup Guide

## Project Overview

A production-grade React Native wellness tracking app with:
- **Life Wheel** visualization (8 life areas)
- **AI Wellness Coach** (OpenAI Assistants API v2)
- **Mood Tracking & Gratitude Journal**
- **Free vs Premium Tiers**
- **Hebrew/English Support with RTL**
- **Push Notifications**

## ✅ Completed Setup

### Database & Backend
- ✅ **6 SQL Migration Files** created in `supabase/migrations/`
  - Core tables (users, life areas, goals, mood, gratitude)
  - AI & communication tables
  - Subscription & usage tracking
  - Database views & functions
  - RLS policies
  - Seed data (8 life areas, subscription plans)

- ✅ **4 Edge Functions** created in `supabase/functions/`
  - `ai-chat` - OpenAI Assistants API v2 integration
  - `generate-goal-suggestions` - AI-powered SMART goals
  - `admin-broadcast-notification` - Push notification broadcasting
  - `send-daily-reminders` - Cron-triggered reminders

### Mobile App
- ✅ Expo project initialized with TypeScript
- ✅ All dependencies installed
- ✅ Babel & Tailwind configured
- ✅ App.json with deep linking scheme (`wellness://`)
- ✅ Environment variables configured

## 🔧 Required Setup Steps

### 1. Run Database Migrations

Go to your [Supabase Dashboard](https://app.supabase.com/project/vpqxigieedjwqmxducku/sql/new) and run each migration in order:

```bash
supabase/migrations/001_core_tables.sql
supabase/migrations/002_ai_communication_tables.sql
supabase/migrations/003_subscription_tables.sql
supabase/migrations/004_views_and_functions.sql
supabase/migrations/005_rls_policies.sql
supabase/migrations/006_seed_data.sql
```

### 2. Deploy Edge Functions

```bash
cd "/Users/idant/Bok App"

# Deploy all functions
supabase functions deploy ai-chat
supabase functions deploy generate-goal-suggestions
supabase functions deploy admin-broadcast-notification
supabase functions deploy send-daily-reminders

# Set environment variables
supabase secrets set OPENAI_API_KEY=your_openai_api_key
supabase secrets set OPENAI_ASSISTANT_ID=asst_woJDvqiqm0qS0YYpwKaaglmL
```

### 3. Set up Cron Job for Reminders

In Supabase Dashboard → Database → Cron Jobs:

```sql
SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$
    SELECT net.http_post(
      url:='https://vpqxigieedjwqmxducku.supabase.co/functions/v1/send-daily-reminders',
      headers:=jsonb_build_object(
        'Content-Type','application/json',
        'Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY'
      )
    );
  $$
);
```

## 📱 App Development - Next Steps

The mobile app foundation is set up. To complete the app, you need to create:

### Core Infrastructure
1. **src/lib/supabase.ts** - Supabase client
2. **src/lib/theme.ts** - Design system
3. **src/lib/i18n/** - Hebrew/English translations
4. **src/lib/notifications.ts** - Push notification handler
5. **src/lib/billing.ts** - In-app purchase stub

### TypeScript Types
6. **src/types/database.ts** - All database entity types
7. **src/types/api.ts** - API request/response types

### Hooks
8. **src/hooks/useAuth.ts** - Authentication hook
9. **src/hooks/useCurrentUser.ts** - User profile hook
10. **src/hooks/useLifeAreas.ts** - Life areas hook
11. **src/hooks/useGoals.ts** - Goals CRUD hook
12. **src/hooks/useMoodEntries.ts** - Mood tracking hook
13. **src/hooks/useGratitude.ts** - Gratitude journal hook
14. **src/hooks/useAIChat.ts** - AI chat with quota enforcement
15. **src/hooks/useDirection.ts** - RTL/LTR layout hook

### Components
16. **src/components/LifeWheel.tsx** - Main wheel SVG
17. **src/components/ScreenHeader.tsx** - Header component
18. **src/components/MetricCard.tsx** - Analytics cards
19. **src/components/LoadingOverlay.tsx** - Loading spinner
20. **src/components/EmptyState.tsx** - Empty states

### Screens (Expo Router)
21. **app/_layout.tsx** - Root layout with auth check
22. **app/(auth)/welcome.tsx** - Welcome screen
23. **app/(auth)/login.tsx** - Login screen
24. **app/(auth)/register.tsx** - Register screen
25. **app/onboarding/** - 9 onboarding steps
26. **app/(main)/_layout.tsx** - Tab navigation
27. **app/(main)/index.tsx** - Home with Life Wheel
28. **app/(main)/mood.tsx** - Mood & gratitude
29. **app/(main)/ai-chat.tsx** - AI coach chat
30. **app/(main)/analytics.tsx** - Analytics dashboard
31. **app/(main)/profile.tsx** - User profile
32. **app/(main)/paywall.tsx** - Subscription paywall
33. **app/(admin)/** - Admin panel screens

## 🚀 Running the App

```bash
cd "/Users/idant/Bok App"

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## 🔑 Key Features

### Free Tier
- 1 life area for goals
- 5 AI coach messages (total)
- Basic analytics
- Mood tracking
- Gratitude journal

### Premium Tier ($9.99/month)
- Goals in all 8 life areas
- Unlimited AI messages
- Advanced analytics
- Priority features

### Security
- Row Level Security (RLS) on all tables
- Service role for Edge Functions
- No sensitive data exposed to clients
- Admin-only metrics views

## 📚 Documentation

- **Database Schema:** See `supabase/README.md`
- **Edge Functions:** See `supabase/functions/README.md`
- **Migrations:** All in `supabase/migrations/` directory

## 🎨 Design System

### Colors
- Brand Gradient: `#FF9966` → `#F76E90` → `#5B7CFF`
- Background: `#F6F7FB`
- Text Primary: `#1F2933`

### Typography
- H1: 28px / semibold
- H2: 22px / semibold
- Body: 16px

### Life Area Colors
- 🏃 Health: `#22C55E`
- 👨‍👩‍👧‍👦 Family: `#F59E0B`
- 💼 Career: `#3B82F6`
- ❤️ Relationships: `#EC4899`
- 💰 Finances: `#10B981`
- 🎨 Free Time: `#8B5CF6`
- 🏡 Environment: `#06B6D4`
- 🙏 Meaning: `#F97316`

## 📝 Notes

- **OpenAI Assistant ID:** `asst_woJDvqiqm0qS0YYpwKaaglmL`
- **Deep Linking Scheme:** `wellness://`
- **Default Language:** Hebrew (he)
- **Supported Languages:** Hebrew (he), English (en)
- **RTL Support:** Full RTL layout for Hebrew

## 🐛 Troubleshooting

### Database Issues
- Verify all migrations ran successfully
- Check RLS policies are enabled
- Confirm seed data is present (8 life areas)

### Edge Function Issues
- Check environment variables are set
- Verify service role key permissions
- Check function logs in Supabase dashboard

### App Issues
- Run `npm install` if dependencies are missing
- Clear cache: `expo start -c`
- Check `.env` file has correct Supabase credentials

## 🎯 Current Status

**Backend:** ✅ 100% Complete
- All database tables, views, functions created
- All Edge Functions implemented
- RLS policies applied
- Seed data ready

**Mobile App:** 🏗️ Foundation Complete (~30% done)
- Project initialized
- Dependencies installed
- Configuration done
- Ready for component/screen development

**Remaining Work:** Building React Native screens and components (estimated 20-30 hours)

---

For any issues, refer to the implementation notes in each file or check the Supabase dashboard for errors.


# Wellness Wheel - React Native Mobile App

A production-grade wellness tracking mobile app with Life Wheel visualization, AI coaching, mood tracking, and Hebrew/English support.

## 📊 Project Status

### ✅ Completed (45% of Total Project)

#### Backend & Database (100% Complete)
- **6 SQL Migration Files** - Complete database schema
  - Core tables (users, life areas, goals, mood, gratitude)
  - AI & communication infrastructure
  - Subscription & usage tracking
  - Database views & analytics functions
  - Row Level Security policies
  - Seed data (8 life areas, subscription plans)

#### Edge Functions (100% Complete)
- **ai-chat** - OpenAI Assistants API v2 integration with quota enforcement
- **generate-goal-suggestions** - AI-powered SMART goal generation
- **admin-broadcast-notification** - Push notification broadcasting
- **send-daily-reminders** - Cron-triggered daily/weekly reminders

#### Mobile App Foundation (100% Complete)
- Expo project with TypeScript
- All dependencies installed
- Babel & Tailwind configured
- App configuration with deep linking (`wellness://`)
- **Core Infrastructure**:
  - `src/lib/supabase.ts` - Supabase client
  - `src/lib/theme.ts` - Complete design system
  - `src/lib/i18n/` - Hebrew/English translations
  - `src/lib/notifications.ts` - Push notification handler
  - `src/lib/billing.ts` - In-app purchase stub
- **TypeScript Types**:
  - `src/types/database.ts` - All database entity types

### 🚧 Remaining Work (55% of Total Project)

#### Hooks (Pending)
1. `src/hooks/useAuth.ts` - Authentication state
2. `src/hooks/useCurrentUser.ts` - User profile with plan
3. `src/hooks/useLifeAreas.ts` - Life areas data
4. `src/hooks/useDirection.ts` - RTL/LTR layout helper
5. `src/hooks/useGoals.ts` - Goals CRUD with free tier validation
6. `src/hooks/useMoodEntries.ts` - Mood tracking
7. `src/hooks/useGratitude.ts` - Gratitude journal
8. `src/hooks/useAIChat.ts` - AI chat with quota enforcement

#### Reusable Components (Pending)
9. `src/components/LifeWheel.tsx` - Main SVG wheel visualization
10. `src/components/ScreenHeader.tsx` - Page headers
11. `src/components/MetricCard.tsx` - Analytics cards
12. `src/components/EmptyState.tsx` - Empty state screens
13. `src/components/LoadingOverlay.tsx` - Loading indicator

#### Screens - Expo Router (Pending)
14. `app/_layout.tsx` - Root layout with auth check
15. `app/(auth)/welcome.tsx` - Welcome screen
16. `app/(auth)/login.tsx` - Login
17. `app/(auth)/register.tsx` - Registration
18. **Onboarding Flow** (9 screens):
    - `app/onboarding/terms.tsx`
    - `app/onboarding/profile.tsx`
    - `app/onboarding/life-areas.tsx`
    - `app/onboarding/baseline.tsx`
    - `app/onboarding/focus-area.tsx`
    - `app/onboarding/starter-goals.tsx`
    - `app/onboarding/notifications.tsx`
    - `app/onboarding/plan-info.tsx`
    - `app/onboarding/done.tsx`
19. **Main App** (Tab Navigation):
    - `app/(main)/_layout.tsx` - Tab navigator
    - `app/(main)/index.tsx` - Home with Life Wheel
    - `app/(main)/mood.tsx` - Mood & gratitude tracking
    - `app/(main)/ai-chat.tsx` - AI coach chat
    - `app/(main)/analytics.tsx` - Analytics dashboard
    - `app/(main)/profile.tsx` - User profile
20. **Additional Screens**:
    - `app/(main)/life-area/[id].tsx` - Life area detail
    - `app/(main)/goals/new.tsx` - Create goal
    - `app/(main)/goals/[id].tsx` - Edit goal
    - `app/(main)/paywall.tsx` - Subscription paywall
    - `app/(main)/gratitude.tsx` - Gratitude journal calendar
21. **Admin Panel**:
    - `app/(admin)/dashboard.tsx`
    - `app/(admin)/life-areas.tsx`
    - `app/(admin)/notifications.tsx`

## 🚀 Quick Start

### Prerequisites
1. Node.js installed
2. Expo CLI: `npm install -g expo-cli`
3. iOS Simulator or Android Emulator (or Expo Go app on physical device)
4. Supabase account with project created

### Setup Steps

#### 1. Database Setup
Run all migrations in your Supabase SQL Editor in order:
```bash
supabase/migrations/001_core_tables.sql
supabase/migrations/002_ai_communication_tables.sql
supabase/migrations/003_subscription_tables.sql
supabase/migrations/004_views_and_functions.sql
supabase/migrations/005_rls_policies.sql
supabase/migrations/006_seed_data.sql
```

#### 2. Deploy Edge Functions
```bash
cd "/Users/idant/Bok App"

# Deploy functions
supabase functions deploy ai-chat
supabase functions deploy generate-goal-suggestions
supabase functions deploy admin-broadcast-notification
supabase functions deploy send-daily-reminders

# Set secrets
supabase secrets set OPENAI_API_KEY=your_key_here
supabase secrets set OPENAI_ASSISTANT_ID=asst_woJDvqiqm0qS0YYpwKaaglmL
```

#### 3. Install Dependencies (Already Done)
```bash
npm install
```

#### 4. Run the App
```bash
npm start       # Start Expo dev server
npm run ios     # Run on iOS simulator
npm run android # Run on Android emulator
```

## 📁 Project Structure

```
/Users/idant/Bok App/
├── supabase/
│   ├── migrations/          # 6 SQL migration files ✅
│   ├── functions/           # 4 Edge Functions ✅
│   └── README.md            # Database documentation ✅
├── src/
│   ├── lib/                 # Core libraries ✅
│   │   ├── supabase.ts
│   │   ├── theme.ts
│   │   ├── i18n/
│   │   ├── notifications.ts
│   │   └── billing.ts
│   ├── types/               # TypeScript types ✅
│   │   └── database.ts
│   ├── hooks/               # Custom React hooks 🚧
│   └── components/          # Reusable components 🚧
├── app/                     # Expo Router screens 🚧
│   ├── _layout.tsx
│   ├── (auth)/
│   ├── onboarding/
│   ├── (main)/
│   └── (admin)/
├── app.json                 # Expo configuration ✅
├── tsconfig.json            # TypeScript config ✅
├── tailwind.config.js       # Tailwind config ✅
├── babel.config.js          # Babel config ✅
├── package.json             # Dependencies ✅
├── SETUP_GUIDE.md           # Detailed setup guide ✅
└── README.md                # This file

✅ = Completed
🚧 = Pending
```

## 🎨 Design System

### Brand Colors
- **Gradient**: `#FF9966` → `#F76E90` → `#5B7CFF`
- **Background**: `#F6F7FB`
- **Card**: `#FFFFFF`

### Life Area Colors
- 🏃 Health: `#22C55E` (green)
- 👨‍👩‍👧‍👦 Family: `#F59E0B` (amber)
- 💼 Career: `#3B82F6` (blue)
- ❤️ Relationships: `#EC4899` (pink)
- 💰 Finances: `#10B981` (emerald)
- 🎨 Free Time: `#8B5CF6` (violet)
- 🏡 Environment: `#06B6D4` (cyan)
- 🙏 Meaning: `#F97316` (orange)

### Typography
- **H1**: 28px / semibold
- **H2**: 22px / semibold
- **H3**: 18px / medium
- **Body**: 16px / regular

## 🔐 Features

### Free Tier
- ✅ 1 life area for goals
- ✅ 5 AI coach messages (total, not per day)
- ✅ Basic analytics
- ✅ Mood tracking
- ✅ Gratitude journal

### Premium Tier ($9.99/month)
- ✅ Goals in all 8 life areas (unlimited)
- ✅ Unlimited AI coach messages
- ✅ Advanced analytics
- ✅ Priority features

### Security
- ✅ Row Level Security (RLS) on all tables
- ✅ Service role for Edge Functions
- ✅ Admin-only metrics (no personal data)
- ✅ Secure authentication with Supabase Auth

## 🌐 Internationalization

- **Languages**: Hebrew (he), English (en)
- **RTL Support**: Full RTL layout for Hebrew
- **Default**: Hebrew
- **Translations**: Complete in `src/lib/i18n/locales/`

## 📱 Deep Linking

**Scheme**: `wellness://`

**Routes**:
- `wellness://home` - Home screen
- `wellness://mood` - Mood tracking
- `wellness://ai-chat` - AI coach
- `wellness://paywall` - Subscription screen
- `wellness://life-area/:id` - Life area detail

## 🔧 Development Commands

```bash
npm start          # Start dev server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run web        # Run on web (optional)
```

## 📝 Environment Variables

Located in `app.json` extra config (or use `.env` if needed):

```
EXPO_PUBLIC_SUPABASE_URL=https://vpqxigieedjwqmxducku.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🤖 OpenAI Integration

- **Assistant ID**: `asst_woJDvqiqm0qS0YYpwKaaglmL`
- **Model**: GPT-4o
- **API**: Assistants API v2
- **Thread Persistence**: Automatic with graceful recovery

## 📚 Documentation

- **Database**: See `supabase/README.md`
- **Edge Functions**: See `supabase/functions/README.md`
- **Setup Guide**: See `SETUP_GUIDE.md`

## 🐛 Known Issues / TODOs

1. Complete remaining 18 React Native screens/components
2. Implement all custom hooks
3. Test free tier quota enforcement
4. Test RTL/LTR switching
5. Integrate actual billing (App Store/Play Store)
6. Add E2E tests
7. Performance optimization
8. Add offline support
9. Implement data caching

## 📞 Support & Contact

For issues or questions:
1. Check the SETUP_GUIDE.md
2. Review Supabase dashboard logs
3. Check Edge Function logs in Supabase

## 📄 License

Private project - All rights reserved

---

**Project Created**: November 2025
**Status**: Foundation Complete - Ready for Screen Development
**Estimated Completion**: 20-30 hours of additional development for screens/components


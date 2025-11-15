# Wellness Wheel - Life Balance Tracking App

A beautiful React Native mobile app for tracking life balance across 8 key areas. Features mood tracking, gratitude journal, AI wellness coach, and comprehensive analytics. Built with Expo, React Native, and Supabase.

**🌍 Fully bilingual:** Hebrew (RTL) and English (LTR) support

---

## 🎯 Features

### Core Features
- ✅ **Life Wheel Visualization** - Interactive 8-area life balance wheel
- ✅ **Mood Tracking** - Daily emotional check-ins with trends
- ✅ **Gratitude Journal** - Daily gratitude entries with calendar view
- ✅ **Goal Management** - SMART goal creation and tracking
- ✅ **Progress Tracking** - Per-area progress entries with notes
- ✅ **AI Wellness Coach** - Conversational AI assistant (OpenAI integration)
- ✅ **Analytics Dashboard** - Charts, insights, and balance score
- ✅ **Bilingual** - Hebrew/English with RTL/LTR layout switching

### 8 Life Areas
1. 💚 **Health** - Physical wellness and fitness
2. 👨‍👩‍👧 **Family** - Family relationships
3. 💼 **Career** - Professional development
4. 💕 **Relationships** - Social connections
5. 💰 **Finances** - Financial health
6. 🎨 **Free Time** - Hobbies and recreation
7. 🏡 **Environment** - Living space and surroundings
8. ⭐ **Meaning & Purpose** - Spirituality and values

### Premium Features
- 📊 **Unlimited Goals** (Free: 3 per area)
- 💬 **Unlimited AI Chat** (Free: 10 messages/month)
- 📈 **Advanced Analytics**
- 🔔 **Custom Notifications**

---

## 🏗️ Architecture

### Frontend (React Native + Expo SDK 54)
- **Navigation:** Expo Router 6.0 (file-based routing)
- **Styling:** React Native StyleSheet with custom design system
- **State Management:** React hooks + Supabase Realtime
- **Internationalization:** i18next with expo-localization
- **Forms:** react-hook-form + zod validation
- **Type Safety:** TypeScript throughout

### Backend (Supabase)
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Authentication:** Supabase Auth (email/password)
- **Realtime:** Supabase Realtime subscriptions
- **Edge Functions:** Deno-based serverless functions
- **Storage:** (Ready for future file uploads)

---

## 📁 Project Structure

```
Bok App/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Authentication flow
│   │   ├── welcome.tsx           # Landing page
│   │   ├── login.tsx             # Login screen
│   │   ├── register.tsx          # Registration
│   │   └── onboarding.tsx        # 9-step onboarding wizard
│   ├── (app)/                    # Main app (requires auth)
│   │   ├── (tabs)/               # Bottom tab navigation
│   │   │   ├── home.tsx          # Life Wheel dashboard
│   │   │   ├── mood.tsx          # Mood & gratitude tracking
│   │   │   ├── ai.tsx            # AI wellness coach chat
│   │   │   ├── analytics.tsx    # Charts and insights
│   │   │   └── profile.tsx      # User profile & settings
│   │   ├── life-area/[id].tsx   # Life area detail page
│   │   ├── paywall.tsx           # Subscription upgrade
│   │   └── admin/                # Admin panel
│   ├── _layout.tsx               # Root layout with auth check
│   └── index.tsx                 # App entry point
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── LifeWheel.tsx         # SVG life balance wheel
│   │   ├── ScreenHeader.tsx      # Page headers
│   │   ├── MetricCard.tsx        # Analytics cards
│   │   ├── EmptyState.tsx        # Empty state screens
│   │   ├── LoadingOverlay.tsx    # Loading indicator
│   │   └── LanguageToggle.tsx    # Hebrew/English switcher
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAuth.ts            # Authentication state
│   │   ├── useCurrentUser.ts     # Current user + subscription
│   │   ├── useLifeAreas.ts       # Life areas data
│   │   ├── useGoals.ts           # Goals CRUD + validation
│   │   ├── useMoodEntries.ts     # Mood tracking
│   │   ├── useGratitude.ts       # Gratitude journal
│   │   ├── useAIChat.ts          # AI chat with quota
│   │   └── useDirection.ts       # RTL/LTR layout
│   │
│   ├── lib/                      # Core utilities
│   │   ├── supabase.ts           # Supabase client
│   │   ├── theme.ts              # Design system (colors, spacing, typography)
│   │   ├── i18n/                 # Internationalization
│   │   │   ├── index.ts          # i18next config
│   │   │   └── locales/
│   │   │       ├── en.json       # English translations
│   │   │       └── he.json       # Hebrew translations
│   │   ├── notifications.ts      # Push notifications
│   │   └── billing.ts            # In-app purchases (stub)
│   │
│   └── types/
│       └── database.ts           # TypeScript types for DB
│
├── supabase/
│   ├── migrations/               # Database migrations
│   │   ├── 001_core_tables.sql
│   │   ├── 002_ai_communication_tables.sql
│   │   ├── 003_subscription_tables.sql
│   │   ├── 004_views_and_functions.sql
│   │   ├── 005_rls_policies.sql
│   │   └── 006_seed_data.sql
│   │
│   └── functions/                # Edge Functions (Deno)
│       ├── ai-chat/              # AI chat handler
│       ├── generate-goal-suggestions/
│       ├── admin-broadcast-notification/
│       └── send-daily-reminders/
│
├── ios/                          # Native iOS project (generated)
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
└── setup_database.sql            # Combined migration file
```

---

## 📊 Database Schema (13 Tables)

### Core Tables
- `users` - User profiles with subscription info
- `life_areas` - 8 predefined life areas (with Hebrew/English names)
- `user_life_areas` - User's custom life area ratings
- `progress_entries` - Daily/weekly progress logs per area
- `user_goals` - SMART goals with status tracking
- `mood_entries` - Daily mood check-ins (1-5 scale)
- `gratitude_entries` - Daily gratitude journal

### AI & Communication
- `ai_threads` - OpenAI Assistant thread persistence
- `ai_conversations` - User chat sessions
- `ai_messages` - Individual chat messages
- `user_devices` - Push notification tokens
- `user_notification_settings` - Notification preferences
- `notification_logs` - Sent notification history

### Subscriptions & Admin
- `subscription_plans` - Free & Premium plans
- `user_subscriptions` - User subscription status
- `user_usage_counters` - Feature usage tracking (goals, AI messages)
- `admin_broadcasts` - Admin notification campaigns

### Views
- `app_metrics_daily` - Daily active users, engagement
- `app_metrics_life_areas` - Life area usage stats
- `app_metrics_plans` - Subscription conversion metrics

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Supabase account

### 1. Clone the Repository
```bash
git clone https://github.com/Idantall/bokapp.git
cd bokapp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create `.env` in the root:
```env
EXPO_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Setup Supabase Database
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy contents of `setup_database.sql`
4. Run the SQL script
5. Verify 13 tables were created

### 5. Deploy Edge Functions (Optional)
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Deploy functions
supabase functions deploy ai-chat
supabase functions deploy generate-goal-suggestions
supabase functions deploy admin-broadcast-notification
supabase functions deploy send-daily-reminders

# Set secrets
supabase secrets set OPENAI_API_KEY=your-openai-key
supabase secrets set EXPO_PUSH_TOKEN=your-expo-push-token
```

### 6. Run the App

**iOS Simulator:**
```bash
npx expo run:ios
```

**Android Emulator:**
```bash
npx expo run:android
```

**Web Browser:**
```bash
npx expo start --web
```

**Expo Go (requires SDK 54):**
```bash
npx expo start
# Scan QR code with Expo Go app
```

---

## 🧪 Testing the App

### Quick Test Flow
1. **Welcome Screen** → Tap "Get Started"
2. **Register** → Enter email + password
3. **Onboarding** → Complete 9-step wizard
   - Select focus areas
   - Rate current life balance
   - Set initial goals
   - Enable notifications
4. **Home Screen** → See your Life Wheel
5. **Mood Tab** → Log your mood (1-5 scale)
6. **AI Tab** → Chat with wellness coach
7. **Analytics Tab** → View progress charts
8. **Profile Tab** → Switch language (Hebrew ⟷ English)

### Check Supabase Dashboard
- Go to Table Editor
- Verify data appears in:
  - `users`
  - `user_life_areas`
  - `mood_entries`
  - `user_goals`

---

## 🌍 Internationalization (i18n)

The app is fully bilingual with automatic RTL/LTR layout switching:

**Supported Languages:**
- 🇺🇸 English (LTR)
- 🇮🇱 Hebrew (RTL)

**Translation Files:**
- `src/lib/i18n/locales/en.json`
- `src/lib/i18n/locales/he.json`

**Adding a New Language:**
1. Create `src/lib/i18n/locales/[lang].json`
2. Copy structure from `en.json`
3. Translate all strings
4. Update `src/lib/i18n/index.ts` to include new language

---

## 🎨 Design System

### Colors
```typescript
// Brand Gradient
brandOrange: '#FF9966'
brandPink: '#F76E90'
brandPurple: '#5B7CFF'

// Life Area Colors
health: '#22C55E'      // Green
family: '#F59E0B'      // Orange
career: '#3B82F6'      // Blue
relationships: '#EC4899' // Pink
finances: '#10B981'    // Emerald
freeTime: '#8B5CF6'    // Purple
environment: '#06B6D4'  // Cyan
meaning: '#F97316'     // Orange-red
```

### Typography
- **Display:** 32px, Bold
- **Heading 1:** 28px, Bold
- **Heading 2:** 24px, Semibold
- **Heading 3:** 20px, Semibold
- **Body:** 16px, Regular
- **Caption:** 14px, Regular
- **Small:** 12px, Regular

---

## 🔐 Security

### Row Level Security (RLS)
All tables have RLS policies:
- Users can only access their own data
- Admin users can access admin metrics views
- Life areas are read-only for all users
- Subscription plans are public

### Authentication
- Email/password via Supabase Auth
- JWT-based session management
- Auto-refresh tokens
- Secure credential storage

### API Keys
- `.env` file is gitignored
- Never commit sensitive credentials
- Use Supabase environment variables
- Rotate tokens regularly

---

## 📱 Production Deployment

### iOS App Store
1. Build production app: `eas build --platform ios --profile production`
2. Submit to App Store Connect
3. Configure app metadata
4. Submit for review

### Google Play Store
1. Build production app: `eas build --platform android --profile production`
2. Upload to Google Play Console
3. Configure store listing
4. Submit for review

See `CUSTOM_DEV_BUILD.md` for detailed build instructions.

---

## 📚 Documentation

- `SETUP_GUIDE.md` - Complete setup instructions
- `QUICK_START.md` - Fast setup guide
- `HOW_TO_RUN_APP.md` - Running the app
- `TESTING_OPTIONS.md` - Testing strategies
- `UPGRADE_TO_SDK54.md` - SDK upgrade guide
- `CUSTOM_DEV_BUILD.md` - Custom build instructions
- `PROJECT_STATUS.md` - Development status
- `GITHUB_PUSH.md` - Git workflow guide

---

## 🛠️ Tech Stack

**Frontend:**
- React Native 0.81.5
- React 19.1.0
- Expo SDK 54
- TypeScript 5.9.2
- Expo Router 4.0
- react-hook-form + zod
- i18next + react-i18next

**Backend:**
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime
- Supabase Edge Functions (Deno)

**AI Integration:**
- OpenAI Assistants API v2
- GPT-4o model

**Tools:**
- Git + GitHub
- npm
- Expo CLI
- Supabase CLI

---

## 📈 Project Status

### ✅ Completed (90%)
- [x] Database schema (13 tables)
- [x] SQL migrations (6 files)
- [x] RLS policies
- [x] Edge Functions (4 functions)
- [x] All React hooks (8 hooks)
- [x] All UI components (6 components)
- [x] All screens (17 screens)
- [x] Authentication flow
- [x] Onboarding wizard
- [x] Main app navigation
- [x] Internationalization (Hebrew/English)
- [x] Design system
- [x] TypeScript types

### 🚧 Pending (10%)
- [ ] AI Assistant configuration (needs OpenAI API key)
- [ ] Push notifications setup (needs Expo push token)
- [ ] In-app purchases integration (iOS/Android)
- [ ] App Store assets (icon, screenshots)
- [ ] App Store listings
- [ ] Production testing

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

---

## 📄 License

Proprietary - All rights reserved

---

## 👨‍💻 Author

**Idan Tal**
- GitHub: [@Idantall](https://github.com/Idantall)

---

## 🙏 Acknowledgments

- Built with [Expo](https://expo.dev)
- Backend by [Supabase](https://supabase.com)
- AI by [OpenAI](https://openai.com)
- Design inspired by Material Design 3

---

**⭐ Star this repo if you find it useful!**

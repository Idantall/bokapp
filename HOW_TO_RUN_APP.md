# How to Run Your Wellness Wheel App

## ✅ **Option 1: iOS Simulator (RECOMMENDED - Currently Running!)**

### Status: **Building now...**

Your app is currently building for iOS Simulator. This process takes 2-5 minutes the first time.

### What's Happening:
1. ✅ Expo is generating native iOS code
2. ✅ Xcode is compiling your app
3. ✅ iOS Simulator will open automatically
4. ✅ Your app will launch in the simulator

### What You'll See:
- iOS Simulator window will pop up (looks like an iPhone)
- Your app will install and launch automatically
- Welcome screen with orange gradient background 🎨

### If You See Errors:
- Check your terminal for error messages
- Make sure Xcode is installed: `xcode-select --install`
- Make sure Xcode Command Line Tools are configured: `sudo xcode-select --reset`

### Next Time (Much Faster!):
```bash
cd "/Users/idant/Bok App"
npx expo run:ios
```

---

## Option 2: Web Browser (Backup Option)

If iOS Simulator has issues, you can run on web:

```bash
cd "/Users/idant/Bok App"
npm start
# Then press: w
```

Or:
```bash
npx expo start --web
```

Open: http://localhost:8081

**Note:** Web version is missing `react-native-web` dependency, but we can install it with `--force` if needed.

---

## Option 3: Expo Go (Has Version Conflicts)

⚠️ **Not recommended right now** - Your Expo Go app (SDK 54) doesn't match project (SDK 52).

To use Expo Go, you'd need to upgrade to SDK 54 (see `UPGRADE_TO_SDK54.md`).

---

## 🎯 **What to Test (Once App Launches):**

### 1. Registration Flow
- Tap "Get Started"
- Enter email + password
- Register account

### 2. Onboarding (9 Steps)
- Select life areas
- Set goals
- Complete wizard

### 3. Main App Tabs
- **Home**: See your Life Wheel 🎨
- **Mood**: Log how you feel 😊
- **AI Coach**: Chat with wellness assistant 🤖
- **Analytics**: View your progress 📊
- **Profile**: Settings & language 👤

### 4. Test Features
- ✅ Log mood entry
- ✅ Create gratitude entry
- ✅ Add a goal
- ✅ Switch language (Hebrew ⟷ English)
- ✅ View analytics charts

### 5. Database Integration
- All data saves to Supabase
- Check Supabase dashboard to see entries

---

## 📱 **Current Setup:**

- **Backend**: Supabase (13 tables, fully configured)
- **Frontend**: React Native + Expo SDK 52
- **Navigation**: Expo Router
- **Languages**: Hebrew (RTL) + English (LTR)
- **Design**: Material Design 3 inspired
- **Features**: Life Wheel, Mood, Gratitude, AI Chat, Analytics, Profile

---

## 🚀 **App Should Open in 2-5 Minutes!**

Watch your terminal and iOS Simulator window!


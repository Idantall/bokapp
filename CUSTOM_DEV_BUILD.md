# Custom Development Build (EAS Build)

## Why?
Build a custom version of your app that works with Expo SDK 52 on your phone.

## Requirements:
- Free Expo account
- Apple Developer account ($99/year for iOS)
- 10-20 minutes setup time

## Steps:

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```

### 3. Configure your project
```bash
cd "/Users/idant/Bok App"
eas build:configure
```

### 4. Build for iOS (development)
```bash
eas build --profile development --platform ios
```

### 5. Install on your phone
- EAS will give you a download link
- Install the custom build on your phone
- Scan the QR code from `npx expo start --dev-client`

## Pros:
✅ Works with Expo SDK 52
✅ Test on real device
✅ Production-ready approach
✅ Can test notifications

## Cons:
❌ Requires Expo account
❌ Takes 10-20 minutes to build
❌ iOS requires Apple Developer account

## When to Use:
**When you're ready for final testing before App Store submission.**


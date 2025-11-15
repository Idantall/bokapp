# 🚨 CRITICAL: Fix Database User Creation

## The Problem

You're seeing this error:
```
Error fetching user data:
{"code":"PGRST116","details":"The result contains 0 rows"...}
```

**This means:** Your user account exists in Supabase Auth, but not in the `users` table.

---

## ✅ Immediate Fix

I've updated the code to **automatically create the user record** if it doesn't exist. 

### To Apply the Fix:

1. **Restart the app:**
   ```bash
   # In terminal:
   Ctrl+C  # Stop the current server
   npx expo start --clear
   ```

2. **Log out and log back in:**
   - Open the app
   - Go to Profile → Log out
   - Log back in with your credentials

3. **The code will now:**
   - Detect that your user record is missing
   - Automatically create it with default values
   - Continue working normally

---

## 🔧 What I Changed

### `src/hooks/useCurrentUser.ts`:
- Added error code detection for `PGRST116` (user not found)
- Auto-creates user record with:
  - Your email
  - Default name (from email)
  - Free plan
  - User role
  - Onboarding not completed
- Falls back to default user data if creation fails (so app doesn't crash)

### Welcome Screen (`app/(auth)/welcome.tsx`):
- Fixed title to show "UP!" (48px, not 56px)
- Fixed subtitle sizing (16px, max-width: 280px)
- Made buttons full-width and properly aligned
- Reduced emoji size (80px instead of 100px)
- Better spacing and letter-spacing

---

## 🎯 Alternative: Run SQL Fix (If Auto-Creation Fails)

If the automatic fix doesn't work (RLS blocking), you can manually create your user:

### Step 1: Go to Supabase SQL Editor
https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/sql/new

### Step 2: Run this SQL:

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Then insert your user (replace YOUR_USER_ID with actual ID from above)
INSERT INTO public.users (id, email, full_name, preferred_language, plan, role, onboarding_completed)
VALUES (
  'YOUR_USER_ID',  -- Replace with your actual user ID
  'your@email.com',  -- Replace with your actual email
  'Your Name',
  'en',
  'free',
  'user',
  false
)
ON CONFLICT (id) DO NOTHING;
```

### Step 3: Restart the app

---

## 🐛 If You Still See Errors

### Option A: Delete and Re-register
1. Go to Supabase Dashboard → Authentication → Users
2. Find your user and delete it
3. In the app, register again with the same email
4. The new code will create the user record automatically

### Option B: Fix RLS Policies
The RLS policies might be blocking user creation. Run the SQL from `RUN_THIS_IN_SUPABASE.sql`:

```sql
-- Allow users to insert their own record on sign-up
CREATE POLICY "Users can create their own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own record
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own record
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## ✅ After the Fix

You should see:
- ✅ "Hello, [Your Name]" instead of "Hello, {{fname}}"
- ✅ Life wheel loads properly
- ✅ No error at the bottom of the screen
- ✅ Welcome screen shows "UP!" clearly
- ✅ Buttons are aligned and full-width

---

## 📱 Testing Checklist

- [ ] Restart Expo (`npx expo start --clear`)
- [ ] Log out and log back in
- [ ] Home screen loads without errors
- [ ] Your name appears in greeting
- [ ] Life wheel shows with scores
- [ ] "Active Goals" and "Day Streak" cards visible
- [ ] Welcome screen shows "UP!" title (not "wellness Wheel")
- [ ] Buttons are aligned and responsive

---

## 🆘 Still Not Working?

If you're still seeing errors after all this:

1. **Check Supabase logs:**
   - Go to Supabase Dashboard → Logs
   - Look for errors related to INSERT on `users` table

2. **Share the error with me:**
   - Take a screenshot of the console error
   - Let me know the exact steps to reproduce

3. **Temporary workaround:**
   - The app will use default user data even if fetch fails
   - You can continue testing other features
   - Just fix the database when convenient

---

**Priority:** HIGH 🔴  
**Estimated fix time:** 2 minutes  
**Impact:** Critical - blocks user from using the app


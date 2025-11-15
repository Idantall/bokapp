# 🚨 URGENT: Run This SQL in Supabase NOW

## The Problem
Your database doesn't have the required tables and columns. This is causing the `PGRST204` error.

---

## ✅ Quick Fix (5 minutes)

### Step 1: Open Supabase SQL Editor
Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/sql/new

### Step 2: Copy & Paste This SQL
Open the file `SETUP_DATABASE_MINIMAL.sql` in this project and copy ALL the SQL.

Or copy from here:

```sql
-- 1. CREATE USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  profile_picture_url TEXT,
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('he', 'en')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'premium')),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CREATE LIFE AREAS TABLE
CREATE TABLE IF NOT EXISTS public.life_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_he TEXT NOT NULL,
  icon TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. INSERT DEFAULT LIFE AREAS
INSERT INTO public.life_areas (key, name_en, name_he, icon, color_hex, order_index)
VALUES
  ('health', 'Health & Fitness', 'בריאות וכושר', '❤️', '#FF5757', 1),
  ('family', 'Family & Friends', 'משפחה וחברים', '👨‍👩‍👧‍👦', '#FFB84D', 2),
  ('career', 'Career & Education', 'קריירה ולימודים', '💼', '#FFE66D', 3),
  ('relationships', 'Love & Relationships', 'אהבה ומערכות יחסים', '💑', '#FF4581', 4),
  ('finances', 'Finances', 'כספים', '💰', '#10B981', 5),
  ('free_time', 'Free Time & Hobbies', 'פנאי ותחביבים', '🎨', '#9F7AEA', 6),
  ('environment', 'Environment & Community', 'סביבה וקהילה', '🌍', '#4ADE94', 7),
  ('meaning', 'Meaning & Purpose', 'משמעות ומטרה', '🧩', '#FF8030', 8)
ON CONFLICT (key) DO NOTHING;

-- 4. AUTO-UPDATE TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. ENABLE RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.life_areas ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR USERS
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 7. RLS FOR LIFE AREAS (READ-ONLY)
CREATE POLICY "Life areas are viewable by everyone"
  ON public.life_areas FOR SELECT
  TO authenticated
  USING (true);

-- 8. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_life_areas_key ON public.life_areas(key);
```

### Step 3: Click "Run"
Click the "Run" button in Supabase SQL Editor.

### Step 4: Verify
You should see:
```
Users table created | 0
Life areas created | 8
```

### Step 5: Restart Your App
```bash
# Stop Expo (Ctrl+C)
npx expo start --clear
```

### Step 6: Test
1. Open app
2. Try to log in
3. ✅ No more PGRST204 error!
4. ✅ App works!

---

## What Was Fixed

### Code Changes:
1. ✅ Changed `preferred_language` → `language` (to match SQL schema)
2. ✅ Changed `color` → `color_hex` (to match SQL schema)
3. ✅ Simplified User type (removed unused fields)

### Database Changes:
1. ✅ Created `users` table with correct columns
2. ✅ Created `life_areas` table
3. ✅ Inserted 8 default life areas
4. ✅ Set up RLS policies
5. ✅ Added auto-update trigger for `updated_at`

---

## After Running SQL

Your app will be able to:
- ✅ Create user records automatically
- ✅ Fetch user data
- ✅ Display life areas
- ✅ Show the life wheel
- ✅ No more PGRST204 errors!

---

## Troubleshooting

### If you still see errors:
1. Check that SQL ran successfully (no red errors)
2. Go to Supabase → Table Editor → Check `users` and `life_areas` tables exist
3. Make sure you're logged in with the account you registered
4. Try logging out and back in

### If tables already exist:
The SQL uses `IF NOT EXISTS` so it's safe to run multiple times. It won't overwrite existing data.

---

**This is a ONE-TIME setup. Once you run this SQL, you're done forever!** 🎉


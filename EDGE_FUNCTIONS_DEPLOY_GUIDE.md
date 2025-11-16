# 🚀 EDGE FUNCTIONS DEPLOYMENT GUIDE

## **IMPORTANT: You Need Your API Keys**

```
OPENAI_API_KEY: Your OpenAI API key (starts with sk-proj-...)
OPENAI_ASSISTANT_ID: Your OpenAI Assistant ID (starts with asst_...)
```

> **Your actual keys are in the local file: `.env.local` (not committed to GitHub)**

---

## **Option 1: Deploy via Supabase Dashboard** (Easiest!)

### **Step 1: Set Environment Secrets**

1. Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/settings/functions
2. Click **"Environment Variables"** or **"Secrets"**
3. Add these TWO secrets:

**Secret 1:**
```
Name: OPENAI_API_KEY
Value: YOUR_OPENAI_API_KEY_HERE (see .env.local)
```

**Secret 2:**
```
Name: OPENAI_ASSISTANT_ID
Value: YOUR_OPENAI_ASSISTANT_ID_HERE (see .env.local)
```

### **Step 2: Deploy ai-chat Function**

1. Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/functions
2. Click **"Create a new function"** or **"Deploy"**
3. **Name**: `ai-chat`
4. **Copy/paste** the entire contents of: `supabase/functions/ai-chat/index.ts`
5. Click **Deploy**

### **Step 3: Deploy ai-goal-suggestions Function**

1. Click **"Create a new function"** again
2. **Name**: `ai-goal-suggestions`
3. **Copy/paste** the entire contents of: `supabase/functions/ai-goal-suggestions/index.ts`
4. Click **Deploy**

---

## **Option 2: Deploy via Supabase CLI** (Advanced)

### **Prerequisites**

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Supabase CLI
brew install supabase/tap/supabase
```

### **Deploy Commands**

```bash
cd "/Users/idant/Bok App"

# Login to Supabase
supabase login

# Link project
supabase link --project-ref vpqxigieedjwqmxducku

# Set secrets (replace with your actual keys from .env.local)
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

supabase secrets set OPENAI_ASSISTANT_ID=YOUR_OPENAI_ASSISTANT_ID_HERE

# Deploy functions
supabase functions deploy ai-chat --no-verify-jwt
supabase functions deploy ai-goal-suggestions --no-verify-jwt
```

---

## **✅ Verify Deployment**

### **Check Functions are Live**

1. Go to: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/functions
2. You should see:
   - ✅ `ai-chat` (status: Active)
   - ✅ `ai-goal-suggestions` (status: Active)

### **Test in the App**

1. Open your app in Expo Go
2. **Test AI Chat**:
   - Navigate to **AI Coach** tab (מאמן AI)
   - Send: "Hello, I need help with goal setting"
   - You should get a response within 5-10 seconds
3. **Test Goal Suggestions**:
   - Go to a life area (e.g., Health)
   - Tap "Create Goal" or "+"
   - Tap "Get AI Suggestions" button
   - You should see 3 AI-generated goal ideas

---

## **📊 What Each Function Does**

### **ai-chat**
- Powers the AI wellness coach tab
- Uses OpenAI Assistants API v2
- Maintains conversation threads
- Enforces quota (5 free, unlimited premium)
- Logs all messages to database

### **ai-goal-suggestions**
- Generates SMART goal suggestions for life areas
- Uses OpenAI GPT-4o-mini (fast & cost-effective)
- Considers user's baseline score
- Avoids suggesting duplicate goals
- Returns 3 suggestions with title, description, timeframe

---

## **🛠️ Troubleshooting**

### **"No API key found in request"**
- ✅ Add `OPENAI_API_KEY` secret in Supabase Dashboard
- ✅ Redeploy the function after adding the secret

### **"Invalid assistant ID"**
- ✅ Add `OPENAI_ASSISTANT_ID` secret
- ✅ Or remove the secret to use the default

### **"THREAD_EXPIRED" error**
- ✅ Normal behavior - the app will auto-create a new thread
- ✅ This happens when the OpenAI thread is old (30 days+)

### **"AI_LIMIT_REACHED"**
- ✅ User hit the 5 messages/day limit (free tier)
- ✅ Tell them to upgrade to Premium for unlimited

### **Function not appearing in dashboard**
- ✅ Refresh the page
- ✅ Check that you selected the correct project
- ✅ Try deploying again

---

## **💰 Cost Estimates**

### **OpenAI Costs**

| Model | Use Case | Cost per 1M tokens | Estimated cost |
|-------|----------|-------------------|----------------|
| GPT-4o-mini | Goal suggestions | $0.15 / $0.60 | ~$0.0015 per suggestion |
| GPT-4-turbo | AI chat (Assistant) | $10 / $30 | ~$0.05 per conversation |

**Typical usage:**
- 100 users × 5 AI messages/day = ~$25/month
- 100 users × 10 goal suggestions/month = ~$1.50/month

**Total estimated cost: $26.50/month for 100 active users**

---

## **🎉 You're All Set!**

Once deployed, your app will have:

1. ✅ **AI Wellness Coach** (ai-chat)
   - Conversational AI support
   - Persistent threads
   - Quota management
   - Multi-language (Hebrew/English)

2. ✅ **AI Goal Suggestions** (ai-goal-suggestions)
   - SMART goal generation
   - Context-aware suggestions
   - Baseline score consideration
   - 3 suggestions per request

3. ✅ **Data Security**
   - All sensitive data in Edge Functions (server-side)
   - API keys never exposed to client
   - RLS policies enforced
   - User authentication required

---

## **📝 Next Steps**

1. ✅ Deploy the functions using **Option 1** (Dashboard) or **Option 2** (CLI)
2. ✅ Test AI chat in the app
3. ✅ Test goal suggestions when creating a new goal
4. ✅ Monitor logs: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku/functions
5. ✅ Check OpenAI usage: https://platform.openai.com/usage

**Need help? Let me know!** 🚀


# 🤖 AI INTEGRATION SETUP GUIDE

## **Current Status**

Your AI Edge Function is **100% complete** and ready to use. It just needs API keys configured in Supabase.

---

## **What You Need**

### 1. **OpenAI API Key**
- Go to: https://platform.openai.com/api-keys
- Create a new key (if you don't have one)
- Copy the key (starts with `sk-...`)

### 2. **OpenAI Assistant ID** (Optional)
- If you have a specific assistant, use its ID
- If not, the code will use the default: `asst_woJDvqiqm0qS0YYpwKaaglmL`

---

## **Setup Steps in Supabase**

### **Step 1: Go to Edge Functions Settings**

1. Open your Supabase project: https://supabase.com/dashboard/project/vpqxigieedjwqmxducku
2. Click **Edge Functions** in the left sidebar
3. Click **Settings** (or **Secrets** if you see it)

---

### **Step 2: Add Environment Variables**

Click **"New Secret"** and add these **two** secrets:

#### **Secret 1: OPENAI_API_KEY**
```
Name: OPENAI_API_KEY
Value: sk-your-actual-openai-key-here
```

#### **Secret 2: OPENAI_ASSISTANT_ID** (Optional)
```
Name: OPENAI_ASSISTANT_ID
Value: asst_your-assistant-id-here
```

> **Note:** If you don't add `OPENAI_ASSISTANT_ID`, the code will use the default one.

---

### **Step 3: Deploy the Edge Function**

#### **Option A: Using Supabase CLI** (Recommended)

1. **Install Supabase CLI** (if not installed):
```bash
brew install supabase/tap/supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link your project**:
```bash
cd "/Users/idant/Bok App"
supabase link --project-ref vpqxigieedjwqmxducku
```

4. **Deploy the ai-chat function**:
```bash
supabase functions deploy ai-chat --no-verify-jwt
```

#### **Option B: Using Supabase Dashboard**

1. Go to **Edge Functions** → **Deploy new function**
2. Name: `ai-chat`
3. Copy/paste the contents of `supabase/functions/ai-chat/index.ts`
4. Click **Deploy**

---

## **Testing the AI Integration**

### **1. Test in the App**

1. Open your app in Expo Go
2. Navigate to the **AI Coach** tab (מאמן AI)
3. Send a test message like:
   - English: "Hello, I need help setting goals"
   - Hebrew: "שלום, אני צריך עזרה עם יעדים"
4. You should get a response within 5-10 seconds

### **2. Check for Errors**

If AI doesn't work, check:

1. **Supabase Logs**:
   - Go to: Dashboard → Edge Functions → ai-chat → Logs
   - Look for error messages

2. **Common Issues**:
   - ❌ `No API key found` → Add `OPENAI_API_KEY` secret
   - ❌ `Invalid assistant ID` → Check `OPENAI_ASSISTANT_ID` or remove it
   - ❌ `THREAD_EXPIRED` → Normal, the app will auto-create a new thread
   - ❌ `AI_LIMIT_REACHED` → User hit the 5 messages/day limit (free tier)

---

## **How It Works**

### **Architecture**

```
Mobile App (React Native)
    ↓
Supabase Edge Function (ai-chat)
    ↓
OpenAI Assistants API v2
    ↓
Response back to app
```

### **Features**

- ✅ **Persistent Threads**: Each user gets their own conversation thread
- ✅ **Context Awareness**: AI knows user's language, life areas, and goals
- ✅ **Quota Management**: Free users get 5 messages/day, Premium unlimited
- ✅ **Database Logging**: All messages saved to `ai_messages` table
- ✅ **Hebrew & English Support**: Automatically detects and responds in user's language

---

## **Free vs Premium Limits**

| Feature | Free | Premium |
|---------|------|---------|
| AI Messages/Day | 5 | Unlimited |
| Conversation History | ✅ | ✅ |
| Multi-language | ✅ | ✅ |
| Context Awareness | ✅ | ✅ |

---

## **API Keys You'll Need to Provide**

Please provide me with:

1. **OpenAI API Key**: `sk-...`
2. **OpenAI Assistant ID** (if you have one): `asst-...`

I'll help you set them up in Supabase! 🚀

---

## **Creating a Custom OpenAI Assistant** (Optional)

If you want a custom wellness coach assistant:

1. Go to: https://platform.openai.com/assistants
2. Click **"Create Assistant"**
3. **Configure**:
   - **Name**: UP! Wellness Coach
   - **Instructions**: 
     ```
     You are a compassionate wellness coach for the UP! app. 
     Help users set SMART goals, track their life balance, 
     and provide emotional support. Always respond in the 
     user's language (Hebrew or English).
     ```
   - **Model**: `gpt-4-turbo` or `gpt-4o`
   - **Tools**: None needed
4. Click **Save**
5. Copy the Assistant ID (starts with `asst-...`)
6. Add it to Supabase secrets as `OPENAI_ASSISTANT_ID`

---

## **Next Steps**

1. ✅ Provide me with your OpenAI API key
2. ✅ I'll deploy the Edge Function
3. ✅ Test the AI integration in the app
4. ✅ Enjoy unlimited AI coaching! (if premium)

Let me know when you have the API key and I'll help you set it up! 🎉


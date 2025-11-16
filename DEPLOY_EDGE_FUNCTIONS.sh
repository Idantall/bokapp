#!/bin/bash

# ========================================
# DEPLOY SUPABASE EDGE FUNCTIONS
# ========================================

echo "🚀 Deploying Supabase Edge Functions..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "${YELLOW}⚠️  Supabase CLI not found!${NC}"
    echo "Installing Supabase CLI..."
    brew install supabase/tap/supabase
fi

# Check if logged in
echo "${BLUE}📝 Checking Supabase authentication...${NC}"
if ! supabase projects list &> /dev/null; then
    echo "${YELLOW}Please login to Supabase:${NC}"
    supabase login
fi

# Link project (if not already linked)
echo "${BLUE}🔗 Linking to project...${NC}"
supabase link --project-ref vpqxigieedjwqmxducku

# Set secrets (environment variables)
echo ""
echo "${BLUE}🔐 Setting environment secrets...${NC}"
echo "Setting OPENAI_API_KEY..."
supabase secrets set OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

echo "Setting OPENAI_ASSISTANT_ID..."
supabase secrets set OPENAI_ASSISTANT_ID=YOUR_OPENAI_ASSISTANT_ID_HERE

# Deploy ai-chat function
echo ""
echo "${BLUE}📤 Deploying ai-chat function...${NC}"
supabase functions deploy ai-chat --no-verify-jwt

# Deploy ai-goal-suggestions function
echo ""
echo "${BLUE}📤 Deploying ai-goal-suggestions function...${NC}"
supabase functions deploy ai-goal-suggestions --no-verify-jwt

echo ""
echo "${GREEN}✅ Edge Functions deployed successfully!${NC}"
echo ""
echo "📋 Deployed functions:"
echo "  • ai-chat - AI wellness coach chat"
echo "  • ai-goal-suggestions - AI-powered SMART goal suggestions"
echo ""
echo "🧪 Test the functions in your app:"
echo "  1. Open the app in Expo Go"
echo "  2. Navigate to AI Coach tab (מאמן AI)"
echo "  3. Send a test message"
echo "  4. When creating a new goal, tap 'Get AI Suggestions'"
echo ""
echo "${GREEN}🎉 All done!${NC}"


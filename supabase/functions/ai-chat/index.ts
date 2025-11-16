// AI Chat Edge Function - OpenAI Assistants API v2 Integration
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const ASSISTANT_ID = Deno.env.get('OPENAI_ASSISTANT_ID') || 'asst_woJDvqiqmOqS0YYpwKaaglmL';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatRequest {
  message: string;
  contextType: 'general' | 'goal_setting' | 'mood_analysis' | 'progress_review';
  language: 'he' | 'en';
  lifeAreaId?: string;
  goalId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get user ID from JWT
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authorization token');
    }

    const userId = user.id;

    // Parse request body
    const body: ChatRequest = await req.json();
    const { message, contextType, language, lifeAreaId, goalId } = body;

    if (!message || !contextType || !language) {
      throw new Error('Missing required fields: message, contextType, language');
    }

    // ========================================
    // 1. Check subscription and usage quota
    // ========================================
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('plan')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      throw new Error('User not found');
    }

    const userPlan = userData.plan;

    // Check usage counter
    const { data: usageData } = await supabase
      .from('user_usage_counters')
      .select('ai_messages_used_in_period')
      .eq('user_id', userId)
      .single();

    const messagesUsed = usageData?.ai_messages_used_in_period || 0;

    // Get plan limit
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('ai_message_limit_per_period')
      .eq('key', userPlan)
      .single();

    const messageLimit = planData?.ai_message_limit_per_period;

    // Check if free tier quota exceeded
    if (userPlan === 'free' && messageLimit && messagesUsed >= messageLimit) {
      return new Response(
        JSON.stringify({
          error: 'AI_LIMIT_REACHED',
          message:
            language === 'he'
              ? 'הגעת למגבלת 5 ההודעות בחינם. שדרג לפרימיום למסרים ללא הגבלה.'
              : 'You have reached your free tier limit of 5 messages. Upgrade to Premium for unlimited messages.',
          plan: userPlan,
          remainingFreeMessages: 0,
        }),
        {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // ========================================
    // 2. Get or create OpenAI thread
    // ========================================
    let threadId: string;

    const { data: threadData, error: threadError } = await supabase
      .from('ai_threads')
      .select('thread_id')
      .eq('user_id', userId)
      .eq('assistant_id', ASSISTANT_ID)
      .single();

    if (threadData && threadData.thread_id) {
      threadId = threadData.thread_id;
    } else {
      // Create new thread if not found
      const createThreadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({}),
      });

      if (!createThreadResponse.ok) {
        throw new Error('Failed to create OpenAI thread');
      }

      const threadResult = await createThreadResponse.json();
      threadId = threadResult.id;

      // Save thread to database
      await supabase.from('ai_threads').upsert({
        user_id: userId,
        assistant_id: ASSISTANT_ID,
        thread_id: threadId,
      });
    }

    // ========================================
    // 3. Send user message with context
    // ========================================
    const contextPrefix =
      language === 'he' ? `[שפה: עברית]` : `[Language: English]`;
    const fullMessage = `${contextPrefix} ${message}`;

    const addMessageResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          role: 'user',
          content: fullMessage,
        }),
      }
    );

    if (!addMessageResponse.ok) {
      const errorText = await addMessageResponse.text();
      
      // Handle thread not found error
      if (addMessageResponse.status === 404) {
        // Delete stale thread from database
        await supabase
          .from('ai_threads')
          .delete()
          .eq('user_id', userId)
          .eq('assistant_id', ASSISTANT_ID);

        throw new Error('THREAD_EXPIRED');
      }

      throw new Error(`Failed to add message: ${errorText}`);
    }

    // ========================================
    // 4. Start a run
    // ========================================
    const runResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/runs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
          'OpenAI-Beta': 'assistants=v2',
        },
        body: JSON.stringify({
          assistant_id: ASSISTANT_ID,
        }),
      }
    );

    if (!runResponse.ok) {
      throw new Error('Failed to start run');
    }

    const runResult = await runResponse.json();
    const runId = runResult.id;

    // ========================================
    // 5. Poll run status until completion
    // ========================================
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Wait 1.5s

      const statusResponse = await fetch(
        `https://api.openai.com/v1/threads/${threadId}/runs/${runId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2',
          },
        }
      );

      if (!statusResponse.ok) {
        throw new Error('Failed to check run status');
      }

      const statusResult = await statusResponse.json();
      runStatus = statusResult.status;

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Run failed with status: ${runStatus}`);
      }

      attempts++;
    }

    if (runStatus !== 'completed') {
      throw new Error('Run timeout - please try again');
    }

    // ========================================
    // 6. Retrieve assistant's response
    // ========================================
    const messagesResponse = await fetch(
      `https://api.openai.com/v1/threads/${threadId}/messages?order=desc&limit=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'OpenAI-Beta': 'assistants=v2',
        },
      }
    );

    if (!messagesResponse.ok) {
      throw new Error('Failed to retrieve messages');
    }

    const messagesResult = await messagesResponse.json();
    const lastMessage = messagesResult.data[0];
    const assistantMessage = lastMessage.content[0].text.value;

    // ========================================
    // 7. Save conversation and increment usage
    // ========================================
    // Create/update conversation
    const { data: conversationData } = await supabase
      .from('ai_conversations')
      .upsert({
        user_id: userId,
        thread_id: threadId,
        context_type: contextType,
        title: message.substring(0, 100),
      })
      .select()
      .single();

    const conversationId = conversationData?.id;

    // Save messages
    if (conversationId) {
      await supabase.from('ai_messages').insert([
        {
          conversation_id: conversationId,
          user_id: userId,
          role: 'user',
          content: message,
          metadata: { context_type: contextType, life_area_id: lifeAreaId, goal_id: goalId },
        },
        {
          conversation_id: conversationId,
          user_id: userId,
          role: 'assistant',
          content: assistantMessage,
        },
      ]);
    }

    // Increment usage counter
    await supabase.from('user_usage_counters').upsert({
      user_id: userId,
      ai_messages_used_in_period: messagesUsed + 1,
    });

    // Calculate remaining messages
    const remainingMessages =
      userPlan === 'premium' ? -1 : Math.max(0, (messageLimit || 5) - (messagesUsed + 1));

    // ========================================
    // 8. Return response
    // ========================================
    return new Response(
      JSON.stringify({
        assistantMessage,
        conversationId,
        plan: userPlan,
        remainingFreeMessages: remainingMessages,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Chat Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    if (errorMessage === 'THREAD_EXPIRED') {
      return new Response(
        JSON.stringify({
          error: 'THREAD_EXPIRED',
          message: 'Your conversation session expired. Please try again.',
        }),
        {
          status: 410,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


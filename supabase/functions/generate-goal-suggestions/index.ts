// AI Goal Suggestions Edge Function
// Generates SMART goal suggestions using OpenAI for a specific life area

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoalSuggestionRequest {
  lifeAreaId: string;
  language: 'he' | 'en';
  currentScore?: number; // Optional: current rating of this life area (0-10)
  userContext?: string; // Optional: additional context from user
}

interface GoalSuggestion {
  title: string;
  description: string;
  category: 'short_term' | 'medium_term' | 'long_term';
  estimatedDuration: string; // e.g., "1 week", "3 months", "1 year"
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
    const body: GoalSuggestionRequest = await req.json();
    const { lifeAreaId, language, currentScore, userContext } = body;

    if (!lifeAreaId || !language) {
      throw new Error('Missing required fields: lifeAreaId, language');
    }

    // Get life area details
    const { data: lifeAreaData, error: lifeAreaError } = await supabase
      .from('life_areas')
      .select('name_en, name_he, key')
      .eq('id', lifeAreaId)
      .single();

    if (lifeAreaError || !lifeAreaData) {
      throw new Error('Life area not found');
    }

    const lifeAreaName = language === 'he' ? lifeAreaData.name_he : lifeAreaData.name_en;

    // Get user's existing goals for this area to avoid duplicates
    const { data: existingGoals } = await supabase
      .from('goals')
      .select('title')
      .eq('user_id', userId)
      .eq('life_area_id', lifeAreaId)
      .in('status', ['active', 'in_progress']);

    const existingGoalTitles = existingGoals?.map(g => g.title).join(', ') || 'None';

    // Build prompt for OpenAI
    const systemPrompt = language === 'he'
      ? `אתה מאמן wellness מקצועי. צור 3 הצעות יעדים SMART עבור תחום החיים "${lifeAreaName}". כל יעד צריך להיות:
- Specific (ספציפי)
- Measurable (מדיד)
- Achievable (בר-השגה)
- Relevant (רלוונטי)
- Time-bound (מוגבל בזמן)

החזר את התשובה כ-JSON array עם המבנה:
[
  {
    "title": "כותרת קצרה (מקסימום 60 תווים)",
    "description": "תיאור מפורט של היעד וכיצד למדוד הצלחה",
    "category": "short_term" או "medium_term" או "long_term",
    "estimatedDuration": "למשל: '2 שבועות', '3 חודשים', 'שנה'"
  }
]

יעדים קיימים של המשתמש (אל תשכפל): ${existingGoalTitles}
${currentScore !== undefined ? `דירוג נוכחי של תחום זה: ${currentScore}/10` : ''}
${userContext ? `הקשר נוסף: ${userContext}` : ''}`
      : `You are a professional wellness coach. Create 3 SMART goal suggestions for the life area "${lifeAreaName}". Each goal should be:
- Specific
- Measurable
- Achievable
- Relevant
- Time-bound

Return the response as a JSON array with the structure:
[
  {
    "title": "Short title (max 60 characters)",
    "description": "Detailed description of the goal and how to measure success",
    "category": "short_term" or "medium_term" or "long_term",
    "estimatedDuration": "e.g., '2 weeks', '3 months', '1 year'"
  }
]

User's existing goals (don't duplicate): ${existingGoalTitles}
${currentScore !== undefined ? `Current rating for this area: ${currentScore}/10` : ''}
${userContext ? `Additional context: ${userContext}` : ''}`;

    // Call OpenAI Chat Completions API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast and cost-effective
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: language === 'he'
              ? `צור 3 הצעות יעדים עבור ${lifeAreaName}`
              : `Generate 3 goal suggestions for ${lifeAreaName}`,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openAIResult = await openAIResponse.json();
    const aiMessage = openAIResult.choices[0].message.content;

    // Parse AI response
    let suggestions: GoalSuggestion[];
    try {
      const parsed = JSON.parse(aiMessage);
      // Handle both array and object with array
      suggestions = Array.isArray(parsed) ? parsed : (parsed.goals || parsed.suggestions || []);
    } catch (parseError) {
      // Fallback parsing
      suggestions = [{
        title: language === 'he' ? 'יעד לדוגמה' : 'Example Goal',
        description: aiMessage.substring(0, 200),
        category: 'medium_term',
        estimatedDuration: language === 'he' ? '1 חודש' : '1 month',
      }];
    }

    // Ensure we have at least 1 suggestion
    if (!suggestions || suggestions.length === 0) {
      throw new Error('No suggestions generated');
    }

    // Return suggestions
    return new Response(
      JSON.stringify({
        success: true,
        lifeArea: lifeAreaName,
        suggestions: suggestions.slice(0, 3), // Max 3 suggestions
        tokensUsed: openAIResult.usage?.total_tokens || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Goal Suggestion Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

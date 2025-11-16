// AI Goal Suggestions Edge Function
// Generates SMART goal suggestions for a life area using OpenAI

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
  count?: number; // Number of suggestions to generate (default 3)
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
    const { lifeAreaId, language, count = 3 } = body;

    if (!lifeAreaId || !language) {
      throw new Error('Missing required fields: lifeAreaId, language');
    }

    // ========================================
    // 1. Get life area details
    // ========================================
    const { data: lifeArea, error: lifeAreaError } = await supabase
      .from('life_areas')
      .select('name_en, name_he, description_en, description_he')
      .eq('id', lifeAreaId)
      .single();

    if (lifeAreaError || !lifeArea) {
      throw new Error('Life area not found');
    }

    const lifeAreaName = language === 'he' ? lifeArea.name_he : lifeArea.name_en;
    const lifeAreaDescription = language === 'he' ? lifeArea.description_he : lifeArea.description_en;

    // ========================================
    // 2. Get user's baseline score for this area
    // ========================================
    const { data: scoreData } = await supabase
      .from('user_life_area_scores')
      .select('baseline_score, current_score')
      .eq('user_id', userId)
      .eq('life_area_id', lifeAreaId)
      .single();

    const baselineScore = scoreData?.baseline_score || scoreData?.current_score || 5;

    // ========================================
    // 3. Get user's existing goals in this area
    // ========================================
    const { data: existingGoals } = await supabase
      .from('goals')
      .select('title')
      .eq('user_id', userId)
      .eq('life_area_id', lifeAreaId)
      .eq('status', 'active');

    const existingGoalTitles = existingGoals?.map(g => g.title).join(', ') || 'None';

    // ========================================
    // 4. Generate goal suggestions using OpenAI
    // ========================================
    const prompt = language === 'he'
      ? `אתה יועץ רווחה מקצועי. המשתמש רוצה לשפר את תחום החיים "${lifeAreaName}".

תיאור התחום: ${lifeAreaDescription}
ציון בסיס נוכחי: ${baselineScore}/10
יעדים קיימים: ${existingGoalTitles}

צור ${count} הצעות יעדים SMART (ספציפיים, מדידים, ברי-השגה, רלוונטיים, ממוקדי-זמן) לתחום זה.

כל יעד צריך להיות:
- ספציפי ומדיד
- מאתגר אך בר-השגה
- משתלב עם תחום החיים
- שונה מהיעדים הקיימים

החזר JSON בפורמט הבא (בלבד, ללא טקסט נוסף):
{
  "suggestions": [
    {
      "title": "כותרת היעד",
      "description": "תיאור מפורט",
      "timeframe": "מסגרת זמן (למשל: 30 ימים)"
    }
  ]
}`
      : `You are a professional wellness advisor. The user wants to improve their "${lifeAreaName}" life area.

Area description: ${lifeAreaDescription}
Current baseline score: ${baselineScore}/10
Existing goals: ${existingGoalTitles}

Create ${count} SMART goal suggestions (Specific, Measurable, Achievable, Relevant, Time-bound) for this area.

Each goal should be:
- Specific and measurable
- Challenging but achievable
- Aligned with the life area
- Different from existing goals

Return JSON in this format (only, no additional text):
{
  "suggestions": [
    {
      "title": "Goal title",
      "description": "Detailed description",
      "timeframe": "Time frame (e.g., 30 days)"
    }
  ]
}`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: language === 'he'
              ? 'אתה יועץ רווחה מקצועי המומחה ביצירת יעדים SMART. תמיד תחזיר JSON תקני.'
              : 'You are a professional wellness advisor specializing in SMART goal creation. Always return valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const openaiResult = await openaiResponse.json();
    const aiResponseText = openaiResult.choices[0].message.content;

    // Parse JSON response
    let suggestions;
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      const jsonMatch = aiResponseText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || 
                       aiResponseText.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : aiResponseText;
      const parsed = JSON.parse(jsonText);
      suggestions = parsed.suggestions || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponseText);
      throw new Error('Failed to parse AI response. Please try again.');
    }

    // ========================================
    // 5. Return suggestions
    // ========================================
    return new Response(
      JSON.stringify({
        suggestions,
        lifeArea: {
          id: lifeAreaId,
          name: lifeAreaName,
          baselineScore,
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('AI Goal Suggestions Error:', error);

    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});


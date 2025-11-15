// Generate Goal Suggestions Edge Function
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
  currentRating?: number;
  description?: string;
}

interface GoalSuggestion {
  title: string;
  description: string;
  goal_type: 'boolean' | 'numeric' | 'habit';
  target_value?: number;
  unit?: string;
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

    // Parse request body
    const body: GoalSuggestionRequest = await req.json();
    const { lifeAreaId, language, currentRating, description } = body;

    if (!lifeAreaId || !language) {
      throw new Error('Missing required fields: lifeAreaId, language');
    }

    // Get life area details
    const { data: lifeAreaData, error: lifeAreaError } = await supabase
      .from('life_areas')
      .select('key, name_en, name_he, description_en, description_he')
      .eq('id', lifeAreaId)
      .single();

    if (lifeAreaError || !lifeAreaData) {
      throw new Error('Life area not found');
    }

    const areaName = language === 'he' ? lifeAreaData.name_he : lifeAreaData.name_en;
    const areaDescription =
      language === 'he' ? lifeAreaData.description_he : lifeAreaData.description_en;

    // Build prompt for OpenAI
    const systemPrompt =
      language === 'he'
        ? `אתה מאמן wellness מקצועי. צור 3-5 המלצות ליעדים SMART בתחום חיים של "${areaName}" (${areaDescription}). ${
            currentRating !== undefined ? `הדירוג הנוכחי: ${currentRating}/5.` : ''
          } ${description ? `הקשר נוסף: ${description}` : ''}`
        : `You are a professional wellness coach. Create 3-5 SMART goal suggestions for the life area "${areaName}" (${areaDescription}). ${
            currentRating !== undefined ? `Current rating: ${currentRating}/5.` : ''
          } ${description ? `Additional context: ${description}` : ''}`;

    const userPrompt =
      language === 'he'
        ? 'צור רשימה של 3-5 יעדים ברורים ומדידים. עבור כל יעד, כלול: כותרת (title), תיאור (description), סוג יעד (goal_type: boolean/numeric/habit), ערך יעד אופציונלי (target_value), ויחידת מידה אופציונלית (unit). החזר תשובה ב-JSON בלבד.'
        : 'Create a list of 3-5 clear, measurable goals. For each goal include: title, description, goal_type (boolean/numeric/habit), optional target_value, and optional unit. Return JSON only.';

    // Call OpenAI Chat Completions API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      
      // If OpenAI is not available, return fallback suggestions
      return new Response(
        JSON.stringify({
          suggestions: getFallbackSuggestions(lifeAreaData.key, language),
          fallback: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAIResult = await openAIResponse.json();
    const aiResponse = openAIResult.choices[0].message.content;

    // Parse JSON response
    let suggestions: GoalSuggestion[] = [];
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        suggestions = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return fallback suggestions
      suggestions = getFallbackSuggestions(lifeAreaData.key, language);
    }

    return new Response(
      JSON.stringify({ suggestions }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Goal Suggestions Error:', error);

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

// Fallback suggestions when OpenAI is not available
function getFallbackSuggestions(lifeAreaKey: string, language: 'he' | 'en'): GoalSuggestion[] {
  const suggestions: Record<string, { en: GoalSuggestion[]; he: GoalSuggestion[] }> = {
    health: {
      en: [
        {
          title: 'Exercise 3 times per week',
          description: 'Regular physical activity for 30 minutes',
          goal_type: 'habit',
        },
        {
          title: 'Sleep 8 hours nightly',
          description: 'Maintain consistent sleep schedule',
          goal_type: 'numeric',
          target_value: 8,
          unit: 'hours',
        },
        {
          title: 'Eat 5 servings of vegetables daily',
          description: 'Increase vegetable intake',
          goal_type: 'numeric',
          target_value: 5,
          unit: 'servings',
        },
      ],
      he: [
        {
          title: 'להתאמן 3 פעמים בשבוע',
          description: 'פעילות גופנית סדירה למשך 30 דקות',
          goal_type: 'habit',
        },
        {
          title: 'לישון 8 שעות בלילה',
          description: 'לשמור על לוח שינה קבוע',
          goal_type: 'numeric',
          target_value: 8,
          unit: 'שעות',
        },
        {
          title: 'לאכול 5 מנות ירקות ביום',
          description: 'להגדיל צריכת ירקות',
          goal_type: 'numeric',
          target_value: 5,
          unit: 'מנות',
        },
      ],
    },
    career: {
      en: [
        {
          title: 'Learn a new professional skill',
          description: 'Complete an online course or certification',
          goal_type: 'boolean',
        },
        {
          title: 'Network with 10 professionals',
          description: 'Expand professional network',
          goal_type: 'numeric',
          target_value: 10,
          unit: 'people',
        },
      ],
      he: [
        {
          title: 'ללמוד מיומנות מקצועית חדשה',
          description: 'להשלים קורס מקוון או הסמכה',
          goal_type: 'boolean',
        },
        {
          title: 'ליצור קשר עם 10 אנשי מקצוע',
          description: 'להרחיב רשת מקצועית',
          goal_type: 'numeric',
          target_value: 10,
          unit: 'אנשים',
        },
      ],
    },
  };

  return suggestions[lifeAreaKey]?.[language] || [];
}


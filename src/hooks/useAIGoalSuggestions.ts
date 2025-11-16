import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Language } from '@/types/database';

interface GoalSuggestion {
  title: string;
  description: string;
  timeframe: string;
}

interface UseAIGoalSuggestionsParams {
  lifeAreaId: string;
  language: Language;
}

export function useAIGoalSuggestions() {
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async ({ lifeAreaId, language }: UseAIGoalSuggestionsParams) => {
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        throw new Error('No auth token available');
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/ai-goal-suggestions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            lifeAreaId,
            language,
            count: 3, // Generate 3 suggestions
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate suggestions');
      }

      setSuggestions(result.suggestions || []);
      return { success: true, suggestions: result.suggestions };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate suggestions';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setError(null);
  };

  return {
    suggestions,
    loading,
    error,
    generateSuggestions,
    clearSuggestions,
  };
}


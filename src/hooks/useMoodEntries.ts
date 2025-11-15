import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MoodEntry } from '@/types/database';
import { useAuth } from './useAuth';

export function useMoodEntries(limit?: number) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [streak, setStreak] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchEntries();
      fetchStreak();
    }
  }, [user, limit]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching mood entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch mood entries');
    } finally {
      setLoading(false);
    }
  };

  const fetchStreak = async () => {
    if (!user) return;

    try {
      const { data, error: streakError } = await supabase
        .rpc('get_mood_streak', { p_user_id: user.id });

      if (streakError) throw streakError;
      setStreak(data || 0);
    } catch (err) {
      console.error('Error fetching mood streak:', err);
    }
  };

  const createEntry = async (entry: Omit<MoodEntry, 'id' | 'user_id' | 'created_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error: insertError } = await supabase
        .from('mood_entries')
        .insert({ ...entry, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchEntries();
      await fetchStreak();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create entry';
      return { data: null, error: errorMessage };
    }
  };

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(e => e.created_at.startsWith(today));
  };

  return {
    entries,
    todayEntry: getTodayEntry(),
    streak,
    loading,
    error,
    createEntry,
    refetch: fetchEntries,
  };
}


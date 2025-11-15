import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { GratitudeEntry } from '@/types/database';
import { useAuth } from './useAuth';

export function useGratitude(limit?: number) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEntries();
    }
  }, [user, limit]);

  const fetchEntries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('gratitude_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('entry_date', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setEntries(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching gratitude entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch gratitude entries');
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateEntry = async (date: string, content: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error: upsertError } = await supabase
        .from('gratitude_entries')
        .upsert({
          user_id: user.id,
          entry_date: date,
          content,
        })
        .select()
        .single();

      if (upsertError) throw upsertError;
      await fetchEntries();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save entry';
      return { data: null, error: errorMessage };
    }
  };

  const deleteEntry = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error: deleteError } = await supabase
        .from('gratitude_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      await fetchEntries();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete entry';
      return { error: errorMessage };
    }
  };

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return entries.find(e => e.entry_date === today);
  };

  return {
    entries,
    todayEntry: getTodayEntry(),
    loading,
    error,
    createOrUpdateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
}


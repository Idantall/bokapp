import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserGoal } from '@/types/database';
import { useAuth } from './useAuth';

export function useGoals(lifeAreaId?: string) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<UserGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user, lifeAreaId]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (lifeAreaId) {
        query = query.eq('life_area_id', lifeAreaId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setGoals(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goal: Omit<UserGoal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Check if user can create goal in this life area (free tier restriction)
      const { data: canCreate, error: checkError } = await supabase
        .rpc('check_goal_creation_allowed', {
          p_user_id: user.id,
          p_life_area_id: goal.life_area_id,
        });

      if (checkError) throw checkError;

      if (!canCreate) {
        return { 
          data: null, 
          error: 'FREE_TIER_LIMIT',
          message: 'Free tier users can only have goals in one life area. Upgrade to Premium.' 
        };
      }

      const { data, error: insertError } = await supabase
        .from('user_goals')
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (insertError) throw insertError;
      await fetchGoals();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create goal';
      return { data: null, error: errorMessage };
    }
  };

  const updateGoal = async (id: string, updates: Partial<UserGoal>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { data, error: updateError } = await supabase
        .from('user_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;
      await fetchGoals();
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update goal';
      return { data: null, error: errorMessage };
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error: deleteError } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      await fetchGoals();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete goal';
      return { error: errorMessage };
    }
  };

  const completeGoal = async (id: string) => {
    return updateGoal(id, { is_completed: true });
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  return {
    goals,
    activeGoals,
    completedGoals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    completeGoal,
    refetch: fetchGoals,
  };
}


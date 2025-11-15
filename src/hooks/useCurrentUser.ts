import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@/types/database';
import { useAuth } from './useAuth';

export function useCurrentUser() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authUser) {
      setUserData(null);
      setLoading(false);
      return;
    }

    fetchUserData();
  }, [authUser]);

  const fetchUserData = async () => {
    if (!authUser) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError) throw fetchError;
      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authUser) return { error: 'Not authenticated' };

    try {
      const { data, error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', authUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      setUserData(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user';
      return { data: null, error: errorMessage };
    }
  };

  const isPremium = userData?.plan === 'premium';
  const isAdmin = userData?.role === 'admin';

  return {
    user: userData,
    loading: loading || authLoading,
    error,
    isPremium,
    isAdmin,
    updateUser,
    refetch: fetchUserData,
  };
}


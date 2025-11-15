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

      if (fetchError) {
        // If user doesn't exist (PGRST116), create user record
        if (fetchError.code === 'PGRST116') {
          console.log('User record not found, creating...');
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: authUser.id,
              email: authUser.email!,
              full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
              preferred_language: 'en',
              plan: 'free',
              role: 'user',
              onboarding_completed: false,
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating user:', createError);
            throw createError;
          }
          
          setUserData(newUser);
          setError(null);
          return;
        }
        throw fetchError;
      }
      
      setUserData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      // Set default user data so app doesn't crash
      setUserData({
        id: authUser.id,
        email: authUser.email!,
        full_name: authUser.email?.split('@')[0] || 'User',
        preferred_language: 'en',
        plan: 'free',
        role: 'user',
        onboarding_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as any);
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


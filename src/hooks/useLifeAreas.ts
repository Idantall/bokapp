import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LifeArea, UserLifeArea } from '@/types/database';
import { useAuth } from './useAuth';

export function useLifeAreas() {
  const { user } = useAuth();
  const [lifeAreas, setLifeAreas] = useState<LifeArea[]>([]);
  const [userLifeAreas, setUserLifeAreas] = useState<UserLifeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLifeAreas();
  }, [user]);

  const fetchLifeAreas = async () => {
    try {
      setLoading(true);

      // Fetch all life areas
      const { data: areas, error: areasError } = await supabase
        .from('life_areas')
        .select('*')
        .order('order_index');

      if (areasError) throw areasError;
      setLifeAreas(areas || []);

      // Fetch user's customization if authenticated
      if (user) {
        const { data: userAreas, error: userAreasError } = await supabase
          .from('user_life_areas')
          .select('*')
          .eq('user_id', user.id)
          .order('order_index');

        if (userAreasError) throw userAreasError;
        setUserLifeAreas(userAreas || []);
      }

      setError(null);
    } catch (err) {
      console.error('Error fetching life areas:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch life areas');
    } finally {
      setLoading(false);
    }
  };

  const updateUserLifeAreas = async (updates: Partial<UserLifeArea>[]) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      const { error: updateError } = await supabase
        .from('user_life_areas')
        .upsert(updates.map(u => ({ ...u, user_id: user.id })));

      if (updateError) throw updateError;
      await fetchLifeAreas();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update';
      return { error: errorMessage };
    }
  };

  // Get active life areas for the user
  const activeLifeAreas = lifeAreas.filter(area => {
    if (!user) return true;
    const userArea = userLifeAreas.find(ua => ua.life_area_id === area.id);
    return userArea?.is_active !== false;
  });

  return {
    lifeAreas,
    userLifeAreas,
    activeLifeAreas,
    loading,
    error,
    updateUserLifeAreas,
    refetch: fetchLifeAreas,
  };
}


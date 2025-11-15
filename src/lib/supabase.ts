import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || 'https://vpqxigieedjwqmxducku.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwcXhpZ2llZWRqd3FteGR1Y2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMTkwMzIsImV4cCI6MjA3ODc5NTAzMn0.DbNp_YGPwdr7NjsnWfgVxTSu8t5bqI6TmI_lK2XlsZA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});


import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}


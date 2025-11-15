import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function Index() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { user, loading: userLoading } = useCurrentUser();

  // Show loading while checking auth and user data
  if (authLoading || userLoading) {
    return <LoadingOverlay />;
  }

  // Not authenticated -> go to welcome
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // Authenticated but onboarding not completed -> go to onboarding
  if (user && !user.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  // Authenticated and onboarded -> go to home
  return <Redirect href="/(app)/(tabs)/home" />;
}


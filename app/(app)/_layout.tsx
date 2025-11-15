import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function AppLayout() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { user, loading: userLoading } = useCurrentUser();

  if (authLoading || userLoading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  // If authenticated but onboarding not completed, redirect to onboarding
  if (user && !user.onboarding_completed) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="life-area/[id]" />
      <Stack.Screen name="admin" />
    </Stack>
  );
}


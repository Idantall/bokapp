import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function AppLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
      <Stack.Screen name="life-area/[id]" />
    </Stack>
  );
}


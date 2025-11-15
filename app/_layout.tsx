import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </SafeAreaProvider>
  );
}


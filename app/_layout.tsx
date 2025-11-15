import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { ThemeProvider } from '@/contexts/ThemeContext';

export default function RootLayout() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingOverlay />;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootNavigator() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </>
  );
}


import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('auth.error', 'Error'), t('auth.fillAllFields', 'Please fill all fields'));
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.error', 'Error'), error.message);
    } else {
      router.replace('/(app)/(tabs)/home');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader 
        title={t('auth.login', 'Login')} 
        showBack 
      />

      <View style={styles.content}>
        <Text style={styles.label}>{t('auth.email', 'Email')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.emailPlaceholder', 'your@email.com')}
          placeholderTextColor={colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Text style={styles.label}>{t('auth.password', 'Password')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.passwordPlaceholder', '••••••••')}
          placeholderTextColor={colors.textTertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled, shadows.md]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('auth.loggingIn', 'Logging in...') : t('auth.login', 'Login')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  button: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});


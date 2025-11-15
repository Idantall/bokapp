import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signUp } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert(t('auth.error', 'Error'), t('auth.fillAllFields', 'Please fill all fields'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('auth.error', 'Error'), t('auth.passwordMismatch', 'Passwords do not match'));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('auth.error', 'Error'), t('auth.passwordTooShort', 'Password must be at least 6 characters'));
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    setLoading(false);

    if (error) {
      Alert.alert(t('auth.error', 'Error'), error.message);
    } else {
      // Navigate to onboarding
      router.replace('/(auth)/onboarding');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader 
        title={t('auth.register', 'Create Account')} 
        showBack 
      />

      <ScrollView style={styles.content}>
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

        <Text style={styles.label}>{t('auth.confirmPassword', 'Confirm Password')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('auth.passwordPlaceholder', '••••••••')}
          placeholderTextColor={colors.textTertiary}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled, shadows.md]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? t('auth.creating', 'Creating...') : t('auth.register', 'Create Account')}
          </Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          {t('auth.termsDisclaimer', 'By creating an account, you agree to our Terms of Service and Privacy Policy')}
        </Text>
      </ScrollView>
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
  disclaimer: {
    ...typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function WelcomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <LanguageToggle />
      </View>

      <View style={styles.content}>
        <Text style={styles.emoji}>⭐</Text>
        <Text style={styles.title}>UP!</Text>
        <Text style={styles.subtitle}>
          {t('welcome.subtitle', 'Track your journey to a balanced life')}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryButton, shadows.lg]}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>
            {t('welcome.getStarted', 'Get Started')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          activeOpacity={0.8}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.secondaryButtonText}>
            {t('welcome.login', 'I already have an account')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'flex-end',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 48,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '700',
    letterSpacing: 4,
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
    maxWidth: 280,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: colors.bgCard,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
});


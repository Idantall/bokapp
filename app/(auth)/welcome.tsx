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
        <Text style={styles.emoji}>🌟</Text>
        <Text style={styles.title}>{t('welcome.title', 'UP!')}</Text>
        <Text style={styles.subtitle}>
          {t('welcome.subtitle', 'Rise above, balance your life')}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, shadows.lg]}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.primaryButtonText}>
            {t('welcome.getStarted', 'Get Started')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
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
    fontSize: 100,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 56,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '800',
    letterSpacing: 2,
  },
  subtitle: {
    ...typography.h3,
    fontSize: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.brandOrange,
  },
  primaryButtonText: {
    ...typography.button,
    color: colors.white,
  },
  secondaryButton: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  secondaryButtonText: {
    ...typography.button,
    color: colors.textPrimary,
  },
});


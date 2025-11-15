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
    backgroundColor: colors.brandOrange,
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
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 42,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
    fontWeight: '800',
  },
  subtitle: {
    ...typography.body,
    fontSize: 18,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
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
    backgroundColor: colors.white,
  },
  primaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.brandOrange,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});


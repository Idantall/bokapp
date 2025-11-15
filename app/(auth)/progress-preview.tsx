import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';
import { ProgressTimeline } from '@/components/ProgressTimeline';

export default function ProgressPreviewScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    router.push('/(auth)/onboarding');
  };

  const handleSkip = () => {
    router.push('/(auth)/onboarding');
  };

  return (
    <View style={styles.container}>
      <ProgressTimeline />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {t('progress.continue', "Let's begin!")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
        >
          <Text style={styles.skipButtonText}>
            {t('progress.skip', 'Skip')}
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
  footer: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  continueButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  continueButtonText: {
    ...typography.button,
    color: colors.white,
  },
  skipButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});


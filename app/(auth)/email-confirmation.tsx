import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { colors, spacing, typography } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

export default function EmailConfirmationScreen() {
  const { t } = useTranslation();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [checkingConfirmation, setCheckingConfirmation] = useState(false);

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Pulse animation for envelope icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Listen for email confirmation
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Email confirmed! Navigate to onboarding
          Alert.alert(
            t('auth.emailConfirmed', 'Email Confirmed!'),
            t('auth.emailConfirmedMessage', "Let's complete your profile"),
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/onboarding'),
              },
            ]
          );
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleResendEmail = async () => {
    if (!email) return;

    setCheckingConfirmation(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) throw error;

      Alert.alert(
        t('auth.emailResent', 'Email Resent'),
        t('auth.emailResentMessage', 'Check your inbox for the confirmation link')
      );
    } catch (error: any) {
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('auth.resendError', 'Failed to resend email')
      );
    } finally {
      setCheckingConfirmation(false);
    }
  };

  const handleBackToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Animated Envelope Icon */}
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={styles.icon}>📧</Text>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>
          {t('auth.checkYourEmail', 'Check Your Email!')}
        </Text>

        {/* Email Display */}
        {email && (
          <Text style={styles.email}>
            {email}
          </Text>
        )}

        {/* Instructions */}
        <Text style={styles.description}>
          {t(
            'auth.confirmationInstructions',
            'We sent you a confirmation link. Please check your email and click the link to verify your account.'
          )}
        </Text>

        {/* Helpful Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>
            {t('auth.notReceived', "Didn't receive the email?")}
          </Text>
          <Text style={styles.tip}>
            • {t('auth.checkSpam', 'Check your spam or junk folder')}
          </Text>
          <Text style={styles.tip}>
            • {t('auth.checkTypo', 'Make sure the email address is correct')}
          </Text>
          <Text style={styles.tip}>
            • {t('auth.waitMinute', 'Wait a few minutes for the email to arrive')}
          </Text>
        </View>

        {/* Resend Button */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResendEmail}
          disabled={checkingConfirmation}
        >
          <Text style={styles.resendButtonText}>
            {checkingConfirmation
              ? t('common.loading', 'Loading...')
              : t('auth.resendEmail', 'Resend Email')}
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToLogin}
        >
          <Text style={styles.backButtonText}>
            {t('auth.backToLogin', 'Back to Login')}
          </Text>
        </TouchableOpacity>

        {/* Auto-refresh notice */}
        <View style={styles.autoRefreshNotice}>
          <Text style={styles.autoRefreshText}>
            ✨ {t('auth.autoRedirect', 'You will be automatically redirected after confirming')}
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl * 2,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  email: {
    ...typography.body,
    color: colors.brandOrange,
    fontWeight: '600',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tipsTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  tip: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  resendButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.brandOrange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.brandOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  resendButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  backButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  backButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.brandOrange,
  },
  autoRefreshNotice: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  autoRefreshText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});


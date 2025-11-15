import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const TOTAL_STEPS = 9;

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'he' | 'en'>('he');
  const [selectedLifeAreas, setSelectedLifeAreas] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding - save user data
      if (user) {
        await supabase
          .from('users')
          .update({
            full_name: name,
            preferred_language: selectedLanguage,
            onboarding_completed: true,
          })
          .eq('id', user.id);
      }
      router.replace('/(app)/(tabs)/home');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return acceptedTerms;
      case 1: return name.length > 0;
      case 2: return selectedLanguage !== null;
      case 3: return true; // Life areas explanation
      case 4: return selectedLifeAreas.length > 0;
      default: return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📜</Text>
            <Text style={styles.stepTitle}>{t('onboarding.terms.title', 'Terms & Privacy')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.terms.text', 'By continuing, you agree to our Terms of Service and Privacy Policy. We respect your privacy and will never sell your data.')}
            </Text>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                {t('onboarding.terms.accept', 'I accept the terms and privacy policy')}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>{t('onboarding.name.title', 'What\'s your name?')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('onboarding.name.placeholder', 'Enter your name')}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🌍</Text>
            <Text style={styles.stepTitle}>{t('onboarding.language.title', 'Choose your language')}</Text>
            <TouchableOpacity
              style={[styles.optionButton, selectedLanguage === 'he' && styles.optionButtonActive]}
              onPress={() => setSelectedLanguage('he')}
            >
              <Text style={[styles.optionText, selectedLanguage === 'he' && styles.optionTextActive]}>
                עברית (Hebrew)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedLanguage === 'en' && styles.optionButtonActive]}
              onPress={() => setSelectedLanguage('en')}
            >
              <Text style={[styles.optionText, selectedLanguage === 'en' && styles.optionTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>{t('onboarding.intro.title', 'Life Areas')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.intro.text', 'We help you track 8 key areas of life: Health, Family, Career, Relationships, Finances, Free Time, Environment, and Meaning & Purpose.')}
            </Text>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>✨</Text>
            <Text style={styles.stepTitle}>{t('onboarding.areas.title', 'Which areas do you want to focus on?')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.areas.subtitle', 'Select at least one (you can change this later)')}
            </Text>
            {['health', 'family', 'career', 'relationships'].map((area) => (
              <TouchableOpacity
                key={area}
                style={[styles.optionButton, selectedLifeAreas.includes(area) && styles.optionButtonActive]}
                onPress={() => {
                  if (selectedLifeAreas.includes(area)) {
                    setSelectedLifeAreas(selectedLifeAreas.filter(a => a !== area));
                  } else {
                    setSelectedLifeAreas([...selectedLifeAreas, area]);
                  }
                }}
              >
                <Text style={[styles.optionText, selectedLifeAreas.includes(area) && styles.optionTextActive]}>
                  {t(`lifeAreas.${area}`, area)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🤖</Text>
            <Text style={styles.stepTitle}>{t('onboarding.ai.title', 'Meet Your AI Coach')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.ai.text', 'Get personalized advice and support from our AI wellness coach, available 24/7.')}
            </Text>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📊</Text>
            <Text style={styles.stepTitle}>{t('onboarding.tracking.title', 'Track Your Progress')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.tracking.text', 'Set goals, track your mood, and journal your gratitude daily.')}
            </Text>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>💎</Text>
            <Text style={styles.stepTitle}>{t('onboarding.premium.title', 'Premium Features')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.premium.text', 'Free users get 5 AI messages per day and goals in one life area. Upgrade for unlimited access!')}
            </Text>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎉</Text>
            <Text style={styles.stepTitle}>{t('onboarding.done.title', 'You\'re all set!')}</Text>
            <Text style={styles.stepText}>
              {t('onboarding.done.text', 'Let\'s start your journey to a more balanced life.')}
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar */}
      <View style={styles.progressBar}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index <= currentStep && styles.progressDotActive,
            ]}
          />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStep()}
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigation}>
        {currentStep > 0 && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>{t('onboarding.back', 'Back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled, shadows.md]}
          onPress={handleNext}
          disabled={!canProceed()}
        >
          <Text style={styles.nextButtonText}>
            {currentStep === TOTAL_STEPS - 1
              ? t('onboarding.finish', 'Finish')
              : t('onboarding.next', 'Next')}
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
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
  },
  progressDotActive: {
    backgroundColor: colors.brandOrange,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepEmoji: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    width: '100%',
    textAlign: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.divider,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brandOrange,
    borderColor: colors.brandOrange,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  optionButton: {
    backgroundColor: colors.bgCard,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    width: '100%',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  optionButtonActive: {
    backgroundColor: colors.brandOrange,
    borderColor: colors.brandOrange,
  },
  optionText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.white,
  },
  navigation: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  backButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  nextButton: {
    flex: 2,
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.4,
  },
  nextButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});


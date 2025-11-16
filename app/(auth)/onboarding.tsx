/**
 * COMPLETE ONBOARDING FLOW
 * 
 * Steps:
 * 0. Terms & Privacy
 * 1. Name
 * 2. Language
 * 3. Life Areas Intro
 * 4. Select Focus Areas
 * 5. Baseline Ratings (NEW!)
 * 6. Profile Picture (NEW!)
 * 7. AI Coach Intro
 * 8. Premium Features
 * 9. Notification Permissions (NEW!)
 * 10. All Set!
 */

import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  TextInput,
  Alert,
  Platform,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Slider from '@react-native-community/slider';
import { typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { useThemedColors } from '@/hooks/useThemedColors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import * as Notifications from 'expo-notifications';

const TOTAL_STEPS = 11;

// Life areas for selection (matches database)
const LIFE_AREAS = [
  { id: 'health', name_en: 'Health', name_he: 'בריאות', emoji: '💪' },
  { id: 'family', name_en: 'Family', name_he: 'משפחה', emoji: '👨‍👩‍👧' },
  { id: 'career', name_en: 'Career', name_he: 'קריירה', emoji: '💼' },
  { id: 'relationships', name_en: 'Relationships', name_he: 'מערכות יחסים', emoji: '❤️' },
  { id: 'finances', name_en: 'Finances', name_he: 'כספים', emoji: '💰' },
  { id: 'leisure', name_en: 'Free Time', name_he: 'פנאי', emoji: '🎮' },
  { id: 'environment', name_en: 'Environment', name_he: 'סביבה', emoji: '🏡' },
  { id: 'meaning', name_en: 'Meaning & Purpose', name_he: 'משמעות', emoji: '🎯' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const colors = useThemedColors();
  
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<'he' | 'en'>('he');
  const [selectedLifeAreas, setSelectedLifeAreas] = useState<string[]>([]);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // NEW: Baseline ratings for each life area (0-10)
  const [baselineRatings, setBaselineRatings] = useState<Record<string, number>>({});
  
  // NEW: Notification permission state
  const [notificationPermission, setNotificationPermission] = useState<string | null>(null);
  
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finish onboarding - save all data
      await finishOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const finishOnboarding = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // 1. Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: name,
          language: selectedLanguage,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (userError) throw userError;

      // 2. Get life area IDs from database
      const { data: lifeAreasData, error: areasError } = await supabase
        .from('life_areas')
        .select('id, key')
        .in('key', selectedLifeAreas);

      if (areasError) throw areasError;

      // 3. Save baseline scores for selected life areas
      if (lifeAreasData && lifeAreasData.length > 0) {
        const scoreRecords = lifeAreasData.map(area => ({
          user_id: user.id,
          life_area_id: area.id,
          baseline_score: baselineRatings[area.key] || 5,
          current_score: baselineRatings[area.key] || 5,
          is_focus_area: selectedLifeAreas.includes(area.key),
        }));

        const { error: scoresError } = await supabase
          .from('user_life_area_scores')
          .upsert(scoreRecords);

        if (scoresError) throw scoresError;
      }

      // 4. Navigate to home
      router.replace('/(app)/(tabs)/home');
    } catch (error) {
      console.error('Error finishing onboarding:', error);
      Alert.alert(
        t('error', 'Error'),
        t('onboarding.saveFailed', 'Failed to save your data. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      setNotificationPermission(status);
      
      if (status === 'granted') {
        Alert.alert(
          t('onboarding.notifications.granted', 'Notifications Enabled!'),
          t('onboarding.notifications.grantedMessage', 'You will receive daily reminders to track your progress.')
        );
      }
    } catch (error) {
      console.error('Error requesting notifications:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return acceptedTerms;
      case 1: return name.trim().length > 0;
      case 2: return selectedLanguage !== null;
      case 3: return true; // Life areas explanation
      case 4: return selectedLifeAreas.length > 0;
      case 5: 
        // Check that all selected areas have been rated
        return selectedLifeAreas.every(areaKey => baselineRatings[areaKey] !== undefined);
      case 6: return true; // Profile picture (optional)
      case 7: return true; // AI intro
      case 8: return true; // Premium intro
      case 9: return true; // Notifications (optional)
      case 10: return true; // Final step
      default: return true;
    }
  };

  const renderStep = () => {
    const isRTL = selectedLanguage === 'he';

    switch (currentStep) {
      case 0:
        // Terms & Privacy
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📜</Text>
            <Text style={[styles.stepTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'תנאים ופרטיות' : 'Terms & Privacy'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL 
                ? 'בהמשך, אתה מסכים לתנאי השימוש ומדיניות הפרטיות שלנו. אנו מכבדים את פרטיותך ולעולם לא נמכור את הנתונים שלך.'
                : 'By continuing, you agree to our Terms of Service and Privacy Policy. We respect your privacy and will never sell your data.'}
            </Text>
            <TouchableOpacity
              style={[styles.checkbox, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View style={[styles.checkboxBox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkboxLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                {isRTL ? 'אני מסכים לתנאים ומדיניות הפרטיות' : 'I accept the terms and privacy policy'}
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 1:
        // Name
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>👋</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'מה שמך?' : "What's your name?"}
            </Text>
            <TextInput
              style={[styles.input, { textAlign: isRTL ? 'right' : 'center' }]}
              placeholder={isRTL ? 'הכנס את שמך' : 'Enter your name'}
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>
        );

      case 2:
        // Language
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🌍</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'בחר שפה' : 'Choose your language'}
            </Text>
            <TouchableOpacity
              style={[styles.optionButton, selectedLanguage === 'he' && styles.optionButtonActive]}
              onPress={() => {
                setSelectedLanguage('he');
                i18n.changeLanguage('he');
              }}
            >
              <Text style={[styles.optionText, selectedLanguage === 'he' && styles.optionTextActive]}>
                עברית (Hebrew)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.optionButton, selectedLanguage === 'en' && styles.optionButtonActive]}
              onPress={() => {
                setSelectedLanguage('en');
                i18n.changeLanguage('en');
              }}
            >
              <Text style={[styles.optionText, selectedLanguage === 'en' && styles.optionTextActive]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        );

      case 3:
        // Life Areas Intro
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎯</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'תחומי חיים' : 'Life Areas'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'אנחנו עוזרים לך לעקוב אחר 8 תחומי חיים מרכזיים: בריאות, משפחה, קריירה, מערכות יחסים, כספים, פנאי, סביבה ומשמעות.'
                : 'We help you track 8 key areas of life: Health, Family, Career, Relationships, Finances, Free Time, Environment, and Meaning & Purpose.'}
            </Text>
          </View>
        );

      case 4:
        // Select Focus Areas
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>✨</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'באילו תחומים תרצה להתמקד?' : 'Which areas do you want to focus on?'}
            </Text>
            <Text style={[styles.stepSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'בחר לפחות אחד (תוכל לשנות מאוחר יותר)' : 'Select at least one (you can change this later)'}
            </Text>
            <ScrollView style={styles.areaList} showsVerticalScrollIndicator={false}>
              {LIFE_AREAS.map((area) => (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.areaOptionButton,
                    selectedLifeAreas.includes(area.id) && styles.areaOptionButtonActive,
                  ]}
                  onPress={() => {
                    if (selectedLifeAreas.includes(area.id)) {
                      setSelectedLifeAreas(selectedLifeAreas.filter(a => a !== area.id));
                    } else {
                      setSelectedLifeAreas([...selectedLifeAreas, area.id]);
                    }
                  }}
                >
                  <Text style={styles.areaEmoji}>{area.emoji}</Text>
                  <Text style={[
                    styles.areaText,
                    selectedLifeAreas.includes(area.id) && styles.areaTextActive
                  ]}>
                    {isRTL ? area.name_he : area.name_en}
                  </Text>
                  {selectedLifeAreas.includes(area.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        );

      case 5:
        // NEW: Baseline Ratings
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📊</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'דרג כל תחום מ-0 עד 10' : 'Rate each area from 0 to 10'}
            </Text>
            <Text style={[styles.stepSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? 'כמה אתה מרוצה מכל תחום היום?' : 'How satisfied are you with each area today?'}
            </Text>
            <ScrollView style={styles.ratingsList} showsVerticalScrollIndicator={false}>
              {LIFE_AREAS.filter(area => selectedLifeAreas.includes(area.id)).map((area) => (
                <View key={area.id} style={styles.ratingItem}>
                  <View style={[styles.ratingHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={styles.ratingEmoji}>{area.emoji}</Text>
                    <Text style={[styles.ratingLabel, { textAlign: isRTL ? 'right' : 'left' }]}>
                      {isRTL ? area.name_he : area.name_en}
                    </Text>
                    <Text style={styles.ratingValue}>
                      {baselineRatings[area.id] !== undefined ? baselineRatings[area.id] : 5}/10
                    </Text>
                  </View>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={10}
                    step={1}
                    value={baselineRatings[area.id] || 5}
                    onValueChange={(value) => 
                      setBaselineRatings({ ...baselineRatings, [area.id]: value })
                    }
                    minimumTrackTintColor={colors.brandOrange}
                    maximumTrackTintColor={colors.divider}
                    thumbTintColor={colors.brandOrange}
                  />
                </View>
              ))}
            </ScrollView>
          </View>
        );

      case 6:
        // NEW: Profile Picture (Placeholder - will implement later)
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>📷</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'תמונת פרופיל' : 'Profile Picture'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'תוכל להוסיף תמונת פרופיל מאוחר יותר בהגדרות.'
                : 'You can add a profile picture later in settings.'}
            </Text>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.brandOrange + '20' }]}>
              <Text style={styles.avatarEmoji}>
                {name.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
          </View>
        );

      case 7:
        // AI Coach Intro
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🤖</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'פגוש את המאמן AI שלך' : 'Meet Your AI Coach'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'קבל ייעוץ ותמיכה מותאמים אישית ממאמן הרווחה AI שלנו, זמין 24/7.'
                : 'Get personalized advice and support from our AI wellness coach, available 24/7.'}
            </Text>
          </View>
        );

      case 8:
        // Premium Features
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>💎</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'תכונות פרימיום' : 'Premium Features'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'משתמשים חינם מקבלים 5 הודעות AI ביום ויעד אחד לכל תחום. שדרג לגישה ללא הגבלה!'
                : 'Free users get 5 AI messages per day and one goal per area. Upgrade for unlimited access!'}
            </Text>
          </View>
        );

      case 9:
        // NEW: Notification Permissions
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🔔</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'הפעל התראות' : 'Enable Notifications'}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'קבל תזכורות יומיות לעקוב אחר מצב הרוח והיעדים שלך.'
                : 'Get daily reminders to track your mood and goals.'}
            </Text>
            {!notificationPermission && (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.brandOrange }]}
                onPress={requestNotificationPermissions}
              >
                <Text style={[styles.primaryButtonText, { color: colors.white }]}>
                  {isRTL ? 'הפעל התראות' : 'Enable Notifications'}
                </Text>
              </TouchableOpacity>
            )}
            {notificationPermission === 'granted' && (
              <View style={[styles.successBadge, { backgroundColor: colors.brandOrange + '20' }]}>
                <Text style={styles.successText}>
                  ✓ {isRTL ? 'התראות הופעלו' : 'Notifications Enabled'}
                </Text>
              </View>
            )}
            {notificationPermission === 'denied' && (
              <Text style={[styles.warningText, { color: colors.textSecondary }]}>
                {isRTL
                  ? 'תוכל להפעיל התראות מאוחר יותר בהגדרות המכשיר.'
                  : 'You can enable notifications later in device settings.'}
              </Text>
            )}
          </View>
        );

      case 10:
        // All Set!
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepEmoji}>🎉</Text>
            <Text style={styles.stepTitle}>
              {isRTL ? 'הכל מוכן!' : "You're all set!"}
            </Text>
            <Text style={[styles.stepText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'בואו נתחיל את המסע שלך לחיים מאוזנים יותר.'
                : "Let's start your journey to a more balanced life."}
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
              { backgroundColor: index <= currentStep ? colors.brandOrange : colors.divider },
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
          <TouchableOpacity 
            style={[styles.backButton, { borderColor: colors.divider }]} 
            onPress={handleBack}
          >
            <Text style={[styles.backButtonText, { color: colors.textPrimary }]}>
              {selectedLanguage === 'he' ? 'חזור' : 'Back'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: !canProceed() || saving ? colors.textTertiary : colors.brandOrange },
          ]}
          onPress={handleNext}
          disabled={!canProceed() || saving}
        >
          <Text style={[styles.nextButtonText, { color: colors.white }]}>
            {saving 
              ? (selectedLanguage === 'he' ? 'שומר...' : 'Saving...')
              : currentStep === TOTAL_STEPS - 1
                ? (selectedLanguage === 'he' ? 'סיים' : 'Finish')
                : (selectedLanguage === 'he' ? 'הבא' : 'Next')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
    paddingTop: spacing.xxl + 10, // Extra padding for notch
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  stepContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
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
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
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
    paddingHorizontal: spacing.md,
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
  areaList: {
    width: '100%',
    maxHeight: 400,
  },
  areaOptionButton: {
    backgroundColor: colors.bgCard,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
  },
  areaOptionButtonActive: {
    backgroundColor: colors.brandOrange + '20',
    borderColor: colors.brandOrange,
  },
  areaEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  areaText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  areaTextActive: {
    color: colors.brandOrange,
    fontWeight: '600',
  },
  ratingsList: {
    width: '100%',
    maxHeight: 450,
  },
  ratingItem: {
    marginBottom: spacing.lg,
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingEmoji: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  ratingLabel: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    fontWeight: '500',
  },
  ratingValue: {
    ...typography.body,
    color: colors.brandOrange,
    fontWeight: '700',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  avatarEmoji: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.brandOrange,
  },
  primaryButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    minWidth: 200,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  successBadge: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  successText: {
    color: colors.brandOrange,
    fontSize: 16,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 14,
    marginTop: spacing.lg,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  navigation: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: spacing.xl + 10, // Extra padding for home indicator
  },
  backButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    borderWidth: 2,
  },
  backButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  nextButton: {
    flex: 2,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  nextButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});

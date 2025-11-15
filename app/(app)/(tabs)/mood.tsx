/**
 * MOOD & GRATITUDE SCREEN - Production Quality
 * 
 * Features:
 * - Horizontal emoji grid (not vertical pills!)
 * - Responsive card layout
 * - Safe area handling
 * - Theme-aware colors
 * - Better visual feedback
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useDirection } from '@/hooks/useDirection';
import { spacing, fontSize, fontWeight, radius, shadowPresets, componentSizes } from '@/lib/designSystem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useGratitude } from '@/hooks/useGratitude';

type MoodLevel = 1 | 2 | 3 | 4 | 5;

const MOOD_OPTIONS: { level: MoodLevel; emoji: string; label_en: string; label_he: string }[] = [
  { level: 1, emoji: '😢', label_en: 'Very Bad', label_he: 'עצוב מאוד' },
  { level: 2, emoji: '😟', label_en: 'Bad', label_he: 'עצוב' },
  { level: 3, emoji: '😐', label_en: 'Okay', label_he: 'בסדר' },
  { level: 4, emoji: '😊', label_en: 'Good', label_he: 'טוב' },
  { level: 5, emoji: '😄', label_en: 'Excellent', label_he: 'מעולה' },
];

export default function MoodScreen() {
  const { t } = useTranslation();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();
  const { todayEntry, streak, createEntry } = useMoodEntries();
  const { todayEntry: gratitudeEntry, createOrUpdateEntry: saveGratitude } = useGratitude();

  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(todayEntry?.mood_level as MoodLevel || null);
  const [moodNote, setMoodNote] = useState(todayEntry?.note || '');
  const [gratitudeText, setGratitudeText] = useState(gratitudeEntry?.content || '');
  const [saving, setSaving] = useState(false);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert(t('mood.selectMood', isRTL ? 'אנא בחר את מצב רוחך' : 'Please select your mood'));
      return;
    }

    setSaving(true);
    const { error } = await createEntry({
      mood_level: selectedMood,
      note: moodNote,
    });
    setSaving(false);

    if (error) {
      Alert.alert(t('error', isRTL ? 'שגיאה' : 'Error'), error);
    } else {
      Alert.alert(
        t('mood.saved', isRTL ? 'נשמר!' : 'Saved!'), 
        t('mood.thankYou', isRTL ? 'תודה על המעקב אחר מצב הרוח' : 'Thank you for tracking your mood')
      );
    }
  };

  const handleSaveGratitude = async () => {
    if (!gratitudeText.trim()) {
      Alert.alert(t('gratitude.enterText', isRTL ? 'אנא הכנס משהו שאתה אסיר תודה עליו' : "Please enter something you're grateful for"));
      return;
    }

    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await saveGratitude(today, gratitudeText);
    setSaving(false);

    if (error) {
      Alert.alert(t('error', isRTL ? 'שגיאה' : 'Error'), error);
    } else {
      Alert.alert(
        t('gratitude.saved', isRTL ? 'נשמר!' : 'Saved!'), 
        t('gratitude.thankYou', isRTL ? 'תודתך נשמרה' : 'Your gratitude has been recorded')
      );
    }
  };

  // Calculate this week's mood entries (mock - TODO: get from real data)
  const thisWeekCount = 5;
  const totalDays = 7;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={t('mood.title', isRTL ? 'מצב רוח והכרת תודה' : 'Mood & Gratitude')}
        subtitle={t('mood.subtitle', isRTL ? 'עקוב אחר הרווחה היומית שלך' : 'Track your daily wellbeing')}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats - 2 Column Grid */}
        <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.statCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.brandOrange }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('mood.streak', isRTL ? 'רצף ימים' : 'Day Streak')}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: colors.brandOrange }]}>{thisWeekCount}/{totalDays}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('mood.thisWeek', isRTL ? 'השבוע' : 'This Week')}
            </Text>
          </View>
        </View>

        {/* Mood Tracking */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('mood.howAreYou', isRTL ? 'איך אתה מרגיש היום?' : 'How are you feeling today?')}
          </Text>

          {/* HORIZONTAL EMOJI GRID (Not vertical pills!) */}
          <View style={[styles.moodGrid, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.level}
                style={[
                  styles.moodButton,
                  { 
                    backgroundColor: colors.bgCard,
                    borderColor: selectedMood === option.level ? colors.brandOrange : colors.divider 
                  },
                  selectedMood === option.level && styles.moodButtonActive,
                ]}
                onPress={() => setSelectedMood(option.level)}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={[
                  styles.moodLabel, 
                  { 
                    color: selectedMood === option.level ? colors.brandOrange : colors.textSecondary 
                  }
                ]}>
                  {isRTL ? option.label_he : option.label_en}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Optional Note */}
          <TextInput
            style={[
              styles.noteInput,
              { 
                backgroundColor: colors.bgCard, 
                color: colors.textPrimary, 
                borderColor: colors.divider,
                textAlign: isRTL ? 'right' : 'left'
              }
            ]}
            placeholder={t('mood.notePlaceholder', isRTL ? 'איך עבר עליך היום? (אופציונלי)' : 'How was your day? (optional)')}
            placeholderTextColor={colors.textTertiary}
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: !selectedMood ? colors.textTertiary : colors.brandOrange },
            ]}
            onPress={handleSaveMood}
            disabled={!selectedMood || saving}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveButtonText, { color: colors.white }]}>
              {saving 
                ? t('mood.saving', isRTL ? 'שומר...' : 'Saving...') 
                : t('mood.saveMood', isRTL ? 'שמור מצב רוח' : 'Save Mood')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gratitude Journal */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('gratitude.title', isRTL ? 'על מה אתה אסיר תודה?' : 'What are you grateful for?')}
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('gratitude.subtitle', isRTL ? 'רשום דבר אחד לפחות שאתה אסיר תודה עליו היום' : "Write at least one thing you're grateful for today")}
          </Text>

          <TextInput
            style={[
              styles.gratitudeInput,
              { 
                backgroundColor: colors.bgCard, 
                color: colors.textPrimary, 
                borderColor: colors.divider,
                textAlign: isRTL ? 'right' : 'left'
              }
            ]}
            placeholder={t('gratitude.placeholder', isRTL ? 'אני אסיר תודה על...' : 'I am grateful for...')}
            placeholderTextColor={colors.textTertiary}
            value={gratitudeText}
            onChangeText={setGratitudeText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: !gratitudeText.trim() ? colors.textTertiary : colors.brandOrange },
            ]}
            onPress={handleSaveGratitude}
            disabled={!gratitudeText.trim() || saving}
            activeOpacity={0.8}
          >
            <Text style={[styles.saveButtonText, { color: colors.white }]}>
              {saving 
                ? t('gratitude.saving', isRTL ? 'שומר...' : 'Saving...') 
                : t('gratitude.save', isRTL ? 'שמור תודה' : 'Save Gratitude')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any, bottomInset: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Math.max(bottomInset, spacing.xl) + spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  statCard: {
    flex: 1,
    height: componentSizes.cardHeight.sm,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.md,
  },
  statIcon: {
    fontSize: componentSizes.iconSize.lg,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.md,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
    marginBottom: spacing.lg,
    opacity: 0.8,
  },
  // HORIZONTAL MOOD GRID (not vertical pills!)
  moodGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  moodButton: {
    flex: 1,
    minWidth: 60,
    maxWidth: 70,
    height: componentSizes.cardHeight.md,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    ...shadowPresets.sm,
  },
  moodButtonActive: {
    transform: [{ scale: 1.05 }],
    ...shadowPresets.md,
  },
  moodEmoji: {
    fontSize: componentSizes.iconSize.lg,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },
  noteInput: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    borderWidth: 1,
    marginBottom: spacing.md,
    minHeight: 90,
    ...shadowPresets.sm,
  },
  gratitudeInput: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    borderWidth: 1,
    marginBottom: spacing.md,
    minHeight: 110,
    ...shadowPresets.sm,
  },
  saveButton: {
    height: componentSizes.cardHeight.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.md,
  },
  saveButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
});

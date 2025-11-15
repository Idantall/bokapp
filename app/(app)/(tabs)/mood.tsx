import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MetricCard } from '@/components/MetricCard';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useGratitude } from '@/hooks/useGratitude';

type MoodLevel = 1 | 2 | 3 | 4 | 5;

const MOOD_OPTIONS: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😢', label: 'Very Bad' },
  { level: 2, emoji: '😟', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '😊', label: 'Good' },
  { level: 5, emoji: '😄', label: 'Excellent' },
];

export default function MoodScreen() {
  const { t } = useTranslation();
  const { todayEntry, streak, createEntry } = useMoodEntries();
  const { todayEntry: gratitudeEntry, createOrUpdateEntry: saveGratitude } = useGratitude();

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(todayEntry?.mood_level as MoodLevel || null);
  const [moodNote, setMoodNote] = useState(todayEntry?.note || '');
  const [gratitudeText, setGratitudeText] = useState(gratitudeEntry?.content || '');
  const [saving, setSaving] = useState(false);

  const handleSaveMood = async () => {
    if (!selectedMood) {
      Alert.alert(t('mood.selectMood', 'Please select your mood'));
      return;
    }

    setSaving(true);
    const { error } = await createEntry({
      mood_level: selectedMood,
      note: moodNote,
    });
    setSaving(false);

    if (error) {
      Alert.alert(t('error', 'Error'), error);
    } else {
      Alert.alert(t('mood.saved', 'Saved!'), t('mood.thankYou', 'Thank you for tracking your mood'));
    }
  };

  const handleSaveGratitude = async () => {
    if (!gratitudeText.trim()) {
      Alert.alert(t('gratitude.enterText', 'Please enter something you\'re grateful for'));
      return;
    }

    setSaving(true);
    const today = new Date().toISOString().split('T')[0];
    const { error } = await saveGratitude(today, gratitudeText);
    setSaving(false);

    if (error) {
      Alert.alert(t('error', 'Error'), error);
    } else {
      Alert.alert(t('gratitude.saved', 'Saved!'), t('gratitude.thankYou', 'Your gratitude has been recorded'));
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('mood.title', 'Mood & Gratitude')}
        subtitle={t('mood.subtitle', 'Track your daily wellbeing')}
      />

      <ScrollView style={styles.content}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <MetricCard
            icon="🔥"
            title={t('mood.streak', 'Day Streak')}
            value={streak}
          />
          <MetricCard
            icon="📊"
            title={t('mood.thisWeek', 'This Week')}
            value="5/7"
          />
        </View>

        {/* Mood Tracking */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('mood.howAreYou', 'How are you feeling today?')}</Text>

          <View style={styles.moodGrid}>
            {MOOD_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.level}
                style={[
                  styles.moodButton,
                  selectedMood === option.level && styles.moodButtonActive,
                  shadows.sm,
                ]}
                onPress={() => setSelectedMood(option.level)}
              >
                <Text style={styles.moodEmoji}>{option.emoji}</Text>
                <Text style={styles.moodLabel}>{t(`mood.${option.label.toLowerCase()}`, option.label)}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.noteInput}
            placeholder={t('mood.notePlaceholder', 'How was your day? (optional)')}
            placeholderTextColor={colors.textTertiary}
            value={moodNote}
            onChangeText={setMoodNote}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, !selectedMood && styles.saveButtonDisabled, shadows.md]}
            onPress={handleSaveMood}
            disabled={!selectedMood || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? t('mood.saving', 'Saving...') : t('mood.saveMood', 'Save Mood')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gratitude Journal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('gratitude.title', 'What are you grateful for?')}</Text>
          <Text style={styles.sectionSubtitle}>
            {t('gratitude.subtitle', 'Write at least one thing you\'re grateful for today')}
          </Text>

          <TextInput
            style={styles.gratitudeInput}
            placeholder={t('gratitude.placeholder', 'I am grateful for...')}
            placeholderTextColor={colors.textTertiary}
            value={gratitudeText}
            onChangeText={setGratitudeText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.saveButton, !gratitudeText.trim() && styles.saveButtonDisabled, shadows.md]}
            onPress={handleSaveGratitude}
            disabled={!gratitudeText.trim() || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? t('gratitude.saving', 'Saving...') : t('gratitude.save', 'Save Gratitude')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* View History */}
        <TouchableOpacity style={[styles.historyButton, shadows.sm]}>
          <Text style={styles.historyButtonText}>{t('mood.viewHistory', 'View History')}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  moodButton: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '18%',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  moodButtonActive: {
    borderColor: colors.brandOrange,
    backgroundColor: colors.brandOrange + '10',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
    minHeight: 80,
  },
  gratitudeInput: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    ...typography.body,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  historyButton: {
    backgroundColor: colors.bgCard,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  historyButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.brandOrange,
  },
});


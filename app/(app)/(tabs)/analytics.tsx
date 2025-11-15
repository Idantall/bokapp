/**
 * ANALYTICS SCREEN - Production Quality
 * 
 * Features:
 * - 2-column metrics grid
 * - Premium lock cards with visual appeal
 * - Safe area handling
 * - Theme-aware colors
 * - Better chart placeholders
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useDirection } from '@/hooks/useDirection';
import { spacing, fontSize, fontWeight, radius, shadowPresets, componentSizes } from '@/lib/designSystem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGoals } from '@/hooks/useGoals';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useGratitude } from '@/hooks/useGratitude';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { isRTL } = useDirection();
  const { isPremium } = useCurrentUser();
  const { goals, completedGoals } = useGoals();
  const { entries: moodEntries, streak } = useMoodEntries(30);
  const { entries: gratitudeEntries } = useGratitude(30);

  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((sum, e) => sum + e.mood_level, 0) / moodEntries.length).toFixed(1)
    : '0';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={t('analytics.title', isRTL ? 'ניתוחים' : 'Analytics')}
        subtitle={t('analytics.subtitle', isRTL ? 'עקוב אחר ההתקדמות שלך' : 'Track your progress')}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Stats - 2 Column Grid */}
        <View style={styles.statsGrid}>
          {/* Goals Completed */}
          <View style={[styles.metricCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.metricIcon}>🎯</Text>
            <Text style={[styles.metricValue, { color: colors.brandOrange }]}>
              {completedGoals.length}/{goals.length}
            </Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('analytics.goalsCompleted', isRTL ? 'יעדים שהושלמו' : 'Goals Completed')}
            </Text>
            <Text style={[styles.metricSubtitle, { color: colors.textTertiary }]}>
              {completionRate}%
            </Text>
          </View>

          {/* Average Mood */}
          <View style={[styles.metricCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.metricIcon}>😊</Text>
            <Text style={[styles.metricValue, { color: colors.brandOrange }]}>{avgMood}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('analytics.avgMood', isRTL ? 'מצב רוח ממוצע' : 'Avg Mood')}
            </Text>
            <Text style={[styles.metricSubtitle, { color: colors.textTertiary }]}>
              {t('analytics.last30Days', isRTL ? '30 ימים אחרונים' : 'Last 30 days')}
            </Text>
          </View>

          {/* Streak */}
          <View style={[styles.metricCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.metricIcon}>🔥</Text>
            <Text style={[styles.metricValue, { color: colors.brandOrange }]}>{streak}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('analytics.streak', isRTL ? 'רצף' : 'Streak')}
            </Text>
            <Text style={[styles.metricSubtitle, { color: colors.textTertiary }]}>
              {t('analytics.days', isRTL ? 'ימים' : 'days')}
            </Text>
          </View>

          {/* Gratitude */}
          <View style={[styles.metricCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.metricIcon}>🙏</Text>
            <Text style={[styles.metricValue, { color: colors.brandOrange }]}>{gratitudeEntries.length}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('analytics.gratitude', isRTL ? 'הכרת תודה' : 'Gratitude')}
            </Text>
            <Text style={[styles.metricSubtitle, { color: colors.textTertiary }]}>
              {t('analytics.entries', isRTL ? 'רשומות' : 'entries')}
            </Text>
          </View>
        </View>

        {/* Mood Trend Chart */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('analytics.moodTrend', isRTL ? 'מגמת מצב רוח' : 'Mood Trend')}
          </Text>
          <View style={[styles.chartCard, { backgroundColor: colors.bgCard }]}>
            <Text style={styles.chartPlaceholder}>📈</Text>
            <Text style={[styles.chartText, { color: colors.textSecondary }]}>
              {isPremium
                ? t('analytics.chartComing', isRTL ? 'תרשים בקרוב' : 'Chart visualization coming soon')
                : t('analytics.basicChart', isRTL ? 'מעקב מצב רוח בסיסי' : 'Basic mood tracking')}
            </Text>
          </View>
        </View>

        {/* Life Balance Over Time - Premium Lock */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('analytics.lifeBalance', isRTL ? 'איזון חיים לאורך זמן' : 'Life Balance Over Time')}
            </Text>
            {!isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.brandOrange + '20' }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.brandOrange }]}>
                  💎 {t('premium', isRTL ? 'פרימיום' : 'Premium')}
                </Text>
              </View>
            )}
          </View>

          {!isPremium ? (
            <TouchableOpacity
              style={[styles.premiumLockCard, { backgroundColor: colors.brandOrange }]}
              onPress={() => router.push('/(app)/paywall')}
              activeOpacity={0.8}
            >
              <Text style={styles.lockEmoji}>🔒</Text>
              <Text style={[styles.lockTitle, { color: colors.white }]}>
                {t('analytics.premiumOnly', isRTL ? 'תכונת פרימיום' : 'Premium Feature')}
              </Text>
              <Text style={[styles.lockText, { color: colors.white }]}>
                {t('analytics.upgradeForAdvanced', isRTL ? 'שדרג לגישה לניתוחים ותובנות מתקדמות' : 'Upgrade to access advanced analytics and insights')}
              </Text>
              <View style={[styles.lockButton, { backgroundColor: colors.white }]}>
                <Text style={[styles.lockButtonText, { color: colors.brandOrange }]}>
                  {t('analytics.upgrade', isRTL ? 'שדרג עכשיו' : 'Upgrade Now')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.chartCard, { backgroundColor: colors.bgCard }]}>
              <Text style={styles.chartPlaceholder}>📊</Text>
              <Text style={[styles.chartText, { color: colors.textSecondary }]}>
                {t('analytics.balanceChart', isRTL ? 'עקוב אחר האיזון בכל תחומי החיים' : 'Track balance across all life areas')}
              </Text>
            </View>
          )}
        </View>

        {/* Goal Insights - Premium Lock */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {t('analytics.goalInsights', isRTL ? 'תובנות יעדים' : 'Goal Insights')}
            </Text>
            {!isPremium && (
              <View style={[styles.premiumBadge, { backgroundColor: colors.brandOrange + '20' }]}>
                <Text style={[styles.premiumBadgeText, { color: colors.brandOrange }]}>
                  💎 {t('premium', isRTL ? 'פרימיום' : 'Premium')}
                </Text>
              </View>
            )}
          </View>

          {!isPremium ? (
            <TouchableOpacity
              style={[styles.premiumLockCard, { backgroundColor: colors.brandOrange }]}
              onPress={() => router.push('/(app)/paywall')}
              activeOpacity={0.8}
            >
              <Text style={styles.lockEmoji}>💡</Text>
              <Text style={[styles.lockTitle, { color: colors.white }]}>
                {t('analytics.aiInsights', isRTL ? 'תובנות AI' : 'AI-Powered Insights')}
              </Text>
              <Text style={[styles.lockText, { color: colors.white }]}>
                {t('analytics.getPersonalized', isRTL ? 'קבל המלצות מותאמות אישית והצעות יעדים' : 'Get personalized recommendations and goal suggestions')}
              </Text>
              <View style={[styles.lockButton, { backgroundColor: colors.white }]}>
                <Text style={[styles.lockButtonText, { color: colors.brandOrange }]}>
                  {t('analytics.upgrade', isRTL ? 'שדרג עכשיו' : 'Upgrade Now')}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.chartCard, { backgroundColor: colors.bgCard }]}>
              <Text style={styles.chartPlaceholder}>💡</Text>
              <Text style={[styles.chartText, { color: colors.textSecondary }]}>
                {t('analytics.insightsComing', isRTL ? 'תובנות מותאמות אישית בקרוב' : 'Personalized insights coming soon')}
              </Text>
            </View>
          )}
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
  // 2-COLUMN METRICS GRID
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
    marginTop: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%', // 2 columns with gap
    height: componentSizes.cardHeight.lg,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.md,
  },
  metricIcon: {
    fontSize: componentSizes.iconSize.lg,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  metricLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
    marginBottom: spacing.xxs,
  },
  metricSubtitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  premiumBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  premiumBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  chartCard: {
    height: 180,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.md,
  },
  chartPlaceholder: {
    fontSize: componentSizes.iconSize.xxl,
    marginBottom: spacing.md,
  },
  chartText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
  },
  // PREMIUM LOCK CARD
  premiumLockCard: {
    minHeight: 200,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.lg,
  },
  lockEmoji: {
    fontSize: componentSizes.iconSize.xxl,
    marginBottom: spacing.md,
  },
  lockTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lockText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
    marginBottom: spacing.lg,
    opacity: 0.95,
    lineHeight: fontSize.md * 1.5,
  },
  lockButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    ...shadowPresets.sm,
  },
  lockButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
});

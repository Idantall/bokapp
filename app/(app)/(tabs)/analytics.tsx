import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MetricCard } from '@/components/MetricCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useGoals } from '@/hooks/useGoals';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useGratitude } from '@/hooks/useGratitude';

export default function AnalyticsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isPremium } = useCurrentUser();
  const { goals, completedGoals } = useGoals();
  const { entries: moodEntries, streak } = useMoodEntries(30);
  const { entries: gratitudeEntries } = useGratitude(30);

  const completionRate = goals.length > 0 ? Math.round((completedGoals.length / goals.length) * 100) : 0;
  const avgMood = moodEntries.length > 0
    ? (moodEntries.reduce((sum, e) => sum + e.mood_level, 0) / moodEntries.length).toFixed(1)
    : '0';

  const renderPremiumLock = () => (
    <TouchableOpacity
      style={[styles.lockOverlay, shadows.lg]}
      onPress={() => router.push('/(app)/paywall')}
    >
      <Text style={styles.lockEmoji}>🔒</Text>
      <Text style={styles.lockTitle}>{t('analytics.premiumOnly', 'Premium Feature')}</Text>
      <Text style={styles.lockText}>
        {t('analytics.upgradeForAdvanced', 'Upgrade to access advanced analytics and insights')}
      </Text>
      <View style={styles.lockButton}>
        <Text style={styles.lockButtonText}>{t('analytics.upgrade', 'Upgrade Now')}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('analytics.title', 'Analytics')}
        subtitle={t('analytics.subtitle', 'Track your progress')}
      />

      <ScrollView style={styles.content}>
        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <MetricCard
            icon="🎯"
            title={t('analytics.goalsCompleted', 'Goals Completed')}
            value={`${completedGoals.length}/${goals.length}`}
            subtitle={`${completionRate}%`}
          />
          <MetricCard
            icon="😊"
            title={t('analytics.avgMood', 'Avg Mood')}
            value={avgMood}
            subtitle={t('analytics.last30Days', 'Last 30 days')}
          />
          <MetricCard
            icon="🔥"
            title={t('analytics.streak', 'Streak')}
            value={streak}
            subtitle={t('analytics.days', 'days')}
          />
          <MetricCard
            icon="🙏"
            title={t('analytics.gratitude', 'Gratitude')}
            value={gratitudeEntries.length}
            subtitle={t('analytics.entries', 'entries')}
          />
        </View>

        {/* Mood Trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analytics.moodTrend', 'Mood Trend')}</Text>
          <View style={[styles.chartCard, shadows.md]}>
            <Text style={styles.chartPlaceholder}>📈</Text>
            <Text style={styles.chartText}>
              {isPremium
                ? t('analytics.chartComing', 'Chart visualization coming soon')
                : t('analytics.basicChart', 'Basic mood tracking')}
            </Text>
          </View>
        </View>

        {/* Life Balance Over Time - Premium */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('analytics.lifeBalance', 'Life Balance Over Time')}</Text>
            {!isPremium && <Text style={styles.premiumBadge}>💎 {t('premium', 'Premium')}</Text>}
          </View>
          <View style={[styles.chartCard, shadows.md, !isPremium && styles.blurred]}>
            {!isPremium && renderPremiumLock()}
            <Text style={styles.chartPlaceholder}>📊</Text>
            <Text style={styles.chartText}>{t('analytics.balanceChart', 'Track balance across all life areas')}</Text>
          </View>
        </View>

        {/* Goal Progress - Premium */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('analytics.goalProgress', 'Goal Progress Details')}</Text>
            {!isPremium && <Text style={styles.premiumBadge}>💎 {t('premium', 'Premium')}</Text>}
          </View>
          <View style={[styles.chartCard, shadows.md, !isPremium && styles.blurred]}>
            {!isPremium && renderPremiumLock()}
            <Text style={styles.chartPlaceholder}>🎯</Text>
            <Text style={styles.chartText}>{t('analytics.detailedProgress', 'Detailed progress tracking')}</Text>
          </View>
        </View>

        {/* Insights - Premium */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('analytics.insights', 'AI Insights')}</Text>
            {!isPremium && <Text style={styles.premiumBadge}>💎 {t('premium', 'Premium')}</Text>}
          </View>
          <View style={[styles.insightsCard, shadows.md, !isPremium && styles.blurred]}>
            {!isPremium && renderPremiumLock()}
            <Text style={styles.insightText}>
              🤖 {t('analytics.aiInsight', 'Your wellness journey is trending positively! Keep up the great work.')}
            </Text>
          </View>
        </View>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  premiumBadge: {
    ...typography.caption,
    color: colors.brandOrange,
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    position: 'relative',
  },
  blurred: {
    opacity: 0.6,
  },
  chartPlaceholder: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  chartText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  insightsCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    position: 'relative',
  },
  insightText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.bgCard + 'F0',
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    padding: spacing.xl,
  },
  lockEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  lockTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  lockText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  lockButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
  },
  lockButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
});


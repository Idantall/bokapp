import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MetricCard } from '@/components/MetricCard';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { LifeWheel } from '@/components/LifeWheel';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useGoals } from '@/hooks/useGoals';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useDirection } from '@/hooks/useDirection';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isPremium, loading: userLoading, error: userError } = useCurrentUser();
  const { activeLifeAreas, loading: areasLoading } = useLifeAreas();
  const { activeGoals } = useGoals();
  const { streak, todayEntry } = useMoodEntries();
  const { isRTL } = useDirection();

  if (userLoading || areasLoading) {
    return <LoadingOverlay />;
  }

  // Calculate average score for the wheel
  const wheelSegments = activeLifeAreas.map(area => ({
    id: area.id,
    name_en: area.name_en,
    name_he: area.name_he,
    color: area.color_hex,
    score: Math.floor(Math.random() * 10) + 1, // TODO: Get from progress_entries
  }));

  const averageBalance = wheelSegments.length > 0
    ? Math.round(wheelSegments.reduce((sum, s) => sum + s.score, 0) / wheelSegments.length)
    : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('home.greeting', `Hello, ${user?.full_name || 'Friend'}`)}
        subtitle={t('home.subtitle', 'How are you feeling today?')}
      />

      <ScrollView style={styles.content}>
        {/* Life Wheel */}
        <View style={styles.wheelContainer}>
          <LifeWheel segments={wheelSegments} size={280} isRTL={isRTL} />
          <Text style={styles.balanceScore}>
            {t('home.balanceScore', 'Balance Score')}: <Text style={styles.balanceValue}>{averageBalance}/10</Text>
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <MetricCard
            icon="🎯"
            title={t('home.activeGoals', 'Active Goals')}
            value={activeGoals.length}
          />
          <MetricCard
            icon="🔥"
            title={t('home.moodStreak', 'Day Streak')}
            value={streak}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('home.quickActions', 'Quick Actions')}
          </Text>

          {!todayEntry && (
            <TouchableOpacity
              style={[styles.actionCard, shadows.md]}
              onPress={() => router.push('/(app)/(tabs)/mood')}
            >
              <Text style={styles.actionIcon}>😊</Text>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>{t('home.logMood', 'Log Today\'s Mood')}</Text>
                <Text style={styles.actionSubtitle}>{t('home.moodCTA', 'How are you feeling?')}</Text>
              </View>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionCard, shadows.md]}
            onPress={() => router.push('/(app)/(tabs)/ai')}
          >
            <Text style={styles.actionIcon}>🤖</Text>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{t('home.talkToAI', 'Talk to AI Coach')}</Text>
              <Text style={styles.actionSubtitle}>
                {isPremium 
                  ? t('home.aiUnlimited', 'Unlimited messages')
                  : t('home.aiFree', '5 messages/day')}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Life Areas Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('home.lifeAreas', 'Life Areas')}
          </Text>

          {activeLifeAreas.map((area) => (
            <TouchableOpacity
              key={area.id}
              style={[styles.areaCard, shadows.sm]}
              onPress={() => router.push(`/(app)/life-area/${area.id}`)}
            >
              <View style={[styles.areaColor, { backgroundColor: area.color_hex }]} />
              <View style={styles.areaContent}>
                <Text style={styles.areaTitle}>
                  {isRTL ? area.name_he : area.name_en}
                </Text>
                <Text style={styles.areaSubtitle}>
                  {t('home.tapToView', 'Tap to view details')}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={[styles.upgradeCard, shadows.lg]}
            onPress={() => router.push('/(app)/paywall')}
          >
            <Text style={styles.upgradeEmoji}>💎</Text>
            <Text style={styles.upgradeTitle}>{t('home.upgradeToPremium', 'Upgrade to Premium')}</Text>
            <Text style={styles.upgradeText}>
              {t('home.upgradeText', 'Unlock unlimited AI messages and goals in all life areas')}
            </Text>
          </TouchableOpacity>
        )}
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
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  balanceScore: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  balanceValue: {
    ...typography.h2,
    color: colors.brandOrange,
    fontWeight: '700',
  },
  statsRow: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionIcon: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  areaCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  areaColor: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  areaContent: {
    flex: 1,
  },
  areaTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  areaSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  upgradeCard: {
    backgroundColor: colors.brandOrange,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  upgradeEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  upgradeTitle: {
    ...typography.h2,
    color: colors.white,
    marginBottom: spacing.sm,
  },
  upgradeText: {
    ...typography.body,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
});


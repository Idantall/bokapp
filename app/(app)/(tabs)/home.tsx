import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/hooks/useThemedColors';
import { spacing, fontSize, fontWeight, radius, shadowPresets, componentSizes } from '@/lib/designSystem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { LifeWheelEnhanced } from '@/components/LifeWheelEnhanced';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useGoals } from '@/hooks/useGoals';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useDirection } from '@/hooks/useDirection';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { user, isPremium, loading: userLoading } = useCurrentUser();
  const { activeLifeAreas, loading: areasLoading } = useLifeAreas();
  const { activeGoals } = useGoals();
  const { streak, todayEntry } = useMoodEntries();
  const { isRTL } = useDirection();

  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  if (userLoading || areasLoading) {
    return <LoadingOverlay />;
  }

  // Calculate average score for the wheel
  // Check which areas have goals
  const goalsPerArea = activeGoals.reduce((acc, goal) => {
    acc[goal.life_area_id] = (acc[goal.life_area_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const wheelSegments = activeLifeAreas.map(area => {
    const hasGoals = goalsPerArea[area.id] > 0;
    return {
      id: area.id,
      name_en: area.name_en,
      name_he: area.name_he,
      color: area.color_hex,
      score: Math.floor(Math.random() * 10) + 1, // TODO: Get from progress_entries
      hasGoals, // Used for vibrant vs hazy display
    };
  });

  const averageBalance = wheelSegments.length > 0
    ? Math.round(wheelSegments.reduce((sum, s) => sum + s.score, 0) / wheelSegments.length)
    : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={`${isRTL ? 'שלום' : 'Hi'}, ${user?.full_name || (isRTL ? 'חבר' : 'Friend')}`}
        subtitle={isRTL ? 'איך אתה מרגיש היום?' : 'How are you feeling today?'}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Life Wheel */}
        <View style={styles.wheelContainer}>
          <LifeWheelEnhanced 
            segments={wheelSegments} 
            size={Math.min(SCREEN_WIDTH - 40, 340)} 
            isRTL={isRTL} 
          />
          <View style={styles.balanceScoreContainer}>
            <Text style={styles.balanceLabel}>
              {t('home.balanceScore', isRTL ? 'ציון איזון' : 'Balance Score')}
            </Text>
            <Text style={styles.balanceValue}>{averageBalance}/10</Text>
          </View>
        </View>

        {/* Quick Stats - 2 Column Grid */}
        <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.bgCard }]}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>🎯</Text>
            <Text style={[styles.statValue, { color: colors.brandOrange }]}>{activeGoals.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.activeGoals', isRTL ? 'יעדים פעילים' : 'Active Goals')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.statCard, { backgroundColor: colors.bgCard }]}
            activeOpacity={0.7}
          >
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.brandOrange }]}>{streak}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              {t('home.moodStreak', isRTL ? 'רצף ימים' : 'Day Streak')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('home.quickActions', isRTL ? 'פעולות מהירות' : 'Quick Actions')}
          </Text>

          {!todayEntry && (
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: colors.bgCard }]}
              onPress={() => router.push('/(app)/(tabs)/mood')}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>😊</Text>
              <View style={[styles.actionContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                  {t('home.logMood', isRTL ? 'רשום מצב רוח' : "Log Today's Mood")}
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                  {t('home.moodCTA', isRTL ? 'איך אתה מרגיש?' : 'How are you feeling?')}
                </Text>
              </View>
              <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>{isRTL ? '←' : '→'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.bgCard }]}
            onPress={() => router.push('/(app)/(tabs)/ai')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionIcon}>🤖</Text>
            <View style={[styles.actionContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.actionTitle, { color: colors.textPrimary }]}>
                {t('home.talkToAI', isRTL ? 'שוחח עם המאמן AI' : 'Talk to AI Coach')}
              </Text>
              <Text style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
                {isPremium 
                  ? t('home.aiUnlimited', isRTL ? 'הודעות ללא הגבלה' : 'Unlimited messages')
                  : t('home.aiFree', isRTL ? '5 הודעות ליום' : '5 messages/day')}
              </Text>
            </View>
            <Text style={[styles.actionChevron, { color: colors.textTertiary }]}>{isRTL ? '←' : '→'}</Text>
          </TouchableOpacity>
        </View>

        {!isPremium && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.brandOrange }]}
            onPress={() => router.push('/(app)/paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeEmoji}>💎</Text>
            <Text style={[styles.upgradeTitle, { color: colors.white }]}>
              {t('home.upgradeToPremium', isRTL ? 'שדרג לפרימיום' : 'Upgrade to Premium')}
            </Text>
            <Text style={[styles.upgradeText, { color: colors.white }]}>
              {t('home.upgradeText', isRTL ? 'פתח הודעות AI ללא הגבלה ויעדים בכל תחומי החיים' : 'Unlock unlimited AI messages and goals in all life areas')}
            </Text>
          </TouchableOpacity>
        )}
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
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  balanceScoreContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  balanceLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  balanceValue: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    color: colors.brandOrange,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.xxl,
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
  actionCard: {
    height: componentSizes.cardHeight.md,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadowPresets.sm,
  },
  actionIcon: {
    fontSize: componentSizes.iconSize.xl,
    marginRight: spacing.lg,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xxs,
  },
  actionSubtitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.regular,
  },
  actionChevron: {
    fontSize: fontSize.xxl,
    marginLeft: spacing.sm,
  },
  upgradeCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadowPresets.xl,
  },
  upgradeEmoji: {
    fontSize: componentSizes.iconSize.xxl,
    marginBottom: spacing.md,
  },
  upgradeTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  upgradeText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    textAlign: 'center',
    opacity: 0.95,
    lineHeight: fontSize.md * 1.5,
  },
});


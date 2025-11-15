import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing } from '@/lib/theme';
import { useTranslation } from 'react-i18next';

interface Milestone {
  days: number;
  icon: string;
  title: string;
  description: string;
}

const { width } = Dimensions.get('window');

export function ProgressTimeline() {
  const { t } = useTranslation();

  const milestones: Milestone[] = [
    {
      days: 7,
      icon: '📅',
      title: t('progress.week1Title', 'After 7 days:'),
      description: t('progress.week1Desc', "You've slept better, had more clarity, and built momentum."),
    },
    {
      days: 30,
      icon: '📅',
      title: t('progress.month1Title', 'After 30 days:'),
      description: t('progress.month1Desc', "You're making real progress, with routines that stick."),
    },
    {
      days: 90,
      icon: '📅',
      title: t('progress.month3Title', 'After 90 days:'),
      description: t('progress.month3Desc', "You're living with intention. Balanced. Resilient. Focused."),
    },
  ];

  const curveHeight = 200;
  const curveWidth = width - 40;

  // Create smooth upward growth curve
  const pathData = `
    M 0 ${curveHeight}
    Q ${curveWidth * 0.25} ${curveHeight * 0.8} ${curveWidth * 0.5} ${curveHeight * 0.5}
    Q ${curveWidth * 0.75} ${curveHeight * 0.2} ${curveWidth} 0
  `;

  return (
    <View style={styles.container}>
      {/* Growth curve */}
      <View style={styles.curveContainer}>
        <Svg width={curveWidth} height={curveHeight}>
          <Defs>
            <LinearGradient id="curveGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#FF6B6B" stopOpacity="0.6" />
              <Stop offset="50%" stopColor="#FF8C42" stopOpacity="0.6" />
              <Stop offset="100%" stopColor="#FFE66D" stopOpacity="0.6" />
            </LinearGradient>
          </Defs>
          <Path
            d={`${pathData} L ${curveWidth} ${curveHeight} L 0 ${curveHeight} Z`}
            fill="url(#curveGradient)"
          />
          <Path
            d={pathData}
            stroke="#FF6B6B"
            strokeWidth={3}
            fill="none"
          />
        </Svg>
      </View>

      {/* Milestones */}
      <View style={styles.milestonesContainer}>
        {milestones.map((milestone, index) => (
          <View key={index} style={styles.milestone}>
            <Text style={styles.milestoneIcon}>{milestone.icon}</Text>
            <Text style={styles.milestoneTitle}>{milestone.title}</Text>
            <Text style={styles.milestoneDescription}>{milestone.description}</Text>
          </View>
        ))}

        {/* Call to action */}
        <View style={styles.cta}>
          <Text style={styles.ctaIcon}>🚀</Text>
          <Text style={styles.ctaTitle}>
            {t('progress.ctaTitle', 'And it all started with...')}
          </Text>
          <Text style={styles.ctaDescription}>
            {t('progress.ctaDesc', 'A few minutes. A few questions. And the decision to act.')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xl,
  },
  curveContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  milestonesContainer: {
    paddingHorizontal: spacing.xl,
  },
  milestone: {
    marginBottom: spacing.xl,
  },
  milestoneIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  milestoneTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  milestoneDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  cta: {
    marginTop: spacing.lg,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  ctaIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  ctaTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  ctaDescription: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});


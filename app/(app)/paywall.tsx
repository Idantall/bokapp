import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { CountdownTimer } from '@/components/CountdownTimer';
import { TestimonialCard } from '@/components/TestimonialCard';
import { upgradeToPremium } from '@/lib/billing';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');

  const handleUpgrade = async () => {
    const { success } = await upgradeToPremium();
    if (success) {
      router.back();
    }
  };

  const features = [
    { 
      icon: '🤖', 
      title: t('paywall.aiCoach', 'Full access to AI coach Riley 24/7'),
      gradient: { start: colors.brandPurple, end: colors.brandOrange }
    },
    { 
      icon: '🎯', 
      title: t('paywall.unlimitedGoals', 'Unlimited goals, habits and personal plans'),
      gradient: { start: colors.health.start, end: colors.health.end }
    },
    { 
      icon: '📊', 
      title: t('paywall.advancedAnalytics', 'Advanced analytics & insights'),
      gradient: { start: colors.career.start, end: colors.career.end }
    },
    { 
      icon: '🔔', 
      title: t('paywall.customNotifications', 'Custom reminders & notifications'),
      gradient: { start: colors.relationships.start, end: colors.relationships.end }
    },
    { 
      icon: '🎨', 
      title: t('paywall.personalizedJourney', 'Personalized wellness journey'),
      gradient: { start: colors.freeTime.start, end: colors.freeTime.end }
    },
  ];

  const testimonials = [
    {
      text: t('paywall.testimonial1', 'This app is for everyone that wants more balance in life, gain self-awareness, or feel more joy.'),
      rating: 5,
    },
    {
      text: t('paywall.testimonial2', 'The most useful app I\'ve come across. Better than books, counseling, or any other motivation tool.'),
      rating: 5,
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Countdown timer */}
      <CountdownTimer 
        title={t('paywall.offerExpires', 'Offer expires in')} 
      />

      {/* Hero section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          {t('paywall.unlockCoach', 'Unlock your personal coach and join over')}
        </Text>
        <Text style={styles.heroHighlight}>
          {t('paywall.userCount', '2.5 million')}
        </Text>
        <Text style={styles.heroSubtitle}>
          {t('paywall.heroSubtitle', 'like-minded people on a journey to a fantastic life:')}
        </Text>
      </View>

      {/* Testimonials */}
      <View style={styles.testimonialsContainer}>
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            text={testimonial.text}
            rating={testimonial.rating}
          />
        ))}
      </View>

      {/* What you'll get */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>
          {t('paywall.whatYouGet', "What you'll get:")}
        </Text>
        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Pricing plans */}
      <View style={styles.pricingSection}>
        {/* Yearly plan (recommended) */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'yearly' && styles.planCardSelected,
            shadows.md,
          ]}
          onPress={() => setSelectedPlan('yearly')}
        >
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>{t('paywall.save', 'Save 49%')}</Text>
          </View>
          <View style={styles.planHeader}>
            <Text style={styles.planDuration}>
              {t('paywall.12months', '12 months')}
            </Text>
            <Text style={styles.planPrice}>₪14.99/mo.</Text>
          </View>
          <Text style={styles.planTotal}>
            <Text style={styles.planTotalOld}>₪349.90</Text> ₪179.90/yr.
          </Text>
        </TouchableOpacity>

        {/* Monthly plan */}
        <TouchableOpacity
          style={[
            styles.planCard,
            selectedPlan === 'monthly' && styles.planCardSelected,
            styles.planCardSecondary,
          ]}
          onPress={() => setSelectedPlan('monthly')}
        >
          <View style={styles.planHeader}>
            <Text style={[styles.planDuration, styles.planDurationSecondary]}>
              {t('paywall.1month', '1 month')}
            </Text>
            <Text style={[styles.planPrice, styles.planPriceSecondary]}>₪59.90/mo.</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={[styles.upgradeButton, shadows.lg]}
        onPress={handleUpgrade}
      >
        <Text style={styles.upgradeButtonText}>
          {t('paywall.getPremium', 'Get Premium')}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {t('paywall.noCommitment', 'No commitment. Cancel anytime.')}
        </Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.footerLink}>
              {t('paywall.restorePurchases', 'Restore purchases')}
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerLinkSeparator}>•</Text>
          <TouchableOpacity>
            <Text style={styles.footerLink}>
              {t('paywall.terms', 'Terms & Conditions')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
  },
  hero: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  heroTitle: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 24,
  },
  heroHighlight: {
    ...typography.h1,
    color: colors.white,
    fontWeight: '700',
    marginVertical: spacing.xs,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  testimonialsContainer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  featuresSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  featureList: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandOrange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 22,
  },
  pricingSection: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  planCard: {
    backgroundColor: colors.bgSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: colors.bgCard,
  },
  planCardSecondary: {
    backgroundColor: colors.bgCard,
  },
  saveBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.button,
  },
  saveBadgeText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDuration: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  planDurationSecondary: {
    ...typography.h3,
    color: colors.textSecondary,
  },
  planPrice: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  planPriceSecondary: {
    color: colors.textSecondary,
  },
  planTotal: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  planTotalOld: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  upgradeButton: {
    backgroundColor: colors.brandOrange,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  upgradeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerLink: {
    ...typography.bodySmall,
    color: colors.brandOrange,
  },
  footerLinkSeparator: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { upgradeToPremium } from '@/lib/billing';

export default function PaywallScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const handleUpgrade = async () => {
    const { success } = await upgradeToPremium();
    if (success) {
      router.back();
    }
  };

  const features = [
    { icon: '🤖', free: '5/day', premium: 'Unlimited', title: t('paywall.aiMessages', 'AI Messages') },
    { icon: '🎯', free: '1 area', premium: 'All areas', title: t('paywall.goalAreas', 'Goal Life Areas') },
    { icon: '📊', free: 'Basic', premium: 'Advanced', title: t('paywall.analytics', 'Analytics') },
    { icon: '🔔', free: 'Basic', premium: 'Custom', title: t('paywall.notifications', 'Notifications') },
    { icon: '💾', free: '30 days', premium: 'Unlimited', title: t('paywall.history', 'History') },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('paywall.title', 'Upgrade to Premium')} showBack />

      <ScrollView style={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>💎</Text>
          <Text style={styles.heroTitle}>
            {t('paywall.heroTitle', 'Unlock Your Full Potential')}
          </Text>
          <Text style={styles.heroText}>
            {t('paywall.heroText', 'Get unlimited access to all features')}
          </Text>
        </View>

        <View style={styles.featureList}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <View style={styles.featurePlans}>
                  <Text style={styles.featureFree}>{t('paywall.free', 'Free')}: {feature.free}</Text>
                  <Text style={styles.featurePremium}>{t('paywall.premium', 'Premium')}: {feature.premium}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.priceCard, shadows.lg]}>
          <Text style={styles.price}>₪29.90</Text>
          <Text style={styles.priceDetail}>{t('paywall.perMonth', '/month')}</Text>
        </View>

        <TouchableOpacity style={[styles.upgradeButton, shadows.md]} onPress={handleUpgrade}>
          <Text style={styles.upgradeButtonText}>
            {t('paywall.upgrade', 'Upgrade Now')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={styles.cancelButtonText}>
            {t('paywall.cancel', 'Maybe later')}
          </Text>
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
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  heroEmoji: {
    fontSize: 80,
    marginBottom: spacing.lg,
  },
  heroTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featureList: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featurePlans: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureFree: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  featurePremium: {
    ...typography.caption,
    color: colors.brandOrange,
    fontWeight: '600',
  },
  priceCard: {
    backgroundColor: colors.brandOrange,
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.white,
  },
  priceDetail: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  upgradeButton: {
    backgroundColor: colors.brandOrange,
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.button,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  upgradeButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    marginHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});


/**
 * PROFILE SCREEN - Production Quality
 * 
 * Features:
 * - Grouped settings sections
 * - Premium upgrade CTA card
 * - Theme/language selectors
 * - Switch components for notifications
 * - Safe area handling
 * - Theme-aware colors
 */

import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useTheme } from '@/contexts/ThemeContext';
import { useDirection } from '@/hooks/useDirection';
import { spacing, fontSize, fontWeight, radius, shadowPresets, componentSizes } from '@/lib/designSystem';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { manageSubscription } from '@/lib/billing';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { user, isPremium, isAdmin, loading } = useCurrentUser();
  const { isRTL } = useDirection();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();
  const { themeMode, setThemeMode } = useTheme();

  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  // Mock notification settings (TODO: Connect to real notification preferences)
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReminders, setWeeklyReminders] = useState(false);

  if (loading) {
    return <LoadingOverlay />;
  }

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOut', isRTL ? 'התנתק' : 'Sign Out'),
      t('profile.signOutConfirm', isRTL ? 'האם אתה בטוח שברצונך להתנתק?' : 'Are you sure you want to sign out?'),
      [
        { text: t('cancel', isRTL ? 'ביטול' : 'Cancel'), style: 'cancel' },
        {
          text: t('profile.signOut', isRTL ? 'התנתק' : 'Sign Out'),
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/welcome');
          },
        },
      ]
    );
  };

  const handleManageSubscription = async () => {
    const { success } = await manageSubscription();
    if (!success) {
      Alert.alert(
        t('error', isRTL ? 'שגיאה' : 'Error'), 
        t('profile.manageFailed', isRTL ? 'לא ניתן לפתוח ניהול מנוי' : 'Could not open subscription management')
      );
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      t('profile.theme.title', isRTL ? 'מראה' : 'Appearance'),
      t('profile.theme.description', isRTL ? 'בחר את עיצוב האפליקציה' : 'Choose your preferred theme'),
      [
        {
          text: `☀️ ${t('profile.theme.light', isRTL ? 'בהיר' : 'Light')}`,
          onPress: () => setThemeMode('light'),
        },
        {
          text: `🌙 ${t('profile.theme.dark', isRTL ? 'כהה' : 'Dark')}`,
          onPress: () => setThemeMode('dark'),
        },
        {
          text: `⚙️ ${t('profile.theme.system', isRTL ? 'אוטומטי' : 'System')}`,
          onPress: () => setThemeMode('system'),
        },
        { text: t('cancel', isRTL ? 'ביטול' : 'Cancel'), style: 'cancel' },
      ]
    );
  };

  const getThemeName = () => {
    switch (themeMode) {
      case 'light': return t('profile.theme.light', isRTL ? 'בהיר' : 'Light');
      case 'dark': return t('profile.theme.dark', isRTL ? 'כהה' : 'Dark');
      case 'system': return t('profile.theme.system', isRTL ? 'אוטומטי' : 'System');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScreenHeader
        title={t('profile.title', isRTL ? 'פרופיל' : 'Profile')}
        subtitle={user?.email || ''}
      />

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* User Info Card */}
        <View style={[styles.userCard, { backgroundColor: colors.bgCard }]}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.brandOrange + '20' }]}>
            <Text style={[styles.avatar, { color: colors.brandOrange }]}>
              {user?.full_name?.charAt(0).toUpperCase() || '👤'}
            </Text>
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>
            {user?.full_name || t('profile.anonymous', isRTL ? 'אנונימי' : 'Anonymous')}
          </Text>
          <View style={[
            styles.planBadge, 
            { backgroundColor: isPremium ? colors.brandOrange + '20' : colors.divider }
          ]}>
            <Text style={[styles.planText, { color: isPremium ? colors.brandOrange : colors.textSecondary }]}>
              {isPremium 
                ? `💎 ${t('profile.premium', isRTL ? 'פרימיום' : 'Premium')}` 
                : t('profile.free', isRTL ? 'חינם' : 'Free Plan')}
            </Text>
          </View>
        </View>

        {/* Premium Upgrade CTA (if not premium) */}
        {!isPremium && (
          <TouchableOpacity
            style={[styles.upgradeCard, { backgroundColor: colors.brandOrange }]}
            onPress={() => router.push('/(app)/paywall')}
            activeOpacity={0.8}
          >
            <Text style={styles.upgradeEmoji}>💎</Text>
            <Text style={[styles.upgradeTitle, { color: colors.white }]}>
              {t('profile.upgradeToPremium', isRTL ? 'שדרג לפרימיום' : 'Upgrade to Premium')}
            </Text>
            <View style={styles.upgradeBenefits}>
              <Text style={[styles.upgradeBenefit, { color: colors.white }]}>
                ✓ {t('profile.benefit1', isRTL ? 'הודעות AI ללא הגבלה' : 'Unlimited AI messages')}
              </Text>
              <Text style={[styles.upgradeBenefit, { color: colors.white }]}>
                ✓ {t('profile.benefit2', isRTL ? 'יעדים בכל תחומי החיים' : 'Goals in all life areas')}
              </Text>
              <Text style={[styles.upgradeBenefit, { color: colors.white }]}>
                ✓ {t('profile.benefit3', isRTL ? 'ניתוחים מתקדמים' : 'Advanced analytics')}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.appearance', isRTL ? 'מראה' : 'APPEARANCE')}
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.bgCard }]}
            onPress={handleThemeChange}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.menuItemIcon}>
                {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '⚙️'}
              </Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.theme.title', isRTL ? 'עיצוב' : 'Theme')}
              </Text>
            </View>
            <View style={[styles.menuItemRight, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>{getThemeName()}</Text>
              <Text style={[styles.menuItemChevron, { color: colors.textTertiary }]}>
                {isRTL ? '←' : '→'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.language', isRTL ? 'שפה' : 'LANGUAGE')}
          </Text>
          <View style={[styles.languageCard, { backgroundColor: colors.bgCard }]}>
            <LanguageToggle />
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.notifications', isRTL ? 'התראות' : 'NOTIFICATIONS')}
          </Text>

          {/* Daily Reminders Switch */}
          <View style={[styles.menuItem, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.menuItemIcon}>🔔</Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.dailyReminders', isRTL ? 'תזכורות יומיות' : 'Daily Reminders')}
              </Text>
            </View>
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              trackColor={{ false: colors.divider, true: colors.brandOrange + '80' }}
              thumbColor={dailyReminders ? colors.brandOrange : colors.textTertiary}
              ios_backgroundColor={colors.divider}
            />
          </View>

          {/* Weekly Reminders Switch */}
          <View style={[styles.menuItem, { backgroundColor: colors.bgCard }]}>
            <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.menuItemIcon}>📅</Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.weeklyReminders', isRTL ? 'תזכורות שבועיות' : 'Weekly Reminders')}
              </Text>
            </View>
            <Switch
              value={weeklyReminders}
              onValueChange={setWeeklyReminders}
              trackColor={{ false: colors.divider, true: colors.brandOrange + '80' }}
              thumbColor={weeklyReminders ? colors.brandOrange : colors.textTertiary}
              ios_backgroundColor={colors.divider}
            />
          </View>
        </View>

        {/* Subscription Section */}
        {isPremium && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('profile.subscription', isRTL ? 'מנוי' : 'SUBSCRIPTION')}
            </Text>
            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.bgCard }]}
              onPress={handleManageSubscription}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.menuItemIcon}>💎</Text>
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                  {t('profile.manage', isRTL ? 'נהל מנוי' : 'Manage Subscription')}
                </Text>
              </View>
              <Text style={[styles.menuItemChevron, { color: colors.textTertiary }]}>
                {isRTL ? '←' : '→'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.about', isRTL ? 'אודות' : 'ABOUT')}
          </Text>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.bgCard }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.menuItemIcon}>📄</Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.privacy', isRTL ? 'מדיניות פרטיות' : 'Privacy Policy')}
              </Text>
            </View>
            <Text style={[styles.menuItemChevron, { color: colors.textTertiary }]}>
              {isRTL ? '←' : '→'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.bgCard }]}
            activeOpacity={0.7}
          >
            <View style={[styles.menuItemLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.menuItemIcon}>📜</Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.terms', isRTL ? 'תנאי שימוש' : 'Terms of Service')}
              </Text>
            </View>
            <Text style={[styles.menuItemChevron, { color: colors.textTertiary }]}>
              {isRTL ? '←' : '→'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin Link (if admin) */}
        {isAdmin && (
          <TouchableOpacity
            style={[styles.adminButton, { backgroundColor: colors.brandOrange + '20', borderColor: colors.brandOrange }]}
            onPress={() => router.push('/(app)/admin')}
            activeOpacity={0.7}
          >
            <Text style={[styles.adminButtonText, { color: colors.brandOrange }]}>
              🔧 {t('profile.adminPanel', isRTL ? 'לוח ניהול' : 'Admin Panel')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.signOutButton, { backgroundColor: colors.error + '20' }]}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            {t('profile.signOut', isRTL ? 'התנתק' : 'Sign Out')}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: Math.max(bottomInset, spacing.xl) + spacing.xxl,
  },
  userCard: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadowPresets.md,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    fontSize: fontSize.huge,
    fontWeight: fontWeight.bold,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
  },
  planBadge: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  planText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  upgradeCard: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xxl,
    borderRadius: radius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    ...shadowPresets.lg,
  },
  upgradeEmoji: {
    fontSize: componentSizes.iconSize.xxl,
    marginBottom: spacing.md,
  },
  upgradeTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  upgradeBenefits: {
    alignItems: 'flex-start',
  },
  upgradeBenefit: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    marginBottom: spacing.xs,
    opacity: 0.95,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  menuItem: {
    height: componentSizes.cardHeight.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    ...shadowPresets.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemIcon: {
    fontSize: componentSizes.iconSize.md,
    marginRight: spacing.md,
  },
  menuItemText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  menuItemValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    marginRight: spacing.sm,
  },
  menuItemChevron: {
    fontSize: fontSize.lg,
  },
  languageCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadowPresets.sm,
  },
  adminButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    height: componentSizes.cardHeight.sm,
    borderRadius: radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminButtonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  signOutButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    height: componentSizes.cardHeight.sm,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
});

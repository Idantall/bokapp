import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { useThemedColors } from '@/hooks/useThemedColors';
import { useTheme } from '@/contexts/ThemeContext';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LanguageToggle } from '@/components/LanguageToggle';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDirection } from '@/hooks/useDirection';
import { manageSubscription } from '@/lib/billing';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { user, isPremium, isAdmin, loading } = useCurrentUser();
  const { isRTL } = useDirection();
  const colors = useThemedColors();
  const { themeMode, setThemeMode } = useTheme();

  if (loading) {
    return <LoadingOverlay />;
  }

  const handleSignOut = async () => {
    Alert.alert(
      t('profile.signOut', 'Sign Out'),
      t('profile.signOutConfirm', 'Are you sure you want to sign out?'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('profile.signOut', 'Sign Out'),
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
      Alert.alert(t('error', 'Error'), t('profile.manageFailed', 'Could not open subscription management'));
    }
  };

  const getThemeName = () => {
    switch (themeMode) {
      case 'light': return t('profile.theme.light', 'Light');
      case 'dark': return t('profile.theme.dark', 'Dark');
      case 'system': return t('profile.theme.system', 'System');
    }
  };

  const handleThemeChange = () => {
    Alert.alert(
      t('profile.theme.title', 'Appearance'),
      t('profile.theme.description', 'Choose your preferred theme'),
      [
        {
          text: t('profile.theme.light', 'Light'),
          onPress: () => setThemeMode('light'),
        },
        {
          text: t('profile.theme.dark', 'Dark'),
          onPress: () => setThemeMode('dark'),
        },
        {
          text: t('profile.theme.system', 'System'),
          onPress: () => setThemeMode('system'),
        },
        { text: t('cancel', 'Cancel'), style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bgPrimary }]} edges={['top']}>
      <ScreenHeader
        title={t('profile.title', 'Profile')}
        subtitle={user?.email || ''}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>{user?.full_name?.charAt(0).toUpperCase() || '👤'}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || t('profile.anonymous', 'Anonymous')}</Text>
          <View style={[styles.planBadge, isPremium && styles.premiumBadge]}>
            <Text style={[styles.planText, isPremium && styles.premiumText]}>
              {isPremium ? '💎 ' : ''}{isPremium ? t('profile.premium', 'Premium') : t('profile.free', 'Free Plan')}
            </Text>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.appearance', 'Appearance')}
          </Text>
          <TouchableOpacity
            style={[styles.menuItem, { backgroundColor: colors.bgCard }, shadows.sm]}
            onPress={handleThemeChange}
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuItemIcon}>
                {themeMode === 'light' ? '☀️' : themeMode === 'dark' ? '🌙' : '⚙️'}
              </Text>
              <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                {t('profile.theme.title', 'Theme')}
              </Text>
            </View>
            <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>{getThemeName()}</Text>
          </TouchableOpacity>
        </View>

        {/* Language */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.language', 'Language')}
          </Text>
          <View style={styles.languageContainer}>
            <LanguageToggle />
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.subscription', 'Subscription')}
          </Text>
          {isPremium ? (
            <TouchableOpacity
              style={[styles.menuItem, shadows.sm]}
              onPress={handleManageSubscription}
            >
              <Text style={styles.menuItemText}>{t('profile.manage', 'Manage Subscription')}</Text>
              <Text style={styles.menuItemArrow}>{isRTL ? '←' : '→'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.upgradeButton, shadows.md]}
              onPress={() => router.push('/(app)/paywall')}
            >
              <Text style={styles.upgradeButtonText}>
                💎 {t('profile.upgradeToPremium', 'Upgrade to Premium')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.notifications', 'Notifications')}
          </Text>
          <TouchableOpacity style={[styles.menuItem, shadows.sm]}>
            <Text style={styles.menuItemText}>{t('profile.dailyReminders', 'Daily Reminders')}</Text>
            <Text style={styles.menuItemValue}>{t('on', 'On')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, shadows.sm]}>
            <Text style={styles.menuItemText}>{t('profile.weeklyReports', 'Weekly Reports')}</Text>
            <Text style={styles.menuItemValue}>{t('on', 'On')}</Text>
          </TouchableOpacity>
        </View>

        {/* Admin Panel */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('profile.admin', 'Admin')}
            </Text>
            <TouchableOpacity
              style={[styles.menuItem, shadows.sm]}
              onPress={() => router.push('/(app)/admin/dashboard')}
            >
              <Text style={styles.menuItemText}>{t('profile.adminPanel', 'Admin Panel')}</Text>
              <Text style={styles.menuItemArrow}>{isRTL ? '←' : '→'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
            {t('profile.about', 'About')}
          </Text>
          <TouchableOpacity style={[styles.menuItem, shadows.sm]}>
            <Text style={styles.menuItemText}>{t('profile.privacy', 'Privacy Policy')}</Text>
            <Text style={styles.menuItemArrow}>{isRTL ? '←' : '→'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, shadows.sm]}>
            <Text style={styles.menuItemText}>{t('profile.terms', 'Terms of Service')}</Text>
            <Text style={styles.menuItemArrow}>{isRTL ? '←' : '→'}</Text>
          </TouchableOpacity>
          <View style={[styles.menuItem, shadows.sm]}>
            <Text style={styles.menuItemText}>{t('profile.version', 'Version')}</Text>
            <Text style={styles.menuItemValue}>1.0.0</Text>
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={[styles.signOutButton, shadows.sm]}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>{t('profile.signOut', 'Sign Out')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    fontSize: 36,
    textAlign: 'center',
    lineHeight: 80,
    overflow: 'hidden',
  },
  name: {
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  planBadge: {
    alignSelf: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  premiumBadge: {
    // Will be styled dynamically
  },
  planText: {
    ...typography.caption,
    fontWeight: '600',
  },
  premiumText: {
    // Will be styled dynamically
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  languageContainer: {
    alignItems: 'center',
  },
  menuItem: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuItemIcon: {
    fontSize: 24,
  },
  menuItemText: {
    ...typography.body,
  },
  menuItemValue: {
    ...typography.body,
  },
  menuItemArrow: {
    ...typography.h3,
  },
  upgradeButton: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.button,
    alignItems: 'center',
  },
  upgradeButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
  signOutButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  signOutButtonText: {
    ...typography.body,
    fontWeight: '600',
  },
});


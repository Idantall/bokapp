import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { MetricCard } from '@/components/MetricCard';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Redirect } from 'expo-router';

export default function AdminDashboardScreen() {
  const { t } = useTranslation();
  const { isAdmin } = useCurrentUser();

  if (!isAdmin) {
    return <Redirect href="/(app)/(tabs)/home" />;
  }

  const handleSendBroadcast = () => {
    Alert.alert(
      t('admin.sendBroadcast', 'Send Broadcast'),
      t('admin.broadcastPrompt', 'This feature will send notifications to all users.'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('send', 'Send'),
          onPress: () => Alert.alert(t('success', 'Success'), t('admin.broadcastSent', 'Broadcast sent!')),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={t('admin.title', 'Admin Dashboard')}
        subtitle={t('admin.subtitle', 'App management')}
        showBack
      />

      <ScrollView style={styles.content}>
        {/* Key Metrics */}
        <View style={styles.statsGrid}>
          <MetricCard
            icon="👥"
            title={t('admin.totalUsers', 'Total Users')}
            value="245"
          />
          <MetricCard
            icon="💎"
            title={t('admin.premiumUsers', 'Premium')}
            value="48"
            subtitle="19.6%"
          />
          <MetricCard
            icon="🎯"
            title={t('admin.totalGoals', 'Total Goals')}
            value="1,234"
          />
          <MetricCard
            icon="😊"
            title={t('admin.avgMood', 'Avg Mood')}
            value="3.8"
            subtitle="/5.0"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.quickActions', 'Quick Actions')}</Text>

          <TouchableOpacity
            style={[styles.actionButton, shadows.md]}
            onPress={handleSendBroadcast}
          >
            <Text style={styles.actionButtonText}>
              📢 {t('admin.sendNotification', 'Send Broadcast Notification')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, shadows.md]}>
            <Text style={styles.actionButtonText}>
              📊 {t('admin.exportData', 'Export Analytics Data')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, shadows.md]}>
            <Text style={styles.actionButtonText}>
              ⚙️ {t('admin.systemSettings', 'System Settings')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('admin.recentActivity', 'Recent Activity')}</Text>
          <View style={[styles.activityCard, shadows.sm]}>
            <Text style={styles.activityText}>
              📈 {t('admin.activity1', '12 new users signed up today')}
            </Text>
          </View>
          <View style={[styles.activityCard, shadows.sm]}>
            <Text style={styles.activityText}>
              💎 {t('admin.activity2', '3 users upgraded to Premium')}
            </Text>
          </View>
          <View style={[styles.activityCard, shadows.sm]}>
            <Text style={styles.activityText}>
              🎯 {t('admin.activity3', '89 goals completed today')}
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
  sectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionButton: {
    backgroundColor: colors.bgCard,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  actionButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  activityCard: {
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  activityText: {
    ...typography.body,
    color: colors.textPrimary,
  },
});


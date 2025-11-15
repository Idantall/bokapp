import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';
import { ScreenHeader } from '@/components/ScreenHeader';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { EmptyState } from '@/components/EmptyState';
import { useLifeAreas } from '@/hooks/useLifeAreas';
import { useGoals } from '@/hooks/useGoals';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useDirection } from '@/hooks/useDirection';

export default function LifeAreaDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { lifeAreas, loading: areasLoading } = useLifeAreas();
  const { goals, createGoal, updateGoal, deleteGoal, loading: goalsLoading } = useGoals(id as string);
  const { isPremium } = useCurrentUser();

  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalDescription, setNewGoalDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const lifeArea = lifeAreas.find(area => area.id === id);

  if (areasLoading || goalsLoading) {
    return <LoadingOverlay />;
  }

  if (!lifeArea) {
    return (
      <View style={styles.container}>
        <EmptyState title={t('lifeArea.notFound', 'Life area not found')} />
      </View>
    );
  }

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert(t('error', 'Error'), t('goals.enterTitle', 'Please enter a goal title'));
      return;
    }

    setSaving(true);
    const { error, message } = await createGoal({
      life_area_id: id as string,
      title: newGoalTitle,
      description: newGoalDescription,
      target_date: null,
      is_completed: false,
    });
    setSaving(false);

    if (error === 'FREE_TIER_LIMIT') {
      // Show paywall
      Alert.alert(
        t('goals.limitReached', 'Free Tier Limit'),
        message || t('goals.upgradeMessage', 'Free users can only have goals in one life area. Upgrade to Premium!'),
        [
          { text: t('cancel', 'Cancel'), style: 'cancel' },
          { text: t('upgrade', 'Upgrade'), onPress: () => router.push('/(app)/paywall') },
        ]
      );
    } else if (error) {
      Alert.alert(t('error', 'Error'), error);
    } else {
      setNewGoalTitle('');
      setNewGoalDescription('');
      setShowAddGoal(false);
      Alert.alert(t('success', 'Success'), t('goals.created', 'Goal created successfully!'));
    }
  };

  const handleToggleGoal = async (goalId: string, isCompleted: boolean) => {
    await updateGoal(goalId, { is_completed: !isCompleted });
  };

  const handleDeleteGoal = (goalId: string) => {
    Alert.alert(
      t('goals.delete', 'Delete Goal'),
      t('goals.deleteConfirm', 'Are you sure you want to delete this goal?'),
      [
        { text: t('cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('delete', 'Delete'),
          style: 'destructive',
          onPress: () => deleteGoal(goalId),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={isRTL ? lifeArea.name_he : lifeArea.name_en}
        subtitle={t('lifeArea.manageGoals', 'Manage your goals')}
        showBack
      />

      <ScrollView style={styles.content}>
        {/* Area Info */}
        <View style={[styles.areaHeader, { backgroundColor: lifeArea.color_hex + '20' }]}>
          <Text style={styles.areaIcon}>{lifeArea.icon_emoji}</Text>
          <Text style={styles.areaDescription}>
            {isRTL ? lifeArea.description_he : lifeArea.description_en}
          </Text>
        </View>

        {/* Goals List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('goals.myGoals', 'My Goals')}</Text>
            <TouchableOpacity
              style={[styles.addButton, shadows.sm]}
              onPress={() => setShowAddGoal(true)}
            >
              <Text style={styles.addButtonText}>+ {t('goals.add', 'Add')}</Text>
            </TouchableOpacity>
          </View>

          {showAddGoal && (
            <View style={[styles.addGoalCard, shadows.md]}>
              <TextInput
                style={styles.input}
                placeholder={t('goals.titlePlaceholder', 'Goal title...')}
                placeholderTextColor={colors.textTertiary}
                value={newGoalTitle}
                onChangeText={setNewGoalTitle}
                autoFocus
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={t('goals.descriptionPlaceholder', 'Description (optional)...')}
                placeholderTextColor={colors.textTertiary}
                value={newGoalDescription}
                onChangeText={setNewGoalDescription}
                multiline
                numberOfLines={3}
              />
              <View style={styles.addGoalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddGoal(false);
                    setNewGoalTitle('');
                    setNewGoalDescription('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('cancel', 'Cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleAddGoal}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? t('saving', 'Saving...') : t('save', 'Save')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {goals.length === 0 ? (
            <EmptyState
              icon="🎯"
              title={t('goals.noGoals', 'No goals yet')}
              description={t('goals.addFirst', 'Add your first goal to get started')}
            />
          ) : (
            goals.map((goal) => (
              <View key={goal.id} style={[styles.goalCard, shadows.sm]}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => handleToggleGoal(goal.id, goal.is_completed)}
                >
                  <View style={[styles.checkboxBox, goal.is_completed && styles.checkboxChecked]}>
                    {goal.is_completed && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                </TouchableOpacity>

                <View style={styles.goalContent}>
                  <Text style={[styles.goalTitle, goal.is_completed && styles.goalTitleCompleted]}>
                    {goal.title}
                  </Text>
                  {goal.description && (
                    <Text style={styles.goalDescription}>{goal.description}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(goal.id)}
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
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
  areaHeader: {
    margin: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  areaIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  areaDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  addButton: {
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.button,
  },
  addButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  addGoalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  input: {
    backgroundColor: colors.bgPrimary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addGoalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  cancelButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    backgroundColor: colors.brandOrange,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.white,
  },
  goalCard: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.divider,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.brandOrange,
    borderColor: colors.brandOrange,
  },
  checkmark: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  goalTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  goalDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
  },
  deleteButtonText: {
    fontSize: 20,
  },
});


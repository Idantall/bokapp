import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing } from '@/lib/theme';
import { useDirection } from '@/hooks/useDirection';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack, rightAction }: ScreenHeaderProps) {
  const router = useRouter();
  const { isRTL } = useDirection();

  return (
    <View style={styles.container}>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>{isRTL ? '→' : '←'}</Text>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  row: {
    alignItems: 'center',
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
  },
  backText: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  rightAction: {
    marginLeft: spacing.md,
  },
});


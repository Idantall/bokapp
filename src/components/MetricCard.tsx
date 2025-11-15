import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '@/lib/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: string;
  icon?: string;
}

export function MetricCard({ title, value, subtitle, color = colors.brandOrange, icon }: MetricCardProps) {
  return (
    <View style={[styles.container, shadows.md]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    minWidth: 120,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  value: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});


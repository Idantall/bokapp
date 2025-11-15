import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useDirection } from '@/hooks/useDirection';
import { useThemedColors } from '@/hooks/useThemedColors';
import { spacing, fontSize, fontWeight, radius, shadowPresets } from '@/lib/designSystem';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

/**
 * Enhanced ScreenHeader with proper safe area handling
 * - Respects iPhone notch/Dynamic Island
 * - Responsive padding and typography
 * - RTL support
 */
export function ScreenHeader({ 
  title, 
  subtitle, 
  showBack, 
  rightAction,
  transparent = false 
}: ScreenHeaderProps) {
  const router = useRouter();
  const { isRTL } = useDirection();
  const colors = useThemedColors();
  const insets = useSafeAreaInsets();

  const styles = useMemo(() => createStyles(colors, insets.top, transparent), [colors, insets.top, transparent]);

  return (
    <View style={styles.container}>
      <View style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {showBack && (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backText, { color: colors.textPrimary }]}>
              {isRTL ? '→' : '←'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
    </View>
  );
}

const createStyles = (colors: any, topInset: number, transparent: boolean) => StyleSheet.create({
  container: {
    backgroundColor: transparent ? 'transparent' : colors.bgCard,
    paddingTop: Math.max(topInset, spacing.lg) + spacing.md, // Safe area + extra padding
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    ...(!transparent && {
      borderBottomWidth: 1,
      borderBottomColor: colors.divider,
      ...shadowPresets.sm,
    }),
  },
  row: {
    alignItems: 'center',
    minHeight: 44, // Minimum touch target
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.semibold,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.xxl * 1.3,
    marginBottom: spacing.xxs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.regular,
    lineHeight: fontSize.md * 1.4,
    opacity: 0.8,
  },
  rightAction: {
    marginLeft: spacing.md,
  },
});


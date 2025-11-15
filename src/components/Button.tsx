import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { colors, typography, spacing, shadows } from '@/lib/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  fullWidth = true,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled || loading) return;

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Get button styles based on variant
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.baseContainer,
      ...(fullWidth && { width: '100%' }),
      ...(size === 'small' && styles.smallContainer),
      ...(size === 'medium' && styles.mediumContainer),
      ...(size === 'large' && styles.largeContainer),
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primaryContainer };
      case 'secondary':
        return { ...baseStyle, ...styles.secondaryContainer };
      case 'outline':
        return { ...baseStyle, ...styles.outlineContainer };
      case 'ghost':
        return { ...baseStyle, ...styles.ghostContainer };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      ...styles.baseText,
      ...(size === 'small' && styles.smallText),
      ...(size === 'medium' && styles.mediumText),
      ...(size === 'large' && styles.largeText),
    };

    switch (variant) {
      case 'primary':
        return { ...baseTextStyle, ...styles.primaryText };
      case 'secondary':
        return { ...baseTextStyle, ...styles.secondaryText };
      case 'outline':
        return { ...baseTextStyle, ...styles.outlineText };
      case 'ghost':
        return { ...baseTextStyle, ...styles.ghostText };
      default:
        return baseTextStyle;
    }
  };

  const containerStyle = getContainerStyle();
  const btnTextStyle = getTextStyle();

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          containerStyle,
          disabled && styles.disabled,
          style,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? colors.white : colors.brandOrange}
            size={size === 'small' ? 'small' : 'large'}
          />
        ) : (
          <>
            {icon && <>{icon}</>}
            <Text style={[btnTextStyle, textStyle]}>{title}</Text>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // Base Styles
  baseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
  },
  baseText: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Size Variants
  smallContainer: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    minHeight: 40,
  },
  mediumContainer: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 14,
    minHeight: 48,
  },
  largeContainer: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: 16,
    minHeight: 56,
  },

  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Primary Variant
  primaryContainer: {
    backgroundColor: colors.brandOrange,
    ...shadows.lg,
    shadowColor: colors.brandOrange,
  },
  primaryText: {
    color: colors.white,
  },

  // Secondary Variant
  secondaryContainer: {
    backgroundColor: colors.bgCard,
    ...shadows.md,
  },
  secondaryText: {
    color: colors.brandOrange,
  },

  // Outline Variant
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.brandOrange,
  },
  outlineText: {
    color: colors.brandOrange,
  },

  // Ghost Variant
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.textPrimary,
  },

  // Disabled State
  disabled: {
    opacity: 0.5,
  },
});


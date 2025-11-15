import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, typography, spacing } from '@/lib/theme';

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  socialProof?: string;
}

export function LoadingScreen({
  title = 'Please hold...',
  subtitle = "I'm analyzing your answers and crafting your mental fitness baseline...",
  socialProof = 'Over 2.5 million people have used UP! to get to where they want to be.',
}: LoadingScreenProps) {
  const rotateValue = useRef(new Animated.Value(0)).current;
  const pulseValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseValue, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotation = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Animated loading circle */}
        <Animated.View
          style={[
            styles.loaderContainer,
            {
              transform: [{ rotate: rotation }, { scale: pulseValue }],
            },
          ]}
        >
          <Svg width={120} height={120}>
            <Defs>
              <LinearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#FFB84D" stopOpacity="1" />
                <Stop offset="100%" stopColor="#FFA726" stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Circle
              cx="60"
              cy="60"
              r="50"
              fill="url(#loaderGradient)"
            />
            <Circle
              cx="60"
              cy="60"
              r="40"
              fill={colors.bgPrimary}
            />
          </Svg>
          <Text style={styles.emoji}>😊</Text>
        </Animated.View>

        {/* Text content */}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Social proof */}
      <View style={styles.footer}>
        <View style={styles.socialProofContainer}>
          <Text style={styles.bulbEmoji}>💡</Text>
          <Text style={styles.socialProofText}>{socialProof}</Text>
        </View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  loaderContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  emoji: {
    position: 'absolute',
    fontSize: 40,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  socialProofContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: 12,
    gap: spacing.md,
  },
  bulbEmoji: {
    fontSize: 32,
  },
  socialProofText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
});


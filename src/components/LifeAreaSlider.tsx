import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { GradientIcon } from './GradientIcon';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

interface LifeAreaSliderProps {
  title: string;
  subtitle?: string;
  icon: string;
  gradientStart: string;
  gradientEnd: string;
  value: number;
  onValueChange: (value: number) => void;
  minLabel?: string;
  maxLabel?: string;
}

export function LifeAreaSlider({
  title,
  subtitle,
  icon,
  gradientStart,
  gradientEnd,
  value,
  onValueChange,
  minLabel = 'Not satisfied',
  maxLabel = 'Very satisfied',
}: LifeAreaSliderProps) {
  const [sliderValue, setSliderValue] = useState(value);

  const handleValueChange = (newValue: number) => {
    setSliderValue(newValue);
  };

  const handleSlidingComplete = (newValue: number) => {
    onValueChange(newValue);
  };

  return (
    <View style={styles.container}>
      {/* Header with gradient icon */}
      <View style={styles.header}>
        <GradientIcon
          emoji={icon}
          size={120}
          gradientStart={gradientStart}
          gradientEnd={gradientEnd}
        />
      </View>

      {/* Title and subtitle */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <Slider
            style={styles.slider}
            value={sliderValue}
            onValueChange={handleValueChange}
            onSlidingComplete={handleSlidingComplete}
            minimumValue={0}
            maximumValue={10}
            step={1}
            minimumTrackTintColor={gradientEnd}
            maximumTrackTintColor={colors.divider}
            thumbTintColor={colors.white}
          />
        </View>

        {/* Labels */}
        <View style={styles.labelsContainer}>
          <Text style={styles.labelText}>{minLabel}</Text>
          <Text style={styles.labelTextCenter}>{Math.round(sliderValue)}/10</Text>
          <Text style={styles.labelText}>{maxLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 24,
  },
  sliderContainer: {
    paddingHorizontal: spacing.lg,
  },
  sliderTrack: {
    backgroundColor: colors.bgCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.md,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  labelTextCenter: {
    ...typography.h3,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
  },
});


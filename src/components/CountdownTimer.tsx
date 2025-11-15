import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/lib/theme';

interface CountdownTimerProps {
  expiryDate?: Date;
  title?: string;
}

export function CountdownTimer({ 
  expiryDate = new Date(Date.now() + 26 * 60 * 60 * 1000), // Default: 26 hours from now
  title = 'Offer expires in'
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = expiryDate.getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      hours: Math.floor(difference / (1000 * 60 * 60)),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, '0');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.timerContainer}>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{formatNumber(timeLeft.hours)}</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{formatNumber(timeLeft.minutes)}</Text>
        </View>
        <Text style={styles.separator}>:</Text>
        <View style={styles.timeBlock}>
          <Text style={styles.timeNumber}>{formatNumber(timeLeft.seconds)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FF4757',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  title: {
    ...typography.body,
    color: colors.white,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  timeBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  timeNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
  },
  separator: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.white,
    marginHorizontal: spacing.xs,
  },
});


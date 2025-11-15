import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';

interface GradientIconProps {
  emoji: string;
  size?: number;
  gradientStart: string;
  gradientEnd: string;
}

export function GradientIcon({
  emoji,
  size = 120,
  gradientStart,
  gradientEnd,
}: GradientIconProps) {
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={gradientStart} stopOpacity="1" />
            <Stop offset="100%" stopColor={gradientEnd} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2}
          fill={`url(#${gradientId})`}
        />
      </Svg>
      <View style={styles.emojiContainer}>
        <SvgText
          x={size / 2}
          y={size / 2 + size * 0.15}
          fontSize={size * 0.5}
          textAnchor="middle"
          fill="white"
        >
          {emoji}
        </SvgText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});


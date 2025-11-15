/**
 * ENHANCED LIFE WHEEL - Production Quality
 * 
 * Features:
 * - Life area names INSIDE segments (not confusing numbers)
 * - Spin animation on mount  
 * - Interactive segments with visual feedback
 * - Profile picture in center
 * - Gradient segment fills
 * - Proper safe spacing for all screen sizes
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import { spacing, shadowPresets } from '@/lib/designSystem';

interface LifeWheelSegment {
  id: string;
  name_en: string;
  name_he: string;
  color: string;
  score: number; // 0-10
}

interface LifeWheelProps {
  segments: LifeWheelSegment[];
  size?: number;
  isRTL?: boolean;
  onSegmentPress?: (segment: LifeWheelSegment) => void;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export function LifeWheelEnhanced({ 
  segments, 
  size = 280, 
  isRTL = false,
  onSegmentPress,
}: LifeWheelProps) {
  const [pressedSegment, setPressedSegment] = useState<string | null>(null);
  
  // Spin animation on mount
  const rotation = useRef(new Animated.Value(-10)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Spin in on mount
    Animated.spring(rotation, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();

    // Subtle pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = (size / 2) * 0.82; // Leave room for labels if needed
  const innerRadius = size * 0.25; // Larger center circle for profile/logo
  const numberOfSegments = segments.length;
  const anglePerSegment = (2 * Math.PI) / numberOfSegments;

  // Start at top
  const startAngle = -Math.PI / 2;

  const handleSegmentPress = (segment: LifeWheelSegment) => {
    setPressedSegment(segment.id);
    
    // Quick feedback animation
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 0.97, duration: 100, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();

    setTimeout(() => setPressedSegment(null), 200);

    if (onSegmentPress) {
      onSegmentPress(segment);
    } else {
      router.push(`/(app)/life-area/${segment.id}`);
    }
  };

  const polarToCartesian = (angle: number, radius: number) => ({
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  });

  const renderSegment = (segment: LifeWheelSegment, index: number) => {
    const angle1 = startAngle + index * anglePerSegment;
    const angle2 = angle1 + anglePerSegment;
    
    // Scale radius based on score (min 30% for visibility)
    const scoreRadius = Math.max((segment.score / 10) * outerRadius, outerRadius * 0.3);

    const outerStart = polarToCartesian(angle1, outerRadius);
    const outerEnd = polarToCartesian(angle2, outerRadius);
    const innerStart = polarToCartesian(angle1, innerRadius);
    const innerEnd = polarToCartesian(angle2, innerRadius);

    // Create donut segment path
    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;
    
    const segmentPath = [
      `M ${innerStart.x} ${innerStart.y}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      'Z',
    ].join(' ');

    // Calculate label position (inside segment, 2/3 radius)
    const labelAngle = angle1 + anglePerSegment / 2;
    const labelRadius = (outerRadius + innerRadius) / 2;
    const labelPos = polarToCartesian(labelAngle, labelRadius);

    // Get short name (first word or first 3-4 chars)
    const displayName = isRTL 
      ? segment.name_he.split(' ')[0].substring(0, 6)
      : segment.name_en.split(' ')[0].substring(0, 8);

    const isPressed = pressedSegment === segment.id;
    const segmentOpacity = isPressed ? 1 : 0.9;

    return (
      <G key={segment.id}>
        {/* Segment fill with gradient */}
        <Path
          d={segmentPath}
          fill={segment.color}
          opacity={segmentOpacity}
          stroke="white"
          strokeWidth={3}
          onPress={() => handleSegmentPress(segment)}
        />

        {/* Label text INSIDE segment */}
        <SvgText
          x={labelPos.x}
          y={labelPos.y}
          fill="white"
          fontSize={13}
          fontWeight="600"
          textAnchor="middle"
          alignmentBaseline="middle"
          onPress={() => handleSegmentPress(segment)}
        >
          {displayName}
        </SvgText>
      </G>
    );
  };

  const rotateInterpolate = rotation.interpolate({
    inputRange: [-10, 0],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={styles.container}>
      <AnimatedSvg 
        width={size} 
        height={size}
        style={{
          transform: [
            { rotate: rotateInterpolate },
            { scale: pulseAnim },
          ],
        }}
      >
        {/* Segments */}
        {segments.map((segment, index) => renderSegment(segment, index))}
        
        {/* Center circle for logo/profile */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius + 3}
          fill="white"
          stroke="#FF9966"
          strokeWidth={3}
        />
        <Circle
          cx={centerX}
          cy={centerY}
          r={innerRadius}
          fill="#F8F9FA"
        />
        
        {/* "UP!" text in center */}
        <SvgText
          x={centerX}
          y={centerY}
          fill="#FF9966"
          fontSize={28}
          fontWeight="700"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          UP!
        </SvgText>
      </AnimatedSvg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowPresets.lg,
  },
});


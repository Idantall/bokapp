import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, Defs, ClipPath } from 'react-native-svg';
import { colors } from '@/lib/theme';
import { router } from 'expo-router';

interface LifeWheelSegment {
  id: string;
  name_en: string;
  name_he: string;
  color: string;
  icon: string;
  score: number; // 0-10
}

interface LifeWheelProps {
  segments: LifeWheelSegment[];
  size?: number;
  isRTL?: boolean;
  userImageUrl?: string;
  onSegmentPress?: (segment: LifeWheelSegment) => void;
  showInteractive?: boolean;
}

export function LifeWheel({ 
  segments, 
  size = 300, 
  isRTL = false,
  userImageUrl,
  onSegmentPress,
  showInteractive = true
}: LifeWheelProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size / 2) * 0.85; // Leave more room for labels
  const centerCircleRadius = size * 0.15; // Larger center for profile pic
  const numberOfSegments = segments.length;
  const anglePerSegment = (2 * Math.PI) / numberOfSegments;

  // Starting angle - top of circle
  const startAngle = -Math.PI / 2;

  const handleSegmentPress = (segment: LifeWheelSegment) => {
    if (!showInteractive) return;

    // Animate press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setSelectedSegment(segment.id);
    
    if (onSegmentPress) {
      onSegmentPress(segment);
    } else {
      // Default: navigate to life area detail
      router.push(`/(app)/life-area/${segment.id}`);
    }

    // Clear selection after animation
    setTimeout(() => setSelectedSegment(null), 300);
  };

  const renderSegment = (segment: LifeWheelSegment, index: number) => {
    const angle1 = startAngle + index * anglePerSegment;
    const angle2 = angle1 + anglePerSegment;

    // Calculate the radius based on score (0-10 scale)
    const radius = Math.max((segment.score / 10) * maxRadius, maxRadius * 0.2); // Min 20% visibility

    // Convert polar to cartesian coordinates
    const x1 = centerX + radius * Math.cos(angle1);
    const y1 = centerY + radius * Math.sin(angle1);
    const x2 = centerX + radius * Math.cos(angle2);
    const y2 = centerY + radius * Math.sin(angle2);

    // Create path for the segment
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    // Calculate label position (outside the wheel)
    const labelAngle = angle1 + anglePerSegment / 2;
    const labelRadius = maxRadius + 30;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    // Determine if this segment is selected
    const isSelected = selectedSegment === segment.id;
    const segmentOpacity = isSelected ? 0.95 : 0.8;

    return (
      <React.Fragment key={segment.id}>
        {/* Touchable segment */}
        <Path
          d={pathData}
          fill={segment.color}
          opacity={segmentOpacity}
          stroke={colors.white}
          strokeWidth={3}
        />

        {/* Score label */}
        <SvgText
          x={labelX}
          y={labelY}
          fill={colors.textPrimary}
          fontSize="16"
          fontWeight="bold"
          textAnchor="middle"
        >
          {segment.score}
        </SvgText>
      </React.Fragment>
    );
  };

  const renderGuideCircles = () => {
    const circles = [];
    for (let i = 2; i <= 10; i += 2) {
      const radius = (i / 10) * maxRadius;
      circles.push(
        <Circle
          key={i}
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke={colors.divider}
          strokeWidth={1}
          opacity={0.2}
          strokeDasharray="4,4"
        />
      );
    }
    return circles;
  };

  const renderGuideLines = () => {
    const lines = [];
    for (let i = 0; i < numberOfSegments; i++) {
      const angle = startAngle + i * anglePerSegment;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);
      
      lines.push(
        <Path
          key={i}
          d={`M ${centerX} ${centerY} L ${x} ${y}`}
          stroke={colors.white}
          strokeWidth={2}
          opacity={0.8}
        />
      );
    }
    return lines;
  };

  // Create touchable areas for each segment
  const renderTouchableSegments = () => {
    return segments.map((segment, index) => {
      const angle1 = startAngle + index * anglePerSegment;
      const angle2 = angle1 + anglePerSegment;
      const radius = maxRadius;

      const x1 = centerX + radius * Math.cos(angle1);
      const y1 = centerY + radius * Math.sin(angle1);
      const x2 = centerX + radius * Math.cos(angle2);
      const y2 = centerY + radius * Math.sin(angle2);

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      return (
        <Path
          key={`touch-${segment.id}`}
          d={pathData}
          fill="transparent"
          onPress={() => handleSegmentPress(segment)}
        />
      );
    });
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Svg width={size} height={size}>
        {/* Guide circles (subtle grid) */}
        {renderGuideCircles()}
        
        {/* Guide lines (segment dividers) */}
        {renderGuideLines()}
        
        {/* Colored segments */}
        {segments.map((segment, index) => renderSegment(segment, index))}
        
        {/* Touchable overlay segments */}
        {showInteractive && renderTouchableSegments()}
        
        {/* Center circle background */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={centerCircleRadius + 4}
          fill={colors.white}
          stroke={colors.brandOrange}
          strokeWidth={4}
        />
        
        {/* Center circle for profile image */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={centerCircleRadius}
          fill={colors.bgPrimary}
        />
      </Svg>

      {/* User profile image in center */}
      {userImageUrl ? (
        <View style={[
          styles.centerImage,
          {
            width: centerCircleRadius * 2,
            height: centerCircleRadius * 2,
            borderRadius: centerCircleRadius,
            top: centerY - centerCircleRadius,
            left: centerX - centerCircleRadius,
          }
        ]}>
          <Image
            source={{ uri: userImageUrl }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>
      ) : (
        <View style={[
          styles.centerPlaceholder,
          {
            width: centerCircleRadius * 2,
            height: centerCircleRadius * 2,
            borderRadius: centerCircleRadius,
            top: centerY - centerCircleRadius,
            left: centerX - centerCircleRadius,
          }
        ]}>
          <SvgText
            x={centerX}
            y={centerY + 5}
            fill={colors.textSecondary}
            fontSize="32"
            fontWeight="bold"
            textAnchor="middle"
          >
            UP!
          </SvgText>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerImage: {
    position: 'absolute',
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  centerPlaceholder: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});

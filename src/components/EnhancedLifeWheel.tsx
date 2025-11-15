import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Image, Text as RNText } from 'react-native';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { colors } from '@/lib/theme';
import { router } from 'expo-router';

interface LifeWheelSegment {
  id: string;
  name_en: string;
  name_he: string;
  icon: string;
  score: number; // 0-10
}

interface EnhancedLifeWheelProps {
  segments: LifeWheelSegment[];
  size?: number;
  isRTL?: boolean;
  userImageUrl?: string;
  onSegmentPress?: (segment: LifeWheelSegment) => void;
  showInteractive?: boolean;
}

// Map segment IDs to gradient colors
const segmentColors: Record<string, { start: string; end: string; solid: string }> = {
  health: colors.health,
  family: colors.family,
  career: colors.career,
  relationships: colors.relationships,
  finances: colors.finances,
  freeTime: colors.freeTime,
  environment: colors.environment,
  meaning: colors.meaning,
};

// Map segment IDs to icons
const segmentIcons: Record<string, string> = {
  health: '❤️',
  family: '👨‍👩‍👧‍👦',
  career: '💼',
  relationships: '💑',
  finances: '💰',
  freeTime: '🎨',
  environment: '🌍',
  meaning: '🧩',
};

export function EnhancedLifeWheel({ 
  segments, 
  size = 340, 
  isRTL = false,
  userImageUrl,
  onSegmentPress,
  showInteractive = true
}: EnhancedLifeWheelProps) {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);
  const [scaleAnim] = useState(new Animated.Value(1));

  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size / 2) * 0.75;
  const centerCircleRadius = size * 0.15;
  const iconRadius = maxRadius + 35;
  const numberOfSegments = segments.length;
  const anglePerSegment = (2 * Math.PI) / numberOfSegments;
  const startAngle = -Math.PI / 2;

  const handleSegmentPress = (segment: LifeWheelSegment) => {
    if (!showInteractive) return;

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
      router.push(`/(app)/life-area/${segment.id}`);
    }

    setTimeout(() => setSelectedSegment(null), 300);
  };

  const renderSegment = (segment: LifeWheelSegment, index: number) => {
    const angle1 = startAngle + index * anglePerSegment;
    const angle2 = angle1 + anglePerSegment;

    const radius = Math.max((segment.score / 10) * maxRadius, maxRadius * 0.15);

    const x1 = centerX + radius * Math.cos(angle1);
    const y1 = centerY + radius * Math.sin(angle1);
    const x2 = centerX + radius * Math.cos(angle2);
    const y2 = centerY + radius * Math.sin(angle2);

    const largeArcFlag = anglePerSegment > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    const gradientId = `gradient-${segment.id}`;
    const colorScheme = segmentColors[segment.id] || colors.health;
    const isSelected = selectedSegment === segment.id;

    return (
      <React.Fragment key={segment.id}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colorScheme.start} stopOpacity={isSelected ? "1" : "0.9"} />
            <Stop offset="100%" stopColor={colorScheme.end} stopOpacity={isSelected ? "1" : "0.9"} />
          </LinearGradient>
        </Defs>
        <Path
          d={pathData}
          fill={`url(#${gradientId})`}
          stroke={colors.bgPrimary}
          strokeWidth={4}
          onPress={() => handleSegmentPress(segment)}
        />
      </React.Fragment>
    );
  };

  const renderIcons = () => {
    return segments.map((segment, index) => {
      const angle = startAngle + index * anglePerSegment + anglePerSegment / 2;
      const x = centerX + iconRadius * Math.cos(angle);
      const y = centerY + iconRadius * Math.sin(angle);
      const icon = segmentIcons[segment.id] || '•';

      return (
        <View
          key={`icon-${segment.id}`}
          style={[
            styles.iconContainer,
            {
              position: 'absolute',
              left: x - 20,
              top: y - 20,
            },
          ]}
        >
          <RNText style={styles.iconText}>{icon}</RNText>
        </View>
      );
    });
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
          opacity={0.15}
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
          stroke={colors.bgPrimary}
          strokeWidth={3}
          opacity={1}
        />
      );
    }
    return lines;
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.wheelContainer}>
        <Svg width={size} height={size}>
          <G>
            {renderGuideCircles()}
            {segments.map((segment, index) => renderSegment(segment, index))}
            {renderGuideLines()}

            {/* Center circle background */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={centerCircleRadius + 4}
              fill={colors.bgPrimary}
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={centerCircleRadius}
              fill={colors.bgCard}
            />
          </G>
        </Svg>

        {/* Icons positioned around the wheel */}
        {renderIcons()}

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
            <RNText style={styles.centerText}>UP!</RNText>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    position: 'relative',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.divider,
  },
  iconText: {
    fontSize: 24,
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
    backgroundColor: colors.bgCard,
  },
  centerText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.brandOrange,
  },
});


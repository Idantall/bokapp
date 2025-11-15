import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import { colors } from '@/lib/theme';

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
}

export function LifeWheel({ segments, size = 300, isRTL = false }: LifeWheelProps) {
  const centerX = size / 2;
  const centerY = size / 2;
  const maxRadius = (size / 2) * 0.9;
  const numberOfSegments = segments.length;
  const anglePerSegment = (2 * Math.PI) / numberOfSegments;

  // Starting angle - adjust for RTL
  const startAngle = isRTL ? -Math.PI / 2 : -Math.PI / 2;

  const renderSegment = (segment: LifeWheelSegment, index: number) => {
    const angle1 = startAngle + index * anglePerSegment;
    const angle2 = angle1 + anglePerSegment;

    // Calculate the radius based on score (0-10 scale)
    const radius = (segment.score / 10) * maxRadius;

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
    const labelRadius = maxRadius + 20;
    const labelX = centerX + labelRadius * Math.cos(labelAngle);
    const labelY = centerY + labelRadius * Math.sin(labelAngle);

    return (
      <React.Fragment key={segment.id}>
        {/* Segment fill */}
        <Path
          d={pathData}
          fill={segment.color}
          opacity={0.7}
          stroke={colors.bgCard}
          strokeWidth={2}
        />

        {/* Label */}
        <SvgText
          x={labelX}
          y={labelY}
          fill={colors.textPrimary}
          fontSize="12"
          fontWeight="500"
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
          opacity={0.3}
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
          stroke={colors.divider}
          strokeWidth={1}
          opacity={0.3}
        />
      );
    }
    return lines;
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Guide circles */}
        {renderGuideCircles()}
        
        {/* Guide lines */}
        {renderGuideLines()}
        
        {/* Segments */}
        {segments.map((segment, index) => renderSegment(segment, index))}
        
        {/* Center point */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={5}
          fill={colors.brandOrange}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});


import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '@/lib/theme';

interface TestimonialCardProps {
  text: string;
  author?: string;
  rating?: number;
}

export function TestimonialCard({ text, author, rating = 5 }: TestimonialCardProps) {
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[...Array(rating)].map((_, i) => (
          <Text key={i} style={styles.star}>⭐</Text>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderStars()}
      <Text style={styles.text}>{text}</Text>
      {author && <Text style={styles.author}>— {author}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.divider,
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
    gap: 2,
  },
  star: {
    fontSize: 18,
  },
  text: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  author: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});


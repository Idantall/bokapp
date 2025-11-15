/**
 * UP! Wellness Design System
 * Consistent spacing, typography, and layout constants
 * for Remente-level quality UI
 */

// Spacing scale (no more magic numbers!)
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

// Border radius scale
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  full: 9999,
} as const;

// Typography scale
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
} as const;

export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Component sizes
export const componentSizes = {
  // Cards and buttons
  cardHeight: {
    sm: 80,
    md: 100,
    lg: 120,
  },
  // Icons
  iconSize: {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },
  // Safe area defaults
  safeArea: {
    top: 16,
    bottom: 16,
    horizontal: 20,
  },
} as const;

// Grid layout helpers
export const grid = {
  // For 2-column layouts
  twoColumn: (gap: number = spacing.md) => ({
    width: `48%` as any, // Each column is ~48% to account for gap
  }),
  // For responsive grids
  columns: (count: number, gap: number = spacing.md) => {
    const gapTotal = gap * (count - 1);
    const width = `${(100 / count)}%`;
    return { width, marginRight: gap };
  },
} as const;

// Animation durations
export const duration = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

// Shadow presets (iOS-style)
export const shadowPresets = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Layout helpers
export const layout = {
  screenPadding: spacing.xl,
  sectionSpacing: spacing.xxl,
  cardSpacing: spacing.md,
} as const;


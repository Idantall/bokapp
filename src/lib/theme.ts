// UP! Design System - Inspired by Best Wellness Apps

export const colors = {
  // Brand gradients (vibrant and energetic)
  brandOrange: '#FF9966',
  brandPink: '#F76E90',
  brandPurple: '#5B7CFF',
  brandGold: '#FFB84D',
  
  // Background (dark mode for premium feel)
  bgPrimary: '#1A1A1A',
  bgSecondary: '#2D2D2D',
  bgCard: '#242424',
  
  // Text (optimized for dark mode)
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  
  // UI
  divider: '#3D3D3D',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  
  // Life Area Gradients (vibrant and distinct)
  health: {
    start: '#FF6B6B',
    end: '#FF4757',
    solid: '#FF5757',
  },
  family: {
    start: '#FFB84D',
    end: '#FFA726',
    solid: '#FFB84D',
  },
  career: {
    start: '#FFE66D',
    end: '#FFD93D',
    solid: '#FFE66D',
  },
  relationships: {
    start: '#FF6B9D',
    end: '#FF1744',
    solid: '#FF4581',
  },
  finances: {
    start: '#10B981',
    end: '#059669',
    solid: '#10B981',
  },
  freeTime: {
    start: '#A78BFA',
    end: '#8B5CF6',
    solid: '#9F7AEA',
  },
  environment: {
    start: '#60D394',
    end: '#3DD68C',
    solid: '#4ADE94',
  },
  meaning: {
    start: '#FF8C42',
    end: '#FF7315',
    solid: '#FF8030',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  button: 24,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
  },
  button: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

export const shadows = {
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
};


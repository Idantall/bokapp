// Wellness Wheel Design System

export const colors = {
  // Brand gradient
  brandOrange: '#FF9966',
  brandPink: '#F76E90',
  brandPurple: '#5B7CFF',
  
  // Background
  bgPrimary: '#F6F7FB',
  bgCard: '#FFFFFF',
  
  // Text
  textPrimary: '#1F2933',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // UI
  divider: '#E5E7EB',
  success: '#22C55E',
  warning: '#F97316',
  error: '#EF4444',
  white: '#FFFFFF',
  
  // Life Areas
  health: '#22C55E',
  family: '#F59E0B',
  career: '#3B82F6',
  relationships: '#EC4899',
  finances: '#10B981',
  freeTime: '#8B5CF6',
  environment: '#06B6D4',
  meaning: '#F97316',
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
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '600' as const,
  },
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '600' as const,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
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


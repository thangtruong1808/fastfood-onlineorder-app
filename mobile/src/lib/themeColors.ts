/**
 * Southern Cross Burgers (Melbourne) — Design System Palette Constants
 * Mirrors global.css tokens for React Native inline styles, SVG charts, Icons, and StatusBar
 */

export const THEME_PALETTE = {
  light: {
    bgPrimary: '#FAF6F0',
    bgSurface: '#FFFFFF',
    bgElevated: '#F3EDE2',
    bgMuted: '#EBE3D5',
    textPrimary: '#1C1613',
    textSecondary: '#5C5149',
    textMuted: '#8A7C71',
    borderSubtle: '#E6DDD0',
    borderStrong: '#D0C3B0',
    brandPrimary: '#D9381E',
    brandPrimaryHover: '#B82B14',
    brandSecondary: '#D97706',
    brandAccent: '#F59E0B',
    brandDark: '#1F1714',
    statusSuccess: '#15803D',
    statusWarning: '#B45309',
    statusDanger: '#B91C1C',
    statusInfo: '#1D4ED8',
  },
  dark: {
    bgPrimary: '#120E0C',
    bgSurface: '#1C1613',
    bgElevated: '#271F1B',
    bgMuted: '#332924',
    textPrimary: '#FAF5EF',
    textSecondary: '#C9BDB2',
    textMuted: '#8F8074',
    borderSubtle: '#2E2520',
    borderStrong: '#463830',
    brandPrimary: '#EF4444',
    brandPrimaryHover: '#DC2626',
    brandSecondary: '#F59E0B',
    brandAccent: '#FBBF24',
    brandDark: '#0C0908',
    statusSuccess: '#22C55E',
    statusWarning: '#F59E0B',
    statusDanger: '#F87171',
    statusInfo: '#60A5FA',
  },
} as const;

export type ThemePalette = (typeof THEME_PALETTE)['light'] | (typeof THEME_PALETTE)['dark'];


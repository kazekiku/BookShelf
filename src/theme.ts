import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5',
    background: '#F8FAFC',
    surface: '#FFFFFF',
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    text: '#F1F5F9',
    onSurface: '#F1F5F9',
    onSurfaceVariant: '#94A3B8',
    outline: '#475569',
  },
};

export const warmTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#D97706',
    background: '#FEF3C7',
    surface: '#FFFBEB',
    text: '#451A03',
  },
};

export type ThemeType = 'light' | 'dark' | 'warm';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
  warm: warmTheme,
};

export const themeBackgroundColors: Record<ThemeType, string> = {
  light: '#F8FAFC',
  dark: '#0F172A',
  warm: '#FEF3C7',
};
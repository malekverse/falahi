import { useColorScheme } from 'react-native'

export type ThemeColors = {
  bg: string
  background: string
  card: string
  text: string
  textSecondary: string
  textMuted: string
  border: string
  accent: string
  accentLight: string
  activeBg: string
  gold: string
  goldLight: string
  danger: string
}

export const lightTheme: ThemeColors = {
  bg: '#faf7f0',
  background: '#faf7f0',
  card: '#ffffff',
  text: '#1a1a2e',
  textSecondary: '#4a5a4c',
  textMuted: '#5a6a5c',
  border: '#e5ddd0',
  accent: '#2d6a4f',
  accentLight: '#d8f3dc',
  activeBg: '#ebf8f0',
  gold: '#d4a017',
  goldLight: '#fdf4d8',
  danger: '#c0392b',
}

export const darkTheme: ThemeColors = {
  bg: '#1a1a2e',
  background: '#1a1a2e',
  card: '#2a2a3e',
  text: '#faf7f0',
  textSecondary: '#a7d9b8',
  textMuted: '#5a6a5c',
  border: '#3a3a4e',
  accent: '#52b788',
  accentLight: '#23523a',
  activeBg: '#23523a',
  gold: '#e0b02e',
  goldLight: '#3a2e08',
  danger: '#e06050',
}

export function useTheme(): ThemeColors {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTheme : lightTheme
}

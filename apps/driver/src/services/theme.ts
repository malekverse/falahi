import { useColorScheme } from 'react-native'

export type ThemeColors = {
  bg: string
  background: string
  card: string
  text: string
  textSecondary: string
  border: string
  accent: string
  activeBg: string
}

export const lightTheme: ThemeColors = {
  bg: '#f9fafb',
  background: '#f9fafb',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  accent: '#16a34a',
  activeBg: '#f0fdf4',
}

export const darkTheme: ThemeColors = {
  bg: '#111827',
  background: '#111827',
  card: '#1f2937',
  text: '#f9fafb',
  textSecondary: '#9ca3af',
  border: '#374151',
  accent: '#22c55e',
  activeBg: '#052e16',
}

export function useTheme(): ThemeColors {
  const scheme = useColorScheme()
  return scheme === 'dark' ? darkTheme : lightTheme
}

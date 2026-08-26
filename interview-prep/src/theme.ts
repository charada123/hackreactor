import { useColorScheme } from 'react-native';

export type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  cardAlt: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  danger: string;
  success: string;
  warning: string;
  shadow: string;
};

const light: Theme = {
  dark: false,
  bg: '#F4F6F5',
  card: '#FFFFFF',
  cardAlt: '#EDF2F0',
  text: '#12211C',
  textMuted: '#5F6E68',
  border: '#DEE5E2',
  primary: '#0B7A5B',
  primaryText: '#FFFFFF',
  accent: '#0E6BA8',
  danger: '#C1442E',
  success: '#1E8E5A',
  warning: '#B8791C',
  shadow: '#000000',
};

const dark: Theme = {
  dark: true,
  bg: '#0E1512',
  card: '#17211D',
  cardAlt: '#1F2C27',
  text: '#EAF1EE',
  textMuted: '#93A29B',
  border: '#26332D',
  primary: '#14A374',
  primaryText: '#04140E',
  accent: '#4BA3D3',
  danger: '#E06B57',
  success: '#3FBB80',
  warning: '#D9A24A',
  shadow: '#000000',
};

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? dark : light;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

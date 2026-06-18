export const colors = {
  // Base
  white: '#FFFFFF',
  black: '#000000',

  // Grey scale
  grey50: '#F8F9FA',
  grey100: '#F1F3F5',
  grey200: '#E9ECEF',
  grey300: '#DEE2E6',
  grey400: '#ADB5BD',
  grey500: '#868E96',
  grey600: '#6B7280',
  grey700: '#495057',
  grey800: '#343A40',
  grey900: '#1A1D26',

  // Indigo
  indigo50: '#EDF2FF',
  indigo100: '#DBE4FF',
  indigo200: '#BAC8FF',
  indigo500: '#4C6EF5',
  indigo600: '#3B5BDB',
  indigo700: '#364FC7',

  // Green
  green50: '#EBFBEE',
  green100: '#D3F9D8',
  green500: '#40C057',
  green600: '#2F9E44',
  green700: '#2B8A3E',

  // Orange
  orange50: '#FFF4E6',
  orange100: '#FFE8CC',
  orange500: '#FF922B',
  orange600: '#F76707',

  // Red
  red500: '#FA5252',

  // Semantic
  accent: '#3B5BDB',
  accentHover: '#364FC7',
  accentSoft: '#EDF2FF',
  accentSoftText: '#364FC7',

  paid: '#2F9E44',
  paidBg: '#EBFBEE',
  unpaid: '#F76707',
  unpaidBg: '#FFF4E6',

  bgPage: '#F8F9FA',
  bgCard: '#FFFFFF',
  bgSunken: '#F1F3F5',
  bgOverlay: 'rgba(0,0,0,0.4)',

  textPrimary: '#1A1D26',
  textSecondary: '#6B7280',
  textTertiary: '#ADB5BD',
  textOnAccent: '#FFFFFF',

  border: 'rgba(0,0,0,0.06)',
  borderStrong: 'rgba(0,0,0,0.1)',
  separator: 'rgba(0,0,0,0.05)',
} as const;

export type ColorName = keyof typeof colors;

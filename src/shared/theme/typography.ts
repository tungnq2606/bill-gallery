import { TextStyle, Platform } from 'react-native';

const SYSTEM_FONT = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  displayXl: {
    fontFamily: 'Outfit-ExtraBold',
    fontSize: 42,
    lineHeight: 44,
    letterSpacing: -1.2,
  } satisfies TextStyle,

  displayLg: {
    fontFamily: 'Outfit-Bold',
    fontSize: 32,
    lineHeight: 35,
    letterSpacing: -0.6,
  } satisfies TextStyle,

  displayMd: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  title: {
    fontFamily: 'Outfit-Bold',
    fontSize: 20,
    lineHeight: 24,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  headline: {
    fontFamily: SYSTEM_FONT,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600' as const,
  } satisfies TextStyle,

  body: {
    fontFamily: SYSTEM_FONT,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  bodyMedium: {
    fontFamily: SYSTEM_FONT,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  } satisfies TextStyle,

  callout: {
    fontFamily: SYSTEM_FONT,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500' as const,
  } satisfies TextStyle,

  caption: {
    fontFamily: SYSTEM_FONT,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500' as const,
  } satisfies TextStyle,

  micro: {
    fontFamily: SYSTEM_FONT,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,
} as const;

export type TypographyName = keyof typeof typography;

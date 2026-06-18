import { ViewStyle, Platform } from 'react-native';

const createShadow = (
  offsetY: number,
  opacity: number,
  shadowRadius: number,
  elevation: number,
  shadowColor = '#000',
): ViewStyle => ({
  ...Platform.select({
    ios: {
      shadowColor,
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius,
    },
    android: {
      elevation,
    },
  }),
});

export const shadows = {
  sm: createShadow(1, 0.04, 3, 1),
  md: createShadow(2, 0.06, 8, 3),
  lg: createShadow(4, 0.08, 16, 6),
  fab: createShadow(4, 0.3, 12, 8, '#3B5BDB'),
  sheet: createShadow(-4, 0.12, 16, 10),
} as const;

export type ShadowName = keyof typeof shadows;

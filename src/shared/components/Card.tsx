import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '@/shared/theme';

interface CardProps {
  children: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const Card = ({ children, pressable = false, onPress, style }: CardProps) => {
  if (pressable) {
    return (
      <Pressable
        style={({ pressed }) => [styles.base, style, pressed && styles.pressed]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }
  return <View style={[styles.base, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  pressed: { transform: [{ scale: 0.98 }] },
});

export default Card;

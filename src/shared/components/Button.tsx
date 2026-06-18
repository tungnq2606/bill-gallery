import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, radius } from '@/shared/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type ButtonSize = 'default' | 'sm';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  full?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<ButtonVariant, { bg: ViewStyle; text: TextStyle }> = {
  primary: { bg: { backgroundColor: colors.accent }, text: { color: colors.textOnAccent } },
  secondary: { bg: { backgroundColor: colors.bgSunken }, text: { color: colors.textPrimary } },
  ghost: { bg: { backgroundColor: 'transparent' }, text: { color: colors.accent } },
  outline: { bg: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.borderStrong }, text: { color: colors.textPrimary } },
  danger: { bg: { backgroundColor: 'transparent' }, text: { color: colors.red500 } },
};

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  full = false,
  disabled = false,
  icon,
}: ButtonProps) => {
  const v = VARIANT_STYLES[variant];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        v.bg,
        size === 'sm' && styles.sm,
        full && styles.full,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {icon}
      <Text style={[styles.text, v.text, size === 'sm' && styles.smText]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 50,
    paddingHorizontal: 24,
    borderRadius: radius.md,
  },
  sm: { height: 38, paddingHorizontal: 16, borderRadius: radius.sm },
  full: { width: '100%' },
  disabled: { opacity: 0.5 },
  pressed: { transform: [{ scale: 0.97 }] },
  text: { fontSize: 16, fontWeight: '600' },
  smText: { fontSize: 14 },
});

export default Button;

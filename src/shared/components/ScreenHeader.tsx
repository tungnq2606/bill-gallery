import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { typography, colors, spacing } from '@/shared/theme';

interface ScreenHeaderProps {
  title: string;
  large?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onBack?: () => void;
}

const ScreenHeader = ({ title, large = false, leftIcon, rightIcon, onBack }: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {onBack && leftIcon && (
        <Pressable style={styles.iconBtn} onPress={onBack}>{leftIcon}</Pressable>
      )}
      <Text style={large ? styles.titleLarge : styles.title}>{title}</Text>
      {rightIcon && <View style={styles.iconBtn}>{rightIcon}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.md,
  },
  titleLarge: { ...typography.displayLg, flex: 1, letterSpacing: -0.5 },
  title: { ...typography.title, flex: 1 },
  iconBtn: { width: 36, height: 36, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});

export default ScreenHeader;

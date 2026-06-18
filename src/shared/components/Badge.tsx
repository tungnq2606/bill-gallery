import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/shared/theme';

type BadgeVariant = 'paid' | 'unpaid' | 'accent';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  showDot?: boolean;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; fg: string }> = {
  paid: { bg: colors.paidBg, fg: colors.paid },
  unpaid: { bg: colors.unpaidBg, fg: colors.unpaid },
  accent: { bg: colors.accentSoft, fg: colors.accentSoftText },
};

const Badge = ({ label, variant, showDot = true }: BadgeProps) => {
  const v = VARIANT_STYLES[variant];
  return (
    <View style={[styles.base, { backgroundColor: v.bg }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: v.fg }]} />}
      <Text style={[styles.text, { color: v.fg }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 22, paddingHorizontal: 8, borderRadius: radius.full },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 11, fontWeight: '600' },
});

export default Badge;

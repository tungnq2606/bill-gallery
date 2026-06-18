import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, radius } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';

interface SpendingHeroProps {
  total: number;
  label: string;
}

const SpendingHero = ({ total, label }: SpendingHeroProps) => (
  <View style={styles.hero}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.amount}>{formatAmount(total)}</Text>
  </View>
);

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  label: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  amount: {
    ...typography.displayXl,
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
});

export default SpendingHero;

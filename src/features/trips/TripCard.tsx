import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius, shadows, typography, spacing } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';

interface TripCardProps {
  name: string;
  coverColor: string;
  billCount: number;
  totalSpent: number;
  dateRange?: string;
  onPress: () => void;
}

const TripCard = ({ name, coverColor, billCount, totalSpent, dateRange, onPress }: TripCardProps) => (
  <Pressable
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    onPress={onPress}
  >
    <View style={[styles.color, { backgroundColor: coverColor }]} />
    <View style={styles.content}>
      <Text style={styles.name} numberOfLines={1}>{name}</Text>
      {dateRange && <Text style={styles.date}>{dateRange}</Text>}
      <View style={styles.stats}>
        <Text style={styles.stat}>{billCount} hóa đơn</Text>
        <View style={styles.dot} />
        <Text style={styles.stat}>{formatAmount(totalSpent)}</Text>
      </View>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.sm,
    marginBottom: spacing.sm,
  },
  pressed: { transform: [{ scale: 0.98 }] },
  color: { width: 6, borderRadius: 0 },
  content: { flex: 1, padding: 14, paddingLeft: 14 },
  name: { ...typography.title, fontSize: 17, marginBottom: 2 },
  date: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  stats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stat: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textTertiary },
});

export default TripCard;

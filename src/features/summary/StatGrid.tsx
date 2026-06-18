import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, shadows } from '@/shared/theme';

interface StatItem {
  label: string;
  value: string;
  icon: string;
}

interface StatGridProps {
  stats: StatItem[];
}

const StatGrid = ({ stats }: StatGridProps) => (
  <View style={styles.grid}>
    {stats.map((stat) => (
      <View key={stat.label} style={styles.card}>
        <Text style={styles.icon}>{stat.icon}</Text>
        <Text style={styles.value}>{stat.value}</Text>
        <Text style={styles.label}>{stat.label}</Text>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.xl, gap: spacing.sm,
  },
  card: {
    width: '48%', flexGrow: 1,
    backgroundColor: colors.bgCard, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
    padding: 14, ...shadows.sm,
  },
  icon: { fontSize: 20, marginBottom: 8 },
  value: {
    fontSize: 20, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, fontVariant: ['tabular-nums'],
  },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginTop: 2 },
});

export default StatGrid;

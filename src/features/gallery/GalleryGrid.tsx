import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import BillTile, { TILE_WIDTH, TILE_GAP } from './BillTile';
import { colors, spacing } from '@/shared/theme';
import { formatMonthYear } from '@/utils/date';
import { formatAmount } from '@/utils/currency';
import type { Bill, BillAttachment } from '@/data/types';

interface BillWithAttachment extends Bill {
  primaryAttachment?: BillAttachment | null;
}

interface MonthGroup {
  month: string; // "2026-06"
  label: string;
  total: number;
  bills: BillWithAttachment[];
}

interface GalleryGridProps {
  bills: BillWithAttachment[];
}

const groupByMonth = (bills: BillWithAttachment[]): MonthGroup[] => {
  const groups = new Map<string, BillWithAttachment[]>();
  for (const bill of bills) {
    const month = bill.date.slice(0, 7);
    const existing = groups.get(month);
    if (existing) existing.push(bill);
    else groups.set(month, [bill]);
  }
  return Array.from(groups.entries()).map(([month, monthBills]) => ({
    month,
    label: formatMonthYear(`${month}-01`),
    total: monthBills.reduce((sum, b) => sum + b.amount, 0),
    bills: monthBills,
  }));
};

const GalleryGrid = ({ bills }: GalleryGridProps) => {
  const router = useRouter();
  const months = groupByMonth(bills);

  if (bills.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📷</Text>
        <Text style={styles.emptyTitle}>Chưa có hóa đơn</Text>
        <Text style={styles.emptyDesc}>Nhấn + để chụp hóa đơn đầu tiên</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={months}
      keyExtractor={(item) => item.month}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: monthGroup }) => (
        <View style={styles.section}>
          <View style={styles.monthHeader}>
            <Text style={styles.monthLabel}>{monthGroup.label}</Text>
            <Text style={styles.monthTotal}>{formatAmount(monthGroup.total)}</Text>
          </View>
          <View style={styles.grid}>
            {monthGroup.bills.map((bill) => (
              <BillTile
                key={bill.id}
                bill={bill}
                attachment={bill.primaryAttachment}
                onPress={() => router.push(`/bill/${bill.id}`)}
              />
            ))}
          </View>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: 100 },
  section: { marginBottom: spacing.lg },
  monthHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.sm,
  },
  monthLabel: {
    fontSize: 13, fontWeight: '600', letterSpacing: 0.5,
    textTransform: 'uppercase', color: colors.textTertiary,
  },
  monthTotal: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.xl, gap: TILE_GAP,
  },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingTop: 100,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.6 },
  emptyTitle: {
    fontSize: 18, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14, color: colors.textSecondary, textAlign: 'center',
  },
});

export default GalleryGrid;

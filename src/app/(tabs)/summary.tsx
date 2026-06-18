import { useEffect, useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SegmentedControl } from '@/shared/components';
import { colors, spacing } from '@/shared/theme';
import { useBillStore } from '@/stores/billStore';
import { formatAmount } from '@/utils/currency';
import SpendingHero from '@/features/summary/SpendingHero';
import StatGrid from '@/features/summary/StatGrid';

const PERIODS = ['Tháng', 'Quý', 'Năm'];

const SummaryScreen = () => {
  const insets = useSafeAreaInsets();
  const { bills, loadBills } = useBillStore();
  const [period, setPeriod] = useState(0);

  useEffect(() => {
    loadBills();
  }, []);

  const total = bills.reduce((sum, b) => sum + b.amount, 0);
  const billCount = bills.length;
  const avgBill = billCount > 0 ? Math.round(total / billCount) : 0;
  const settledCount = bills.filter((b) => b.status === 'settled').length;

  const stats = [
    { label: 'Hóa đơn', value: String(billCount), icon: '🧾' },
    { label: 'Trung bình', value: formatAmount(avgBill), icon: '📊' },
    { label: 'Đã thanh toán', value: String(settledCount), icon: '✅' },
    { label: 'Chưa trả', value: String(billCount - settledCount), icon: '⏳' },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Summary" large />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.segment}>
          <SegmentedControl options={PERIODS} selectedIndex={period} onSelect={setPeriod} />
        </View>
        <SpendingHero total={total} label="Tổng chi tiêu" />
        <StatGrid stats={stats} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { paddingBottom: 100 },
  segment: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
});

export default SummaryScreen;

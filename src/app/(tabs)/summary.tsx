import { useEffect, useState } from 'react';
import { View, ScrollView, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, SegmentedControl, PersonRow, AddPersonSheet } from '@/shared/components';
import { colors, spacing } from '@/shared/theme';
import { useBillStore } from '@/stores/billStore';
import { usePersonStore } from '@/stores/personStore';
import { formatAmount } from '@/utils/currency';
import { calculateBalances } from '@/utils/balanceCalculator';
import { splitRepo } from '@/data/repositories';
import SpendingHero from '@/features/summary/SpendingHero';
import StatGrid from '@/features/summary/StatGrid';
import BalanceList from '@/features/summary/BalanceList';
import type { ShareRecord } from '@/utils/balanceCalculator';

const PERIODS = ['Tháng', 'Quý', 'Năm'];

const getFilteredBills = (bills: typeof useBillStore.prototype extends never ? never : ReturnType<typeof useBillStore.getState>['bills'], periodIndex: number) => {
  const now = new Date();
  return bills.filter((b) => {
    const d = new Date(b.date);
    if (periodIndex === 0) {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    } else if (periodIndex === 1) {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return d >= threeMonthsAgo;
    } else {
      return d.getFullYear() === now.getFullYear();
    }
  });
};

const SummaryScreen = () => {
  const insets = useSafeAreaInsets();
  const { bills, loadBills } = useBillStore();
  const { persons, me, loadPersons } = usePersonStore();
  const [period, setPeriod] = useState(0);
  const [shareRecords, setShareRecords] = useState<ShareRecord[]>([]);
  const [showAddPerson, setShowAddPerson] = useState(false);

  useEffect(() => {
    loadBills();
    loadPersons();
  }, []);

  const filteredBills = getFilteredBills(bills, period);

  useEffect(() => {
    const loadShares = async () => {
      const records: ShareRecord[] = [];
      for (const bill of filteredBills) {
        const split = await splitRepo.getByBillId(bill.id);
        if (!split) continue;
        const shares = await splitRepo.getShares(split.id);
        for (const share of shares) {
          records.push({
            payerId: split.payerId,
            personId: share.personId,
            amount: share.amount,
            isPaid: share.status === 'paid',
          });
        }
      }
      setShareRecords(records);
    };
    if (filteredBills.length > 0) {
      loadShares();
    } else {
      setShareRecords([]);
    }
  }, [filteredBills.length, period]);

  const total = filteredBills.reduce((sum, b) => sum + b.amount, 0);
  const billCount = filteredBills.length;
  const avgBill = billCount > 0 ? Math.round(total / billCount) : 0;
  const settledCount = filteredBills.filter((b) => b.status === 'settled').length;

  const stats = [
    { label: 'Hóa đơn', value: String(billCount), icon: '🧾' },
    { label: 'Trung bình', value: formatAmount(avgBill), icon: '📊' },
    { label: 'Đã thanh toán', value: String(settledCount), icon: '✅' },
    { label: 'Chưa trả', value: String(billCount - settledCount), icon: '⏳' },
  ];

  const handleDeletePerson = (personId: string, personName: string) => {
    Alert.alert('Xoá người', `Xoá "${personName}"?`, [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Xoá', style: 'destructive',
        onPress: () => usePersonStore.getState().deletePerson(personId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Summary" large />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.segment}>
          <SegmentedControl options={PERIODS} selectedIndex={period} onSelect={setPeriod} />
        </View>
        <SpendingHero total={total} label="Tổng chi tiêu" />
        <StatGrid stats={stats} />
        {me && (
          <BalanceList
            entries={calculateBalances(me.id, shareRecords)}
            persons={persons}
          />
        )}

        {/* Person management */}
        <View style={styles.personSection}>
          <Text style={styles.sectionTitle}>NGƯỜI</Text>
          {persons.map((p) => (
            <Pressable key={p.id} onLongPress={() => !p.isMe && handleDeletePerson(p.id, p.name)}>
              <PersonRow
                name={p.name}
                initials={p.initials}
                avatarColor={p.avatarColor}
                subtitle={p.isMe ? 'Tôi' : undefined}
              />
            </Pressable>
          ))}
          <Pressable style={styles.addBtn} onPress={() => setShowAddPerson(true)}>
            <Text style={styles.addBtnIcon}>+</Text>
            <Text style={styles.addBtnText}>Thêm người</Text>
          </Pressable>
        </View>
      </ScrollView>

      <AddPersonSheet
        visible={showAddPerson}
        onClose={() => setShowAddPerson(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { paddingBottom: 100 },
  segment: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  personSection: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 10,
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, marginTop: spacing.sm,
    borderRadius: 12, borderWidth: 1.5, borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  addBtnIcon: { fontSize: 20, fontWeight: '600', color: colors.accent },
  addBtnText: { fontSize: 15, fontWeight: '600', color: colors.accent },
});

export default SummaryScreen;

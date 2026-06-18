import { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, TextField, SegmentedControl, ScreenHeader } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';
import { billRepo } from '@/data/repositories';
import { useBillStore } from '@/stores/billStore';
import type { BillType } from '@/data/types';

const BILL_TYPE_LABELS = ['Hoá đơn', 'Chuyển khoản', 'Nhập tay'];
const BILL_TYPES: BillType[] = ['receipt', 'transfer', 'manual'];

const BackIcon = () => {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary }}>‹</Text>;
};

const EditBillScreen = () => {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [typeIndex, setTypeIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!billId) return;
    const load = async () => {
      const bill = await billRepo.getById(billId);
      if (!bill) return;
      setTypeIndex(BILL_TYPES.indexOf(bill.type));
      setAmount(String(bill.amount));
      setDate(bill.date);
      setNote(bill.note ?? '');
      setLoaded(true);
    };
    load();
  }, [billId]);

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSave = async () => {
    if (parsedAmount <= 0 || !billId) return;
    setSaving(true);
    await billRepo.update(billId, {
      type: BILL_TYPES[typeIndex],
      amount: parsedAmount,
      date,
      note: note || undefined,
    });
    await useBillStore.getState().loadBills();
    setSaving(false);
    router.back();
  };

  if (!loaded) return <View style={styles.loading} />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Chỉnh sửa"
        leftIcon={<BackIcon />}
        onBack={() => router.back()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Bill type */}
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={BILL_TYPE_LABELS}
            selectedIndex={typeIndex}
            onSelect={setTypeIndex}
          />
        </View>

        {/* Amount */}
        <TextField
          label="Số tiền"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="number-pad"
        />

        <View style={styles.gap} />

        {/* Date */}
        <TextField
          label="Ngày"
          value={date}
          onChangeText={setDate}
          placeholder="2025-01-15"
        />

        <View style={styles.gap} />

        {/* Note */}
        <TextField
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          placeholder="Ghi chú..."
        />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Lưu thay đổi"
          variant="primary"
          full
          onPress={handleSave}
          disabled={parsedAmount <= 0 || saving}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  loading: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: 20 },
  segmentWrap: { marginBottom: spacing.xxl },
  gap: { height: spacing.lg },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.separator },
});

export default EditBillScreen;

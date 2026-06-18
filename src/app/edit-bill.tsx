import { useEffect, useState } from 'react';
import { View, ScrollView, Text, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, TextField, SegmentedControl, ScreenHeader } from '@/shared/components';
import { colors, spacing } from '@/shared/theme';
import { billRepo } from '@/data/repositories';
import { useBillStore } from '@/stores/billStore';
import { useTripStore } from '@/stores/tripStore';
import type { BillType } from '@/data/types';

const BILL_TYPE_LABELS = ['Hoá đơn', 'Chuyển khoản', 'Nhập tay'];
const BILL_TYPES: BillType[] = ['receipt', 'transfer', 'manual'];

const BackIcon = () => {
  const { Text: RNText } = require('react-native');
  return <RNText style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary }}>‹</RNText>;
};

const EditBillScreen = () => {
  const { billId } = useLocalSearchParams<{ billId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [typeIndex, setTypeIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [tripId, setTripId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { trips, loadTrips } = useTripStore();

  useEffect(() => { loadTrips(); }, []);

  useEffect(() => {
    if (!billId) return;
    const load = async () => {
      const bill = await billRepo.getById(billId);
      if (!bill) return;
      setTypeIndex(BILL_TYPES.indexOf(bill.type));
      setAmount(String(bill.amount));
      setDate(bill.date);
      setNote(bill.note ?? '');
      setTripId(bill.tripId);
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
      tripId: tripId ?? undefined,
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
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={BILL_TYPE_LABELS}
            selectedIndex={typeIndex}
            onSelect={setTypeIndex}
          />
        </View>

        <TextField
          label="Số tiền"
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="number-pad"
        />

        <View style={styles.gap} />

        <TextField
          label="Ngày"
          value={date}
          onChangeText={setDate}
          placeholder="2025-01-15"
        />

        <View style={styles.gap} />

        <TextField
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          placeholder="Ghi chú..."
        />

        {/* Trip picker */}
        {trips.length > 0 && (
          <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Chuyến đi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Pressable
                style={[styles.tripChip, !tripId && styles.tripChipActive]}
                onPress={() => setTripId(null)}
              >
                <Text style={[styles.tripChipText, !tripId && styles.tripChipTextActive]}>Không</Text>
              </Pressable>
              {trips.map((t) => (
                <Pressable
                  key={t.id}
                  style={[styles.tripChip, tripId === t.id && styles.tripChipActive]}
                  onPress={() => setTripId(t.id)}
                >
                  <View style={[styles.tripDot, { backgroundColor: t.coverColor }]} />
                  <Text style={[styles.tripChipText, tripId === t.id && styles.tripChipTextActive]}>{t.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
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
  tripSection: { marginTop: spacing.xl },
  tripLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 },
  tripChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 999, backgroundColor: colors.bgSunken, marginRight: 8,
  },
  tripChipActive: { backgroundColor: colors.accentSoft, borderWidth: 1.5, borderColor: colors.accent },
  tripChipText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  tripChipTextActive: { color: colors.accent },
  tripDot: { width: 8, height: 8, borderRadius: 4 },
});

export default EditBillScreen;

import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, TextField, SegmentedControl, ScreenHeader } from '@/shared/components';
import { colors, spacing, typography, radius } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';
import { toISODate } from '@/utils/date';
import { runOcr } from '@/utils/ocrService';
import { saveImage } from '@/utils/imageManager';
import { billRepo } from '@/data/repositories';
import { useTripStore } from '@/stores/tripStore';
import type { BillType } from '@/data/types';

const BILL_TYPES: BillType[] = ['receipt', 'transfer', 'manual'];
const BILL_TYPE_LABELS = ['Hóa đơn', 'Chuyển khoản', 'Nhập tay'];

const ReviewScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    amount?: string;
    merchant?: string;
    date?: string;
    imageUri?: string;
    ocrRawText?: string;
    ocrConfidence?: string;
    tripId?: string;
  }>();

  const [typeIndex, setTypeIndex] = useState(0);
  const [amount, setAmount] = useState(params.amount ?? '');
  const [date, setDate] = useState(params.date ?? toISODate());
  const [note, setNote] = useState('');
  const [tripId, setTripId] = useState<string | null>(params.tripId ?? null);
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const { trips, loadTrips } = useTripStore();

  useEffect(() => { loadTrips(); }, []);

  useEffect(() => {
    if (!params.imageUri || params.amount) return;
    const doOcr = async () => {
      setOcrLoading(true);
      try {
        const result = await runOcr(params.imageUri!);
        if (result.total) setAmount(String(result.total));
        if (result.date) setDate(result.date);
        // Build note from OCR context
        const parts: string[] = [];
        if (result.merchant) parts.push(result.merchant);
        if (result.items.length > 0) {
          parts.push(result.items.map((i) => i.name).join(', '));
        }
        if (parts.length > 0) setNote(parts.join(' — '));
      } catch (e) {
        console.warn('OCR failed:', e);
      }
      setOcrLoading(false);
    };
    doOcr();
  }, []);

  const parsedAmount = parseInt(amount.replace(/\D/g, ''), 10) || 0;

  const handleSave = async () => {
    if (parsedAmount <= 0) return;
    setSaving(true);
    const bill = await billRepo.create({
      type: BILL_TYPES[typeIndex],
      amount: parsedAmount,
      date,
      note: note || undefined,
      tripId: tripId ?? undefined,
      ocrRawText: params.ocrRawText ?? undefined,
      ocrConfidence: params.ocrConfidence ? parseFloat(params.ocrConfidence) : undefined,
    });

    if (params.imageUri) {
      const saved = await saveImage(params.imageUri, bill.id);
      await billRepo.addAttachment(bill.id, saved.originalUri, true, saved.thumbnailUri);
    }

    setSaving(false);
    router.push({ pathname: '/split', params: { billId: bill.id } });
  };

  const handleSaveOnly = async () => {
    if (parsedAmount <= 0) return;
    setSaving(true);
    const bill = await billRepo.create({
      type: BILL_TYPES[typeIndex],
      amount: parsedAmount,
      date,
      note: note || undefined,
      tripId: tripId ?? undefined,
    });
    if (params.imageUri) {
      const saved = await saveImage(params.imageUri, bill.id);
      await billRepo.addAttachment(bill.id, saved.originalUri, true, saved.thumbnailUri);
    }
    setSaving(false);
    router.dismissAll();
  };

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Xem lại"
        leftIcon={<BackIcon />}
        onBack={() => router.back()}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Image preview */}
        {params.imageUri && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: params.imageUri }} style={styles.previewImage} resizeMode="cover" />
            {ocrLoading && (
              <View style={styles.ocrOverlay}>
                <Text style={styles.ocrText}>Đang nhận diện...</Text>
              </View>
            )}
          </View>
        )}

        {/* Bill type */}
        <View style={styles.segmentWrap}>
          <SegmentedControl
            options={BILL_TYPE_LABELS}
            selectedIndex={typeIndex}
            onSelect={setTypeIndex}
          />
        </View>

        {/* Amount */}
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Số tiền</Text>
          <Text style={styles.amountDisplay}>
            {parsedAmount > 0 ? formatAmount(parsedAmount) : '0 ₫'}
          </Text>
        </View>

        <TextField
          label="Số tiền (VND)"
          value={amount}
          onChangeText={setAmount}
          placeholder="147000"
          keyboardType="number-pad"
        />

        <TextField
          label="Ngày"
          value={date}
          onChangeText={setDate}
          placeholder="2026-06-18"
        />

        <View style={styles.gap} />

        <TextField
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          placeholder="Highlands Coffee — cà phê với team"
        />

        {params.ocrConfidence && (
          <Text style={styles.confidence}>
            OCR confidence: {Math.round(parseFloat(params.ocrConfidence) * 100)}%
          </Text>
        )}

        {/* Trip picker */}
        {trips.length > 0 && (
          <View style={styles.tripSection}>
            <Text style={styles.tripLabel}>Chuyến đi</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tripScroll}>
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
          title="Chia tiền"
          variant="primary"
          full
          onPress={handleSave}
          disabled={parsedAmount <= 0 || saving}
        />
        <Button
          title="Lưu không chia"
          variant="secondary"
          full
          onPress={handleSaveOnly}
          disabled={parsedAmount <= 0 || saving}
        />
      </View>
    </View>
  );
};

const BackIcon = () => {
  const { Text: RNText } = require('react-native');
  return <RNText style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary }}>‹</RNText>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  scroll: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: 20 },
  segmentWrap: { marginBottom: spacing.xxl },
  amountSection: { alignItems: 'center', marginBottom: spacing.xxl },
  amountLabel: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  amountDisplay: {
    ...typography.displayXl, color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  gap: { height: spacing.lg },
  confidence: {
    fontSize: 12, color: colors.textTertiary, marginTop: spacing.lg,
    textAlign: 'center',
  },
  footer: { padding: spacing.xl, gap: 10, borderTopWidth: 1, borderTopColor: colors.separator },
  imagePreview: {
    height: 340, overflow: 'hidden',
    marginHorizontal: -spacing.xl, marginTop: -spacing.xl,
    marginBottom: spacing.xl, backgroundColor: colors.grey200,
  },
  previewImage: { width: '100%', height: '100%' },
  ocrOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  ocrText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  tripSection: { marginTop: spacing.xl },
  tripLabel: { fontSize: 12, fontWeight: '500', color: colors.textSecondary, marginBottom: 8 },
  tripScroll: { marginHorizontal: -spacing.xl, paddingHorizontal: spacing.xl },
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

export default ReviewScreen;

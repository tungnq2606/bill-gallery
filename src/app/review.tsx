import { useState, useEffect } from 'react';
import { View, ScrollView, Text, Image, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, TextField, SegmentedControl, ScreenHeader } from '@/shared/components';
import { colors, spacing, typography, radius } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';
import { toISODate } from '@/utils/date';
import { runOcr } from '@/utils/ocrService';
import { saveImage } from '@/utils/imageManager';
import { billRepo } from '@/data/repositories';
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
  }>();

  const [typeIndex, setTypeIndex] = useState(0);
  const [amount, setAmount] = useState(params.amount ?? '');
  const [merchant, setMerchant] = useState(params.merchant ?? '');
  const [date, setDate] = useState(params.date ?? toISODate());
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  useEffect(() => {
    if (!params.imageUri || params.amount) return;
    const doOcr = async () => {
      setOcrLoading(true);
      try {
        const result = await runOcr(params.imageUri!);
        if (result.total) setAmount(String(result.total));
        if (result.merchant) setMerchant(result.merchant);
        if (result.date) setDate(result.date);
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
      merchant: merchant || undefined,
      date,
      location: location || undefined,
      note: note || undefined,
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
      merchant: merchant || undefined,
      date,
      location: location || undefined,
      note: note || undefined,
    });
    if (params.imageUri) {
      const saved = await saveImage(params.imageUri, bill.id);
      await billRepo.addAttachment(bill.id, saved.originalUri, true, saved.thumbnailUri);
    }
    setSaving(false);
    router.dismissAll();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
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

        <View style={styles.gap} />

        <TextField
          label="Nơi mua"
          value={merchant}
          onChangeText={setMerchant}
          placeholder="Highlands Coffee"
        />

        <View style={styles.gap} />

        <TextField
          label="Ngày"
          value={date}
          onChangeText={setDate}
          placeholder="2026-06-18"
        />

        <View style={styles.gap} />

        <TextField
          label="Địa điểm"
          value={location}
          onChangeText={setLocation}
          placeholder="Q1, TP.HCM"
        />

        <View style={styles.gap} />

        <TextField
          label="Ghi chú"
          value={note}
          onChangeText={setNote}
          placeholder="Cà phê với team"
        />

        {params.ocrConfidence && (
          <Text style={styles.confidence}>
            OCR confidence: {Math.round(parseFloat(params.ocrConfidence) * 100)}%
          </Text>
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
    height: 200, borderRadius: radius.md, overflow: 'hidden',
    marginBottom: spacing.xl, backgroundColor: colors.grey200,
  },
  previewImage: { width: '100%', height: '100%' },
  ocrOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  ocrText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});

export default ReviewScreen;

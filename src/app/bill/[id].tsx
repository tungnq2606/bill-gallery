import { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, ScrollView, Pressable, Modal, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Badge, Card, PersonRow } from '@/shared/components';
import { colors, typography, spacing, radius, shadows } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';
import { formatDate } from '@/utils/date';
import { billRepo, splitRepo, personRepo } from '@/data/repositories';
import { useBillStore } from '@/stores/billStore';
import type { Bill, BillAttachment, Split, SplitShare, Person } from '@/data/types';

const BillDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [bill, setBill] = useState<Bill | null>(null);
  const [attachment, setAttachment] = useState<BillAttachment | null>(null);
  const [split, setSplit] = useState<Split | null>(null);
  const [shares, setShares] = useState<(SplitShare & { person: Person })[]>([]);
  const [showFullImage, setShowFullImage] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    const b = await billRepo.getById(id);
    if (!b) return;
    setBill(b);
    setAttachment(await billRepo.getPrimaryAttachment(id));

    const s = await splitRepo.getByBillId(id);
    setSplit(s);
    if (s) {
      const rawShares = await splitRepo.getShares(s.id);
      const withPerson = await Promise.all(
        rawShares.map(async (share) => {
          const person = await personRepo.getById(share.personId);
          return { ...share, person: person! };
        })
      );
      setShares(withPerson.filter((sh) => sh.person));
    } else {
      setShares([]);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!bill) return <View style={styles.loading} />;

  const isPaid = bill.status === 'settled';
  const hasImage = !!attachment?.uri;

  const handleDelete = () => {
    Alert.alert('Xóa hóa đơn', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa', style: 'destructive',
        onPress: async () => {
          await useBillStore.getState().deleteBill(bill.id);
          router.back();
        },
      },
    ]);
  };

  const handleToggleSharePaid = async (share: SplitShare) => {
    if (share.status === 'paid') {
      await splitRepo.markShareUnpaid(share.id);
    } else {
      await splitRepo.markSharePaid(share.id);
    }
    await loadData();
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image header */}
        <View style={styles.imageHeader}>
          {hasImage ? (
            <Pressable onPress={() => setShowFullImage(true)}>
              <Image source={{ uri: attachment.uri }} style={styles.image} />
            </Pressable>
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.grey200 }]}>
              <Text style={styles.placeholderIcon}>🧾</Text>
            </View>
          )}
          <Pressable
            style={[styles.backBtn, { top: insets.top + 10 }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.amount}>{formatAmount(bill.amount, bill.currency)}</Text>
          {bill.merchant && <Text style={styles.merchant}>{bill.merchant}</Text>}
          <Text style={styles.meta}>
            {formatDate(bill.date)}
            {bill.location ? ` · ${bill.location}` : ''}
          </Text>
          <Badge
            label={isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
            variant={isPaid ? 'paid' : 'unpaid'}
          />
        </View>

        {/* Split section */}
        {shares.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CHIA TIỀN</Text>
            {shares.map((share) => (
              <Pressable key={share.id} onPress={() => handleToggleSharePaid(share)}>
                <PersonRow
                  name={share.person.name}
                  initials={share.person.initials}
                  avatarColor={share.person.avatarColor}
                  subtitle={share.status === 'paid' ? '✓ Đã trả' : 'Chưa trả'}
                  amount={formatAmount(share.amount, bill.currency)}
                  amountColor={share.status === 'paid' ? colors.paid : colors.unpaid}
                />
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.section}>
            <Button
              title="Chia tiền"
              variant="outline"
              full
              onPress={() => router.push({ pathname: '/split', params: { billId: bill.id } })}
            />
          </View>
        )}

        {/* Note */}
        {bill.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>GHI CHÚ</Text>
            <Card style={styles.noteCard}>
              <Text style={styles.noteText}>{bill.note}</Text>
            </Card>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {!isPaid && (
            <Button
              title="Đã thanh toán"
              variant="primary"
              full
              onPress={async () => {
                await billRepo.updateStatus(bill.id, 'settled');
                setBill({ ...bill, status: 'settled' });
              }}
            />
          )}
          <Button
            title="Chỉnh sửa"
            variant="secondary"
            full
            onPress={() => router.push({ pathname: '/edit-bill', params: { billId: bill.id } })}
          />
          <Button title="Xóa hóa đơn" variant="danger" full onPress={handleDelete} />
        </View>
      </ScrollView>

      {/* Full-screen image viewer */}
      {hasImage && (
        <Modal visible={showFullImage} transparent animationType="fade">
          <Pressable style={styles.fullImageOverlay} onPress={() => setShowFullImage(false)}>
            <Image
              source={{ uri: attachment.uri }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <View style={[styles.closeBtn, { top: insets.top + 10 }]}>
              <Text style={styles.closeIcon}>✕</Text>
            </View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  loading: { flex: 1, backgroundColor: colors.bgPage },
  imageHeader: { height: 300, backgroundColor: colors.grey200 },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 56, opacity: 0.4 },
  backBtn: {
    position: 'absolute', left: 16,
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  backIcon: { color: '#fff', fontSize: 24, fontWeight: '600', marginTop: -2 },
  info: { padding: spacing.xl, gap: 4 },
  amount: { ...typography.displayLg, fontSize: 36, fontVariant: ['tabular-nums'] },
  merchant: { fontSize: 17, fontWeight: '600', color: colors.textPrimary },
  meta: { fontSize: 14, color: colors.textSecondary, marginBottom: 8 },
  section: { paddingHorizontal: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.textTertiary, marginBottom: 10,
  },
  noteCard: { padding: 14 },
  noteText: { fontSize: 15, color: colors.textPrimary, lineHeight: 22 },
  actions: { padding: spacing.xl, gap: 10, paddingBottom: 40 },
  fullImageOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center', justifyContent: 'center',
  },
  fullImage: { width: '100%', height: '100%' },
  closeBtn: {
    position: 'absolute', right: 20,
    width: 36, height: 36, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeIcon: { color: '#fff', fontSize: 18, fontWeight: '600' },
});

export default BillDetailScreen;

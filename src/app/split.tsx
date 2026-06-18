import { useEffect, useState } from 'react';
import { View, ScrollView, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Avatar, SegmentedControl, ScreenHeader, Card, TextField, AddPersonSheet } from '@/shared/components';
import { colors, spacing, typography, radius } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';
import { billRepo, personRepo, splitRepo } from '@/data/repositories';
import { useSplitCalculator } from '@/features/split/useSplitCalculator';
import type { Bill, Person, SplitType } from '@/data/types';

const SPLIT_LABELS = ['Đều', 'Tùy chỉnh'];
const SPLIT_TYPES: SplitType[] = ['equal', 'custom'];

const SplitScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { billId } = useLocalSearchParams<{ billId: string }>();

  const [bill, setBill] = useState<Bill | null>(null);
  const [persons, setPersons] = useState<Person[]>([]);
  const [payerId, setPayerId] = useState<string | null>(null);
  const [selectedPersonIds, setSelectedPersonIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showAddPerson, setShowAddPerson] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!billId) return;
      const b = await billRepo.getById(billId);
      setBill(b);
      const allPersons = await personRepo.getAll();
      setPersons(allPersons);
      if (allPersons.length > 0) {
        const me = allPersons.find((p) => p.isMe);
        setPayerId(me?.id ?? allPersons[0].id);
        setSelectedPersonIds(allPersons.map((p) => p.id));
      }
    };
    load();
  }, [billId]);

  const participants = persons
    .filter((p) => selectedPersonIds.includes(p.id))
    .map((p) => ({ personId: p.id, name: p.name }));

  const calc = useSplitCalculator(bill?.amount ?? 0, participants);
  const splitTypeIndex = SPLIT_TYPES.indexOf(calc.splitType);

  const togglePerson = (id: string) => {
    setSelectedPersonIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!bill || !payerId || calc.results.length === 0) return;
    setSaving(true);
    await splitRepo.create({
      billId: bill.id,
      payerId,
      splitType: calc.splitType,
      shares: calc.results.map((r) => ({
        personId: r.personId,
        amount: r.amount,
        percent: r.percent,
        shares: r.shares,
      })),
    });
    setSaving(false);
    router.dismissAll();
  };

  if (!bill) return <View style={styles.loading} />;

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Chia tiền"
        leftIcon={<BackIcon />}
        onBack={() => router.back()}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount */}
        <View style={styles.heroSection}>
          <Text style={styles.heroLabel}>Tổng hóa đơn</Text>
          <Text style={styles.heroAmount}>{formatAmount(bill.amount)}</Text>
        </View>

        {/* Payer */}
        <Text style={styles.sectionTitle}>AI TRẢ?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.payerScroll}>
          <View style={styles.payerRow}>
            {persons.map((p) => (
              <Pressable
                key={p.id}
                style={[styles.payerChip, payerId === p.id && styles.payerSelected]}
                onPress={() => setPayerId(p.id)}
              >
                <Avatar initials={p.initials} color={p.avatarColor} size="sm" />
                <Text style={[styles.payerName, payerId === p.id && styles.payerNameSelected]}>
                  {p.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Participants */}
        <Text style={styles.sectionTitle}>CHIA VỚI AI?</Text>
        <View style={styles.participantsGrid}>
          {persons.map((p) => {
            const isSelected = selectedPersonIds.includes(p.id);
            return (
              <Pressable
                key={p.id}
                style={[styles.participantChip, isSelected && styles.participantSelected]}
                onPress={() => togglePerson(p.id)}
              >
                <Avatar initials={p.initials} color={isSelected ? p.avatarColor : colors.grey300} size="sm" />
                <Text style={[styles.participantName, !isSelected && styles.participantInactive]}>
                  {p.name}
                </Text>
          </Pressable>
            );
          })}
          <Pressable
            style={styles.addPersonChip}
            onPress={() => setShowAddPerson(true)}
          >
            <Text style={styles.addPersonIcon}>+</Text>
            <Text style={styles.addPersonText}>Thêm</Text>
          </Pressable>
        </View>

        {/* Split type */}
        <Text style={styles.sectionTitle}>CÁCH CHIA</Text>
        <SegmentedControl
          options={SPLIT_LABELS}
          selectedIndex={splitTypeIndex >= 0 ? splitTypeIndex : 0}
          onSelect={(i) => calc.setSplitType(SPLIT_TYPES[i])}
        />

        {/* Results */}
        <View style={styles.results}>
          {calc.results.map((r) => {
            const person = persons.find((p) => p.id === r.personId);
            if (!person) return null;
            return (
              <View key={r.personId} style={styles.resultRow}>
                <Avatar initials={person.initials} color={person.avatarColor} size="sm" />
                <Text style={calc.splitType === 'custom' ? styles.resultNameShort : styles.resultName}>{person.name}</Text>
                {calc.splitType === 'custom' ? (
                  <TextInput
                    style={styles.customInput}
                    value={calc.customAmounts[r.personId] ? String(calc.customAmounts[r.personId]) : ''}
                    onChangeText={(v) => calc.setCustomAmount(r.personId, parseInt(v.replace(/\D/g, ''), 10) || 0)}
                    placeholder="0"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="number-pad"
                  />
                ) : (
                  <Text style={styles.resultAmount}>{formatAmount(r.amount)}</Text>
                )}
              </View>
            );
          })}
        </View>

        {!calc.isValid && calc.splitType === 'custom' && (
          <Text style={styles.warning}>
            Còn thiếu {formatAmount(Math.abs(calc.remainder))}
          </Text>
        )}

        {/* Empty state */}
        {persons.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Chưa có người nào. Thêm người ở tab Summary trước khi chia tiền.
            </Text>
          </Card>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          title="Lưu"
          variant="primary"
          full
          onPress={handleSave}
          disabled={!payerId || calc.results.length === 0 || !calc.isValid || saving}
        />
      </View>

      <AddPersonSheet
        visible={showAddPerson}
        onClose={() => setShowAddPerson(false)}
        onCreated={(person) => {
          setPersons((prev) => [...prev, person]);
          setSelectedPersonIds((prev) => [...prev, person.id]);
        }}
      />
    </View>
  );
};

const BackIcon = () => {
  const { Text: RNText } = require('react-native');
  return <RNText style={{ fontSize: 22, fontWeight: '600', color: colors.textPrimary }}>‹</RNText>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  loading: { flex: 1, backgroundColor: colors.bgPage },
  content: { padding: spacing.xl, paddingBottom: 20 },
  heroSection: { alignItems: 'center', marginBottom: spacing.xxl },
  heroLabel: {
    fontSize: 13, fontWeight: '600', color: colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  heroAmount: { ...typography.displayLg, fontVariant: ['tabular-nums'] },
  sectionTitle: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.textTertiary,
    marginTop: spacing.xl, marginBottom: spacing.md,
  },
  payerScroll: { marginBottom: spacing.sm },
  payerRow: { flexDirection: 'row', gap: spacing.sm },
  payerChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
  },
  payerSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  payerName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  payerNameSelected: { color: colors.accent },
  participantsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  participantChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
  },
  participantSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  participantName: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  participantInactive: { color: colors.textTertiary },
  addPersonChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radius.full, borderWidth: 1.5, borderColor: colors.accent,
    borderStyle: 'dashed',
  },
  addPersonIcon: { fontSize: 18, fontWeight: '600', color: colors.accent },
  addPersonText: { fontSize: 14, fontWeight: '600', color: colors.accent },
  results: { marginTop: spacing.xl, gap: spacing.sm },
  resultRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 12, backgroundColor: colors.bgCard,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
  },
  resultName: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  resultNameShort: { fontSize: 15, fontWeight: '600', color: colors.textPrimary, maxWidth: '40%' },
  resultAmount: {
    fontSize: 15, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, fontVariant: ['tabular-nums'],
  },
  customInput: {
    flex: 1, height: 40, paddingHorizontal: 12,
    backgroundColor: colors.bgSunken, borderRadius: 10,
    fontSize: 15, fontWeight: '600', color: colors.textPrimary,
    textAlign: 'right', fontVariant: ['tabular-nums'],
  },
  warning: {
    fontSize: 13, color: colors.unpaid, fontWeight: '600',
    textAlign: 'center', marginTop: spacing.md,
  },
  emptyCard: { padding: 20, marginTop: spacing.xl },
  emptyText: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
  footer: { padding: spacing.xl, borderTopWidth: 1, borderTopColor: colors.separator },
});

export default SplitScreen;

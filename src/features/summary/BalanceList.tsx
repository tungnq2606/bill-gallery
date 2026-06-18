import { View, Text, StyleSheet } from 'react-native';
import { PersonRow } from '@/shared/components';
import { colors, spacing } from '@/shared/theme';
import { formatAmount } from '@/utils/currency';
import type { BalanceEntry } from '@/utils/balanceCalculator';
import type { Person } from '@/data/types';

interface BalanceListProps {
  entries: BalanceEntry[];
  persons: Person[];
}

const BalanceList = ({ entries, persons }: BalanceListProps) => {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Không có ai nợ</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SỐ DƯ</Text>
      {entries.map((entry) => {
        const person = persons.find((p) => p.id === entry.personId);
        if (!person) return null;
        const isOwed = entry.netBalance > 0;
        return (
          <PersonRow
            key={entry.personId}
            name={person.name}
            initials={person.initials}
            avatarColor={person.avatarColor}
            subtitle={isOwed ? 'Nợ bạn' : 'Bạn nợ'}
            amount={formatAmount(Math.abs(entry.netBalance))}
            amountColor={isOwed ? colors.paid : colors.unpaid}
            borderColor={isOwed ? colors.paid : colors.unpaid}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: spacing.xl, marginTop: spacing.xxl },
  title: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.8,
    textTransform: 'uppercase', color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textTertiary },
});

export default BalanceList;

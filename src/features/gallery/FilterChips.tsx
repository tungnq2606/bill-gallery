import { ScrollView, StyleSheet } from 'react-native';
import { Chip } from '@/shared/components';
import { spacing } from '@/shared/theme';

const FILTERS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'receipt', label: 'Hóa đơn' },
  { key: 'transfer', label: 'Chuyển khoản' },
  { key: 'unsettled', label: 'Chưa trả' },
  { key: 'settled', label: 'Đã trả' },
];

interface FilterChipsProps {
  selected: string;
  onSelect: (key: string) => void;
}

const FilterChips = ({ selected, onSelect }: FilterChipsProps) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.container}
  >
    {FILTERS.map((f) => (
      <Chip
        key={f.key}
        label={f.label}
        selected={selected === f.key}
        onPress={() => onSelect(f.key)}
      />
    ))}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
});

export default FilterChips;

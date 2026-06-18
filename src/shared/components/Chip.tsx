import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/shared/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

const Chip = ({ label, selected = false, onPress }: ChipProps) => (
  <Pressable style={[styles.base, selected && styles.selected]} onPress={onPress}>
    <Text style={[styles.text, selected && styles.selectedText]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  base: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.grey900, borderColor: colors.grey900 },
  text: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  selectedText: { color: colors.white, fontWeight: '600' },
});

export default Chip;

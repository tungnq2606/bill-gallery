import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '@/shared/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const SegmentedControl = ({ options, selectedIndex, onSelect }: SegmentedControlProps) => (
  <View style={styles.container}>
    {options.map((option, index) => (
      <Pressable
        key={option}
        style={[styles.item, index === selectedIndex && styles.active]}
        onPress={() => onSelect(index)}
      >
        <Text style={[styles.text, index === selectedIndex && styles.activeText]}>{option}</Text>
      </Pressable>
    ))}
  </View>
);

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 2, padding: 3, backgroundColor: colors.bgSunken, borderRadius: radius.sm },
  item: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  active: { backgroundColor: colors.bgCard, ...shadows.sm },
  text: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  activeText: { color: colors.textPrimary },
});

export default SegmentedControl;

import { Pressable, StyleSheet } from 'react-native';
import { colors, radius, shadows } from '@/shared/theme';

interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
}

const FAB = ({ icon, onPress }: FABProps) => (
  <Pressable style={({ pressed }) => [styles.fab, pressed && styles.pressed]} onPress={onPress}>
    {icon}
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 84, right: 20,
    width: 58, height: 58, borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.fab, zIndex: 30,
  },
  pressed: { transform: [{ scale: 0.9 }] },
});

export default FAB;

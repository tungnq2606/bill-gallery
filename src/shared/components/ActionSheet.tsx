import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows } from '@/shared/theme';

interface ActionOption {
  icon: string;
  label: string;
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionOption[];
}

const ActionSheet = ({ visible, onClose, options }: ActionSheetProps) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          {options.map((opt, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
              onPress={() => { onClose(); opt.onPress(); }}
            >
              <Text style={styles.optionIcon}>{opt.icon}</Text>
              <Text style={styles.optionLabel}>{opt.label}</Text>
            </Pressable>
          ))}
          <View style={styles.divider} />
          <Pressable
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
            onPress={onClose}
          >
            <Text style={styles.cancelText}>Huỷ</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1, backgroundColor: colors.bgOverlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bgCard,
    borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    paddingTop: 12, paddingHorizontal: spacing.xl,
    ...shadows.sheet,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.grey300,
    alignSelf: 'center', marginBottom: spacing.lg,
  },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingVertical: 16,
  },
  optionPressed: { opacity: 0.6 },
  optionIcon: { fontSize: 22 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.separator, marginVertical: 4 },
  cancelText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, textAlign: 'center', flex: 1 },
});

export default ActionSheet;

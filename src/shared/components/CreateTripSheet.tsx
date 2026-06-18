import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows } from '@/shared/theme';
import TextField from './TextField';
import Button from './Button';
import { useTripStore } from '@/stores/tripStore';

const TRIP_COLORS = [
  '#4C6EF5', '#3B5BDB', '#F76707', '#E8590C',
  '#2F9E44', '#40C057', '#FA5252', '#AE3EC9',
];

interface CreateTripSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CreateTripSheet = ({ visible, onClose }: CreateTripSheetProps) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TRIP_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await useTripStore.getState().createTrip(name.trim(), selectedColor);
    setSaving(false);
    setName('');
    setSelectedColor(TRIP_COLORS[0]);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Tạo chuyến đi</Text>

          <TextField
            label="Tên chuyến đi"
            value={name}
            onChangeText={setName}
            placeholder="Đà Lạt, Hội An..."
          />

          <Text style={styles.label}>Màu</Text>
          <View style={styles.colorRow}>
            {TRIP_COLORS.map((c) => (
              <Pressable
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  selectedColor === c && styles.colorSelected,
                ]}
                onPress={() => setSelectedColor(c)}
              />
            ))}
          </View>

          <View style={styles.gap} />
          <Button
            title="Tạo"
            variant="primary"
            full
            onPress={handleCreate}
            disabled={!name.trim() || saving}
          />
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
  title: {
    fontSize: 20, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, marginBottom: spacing.xl,
  },
  label: {
    fontSize: 12, fontWeight: '500', color: colors.textSecondary,
    marginTop: spacing.lg, marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row', gap: 12, justifyContent: 'center',
  },
  colorDot: {
    width: 32, height: 32, borderRadius: 999,
  },
  colorSelected: {
    borderWidth: 3, borderColor: colors.white,
    shadowColor: '#000', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 4,
  },
  gap: { height: spacing.xl },
});

export default CreateTripSheet;

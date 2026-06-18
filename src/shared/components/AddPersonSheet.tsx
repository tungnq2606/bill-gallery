import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius, shadows } from '@/shared/theme';
import TextField from './TextField';
import Avatar from './Avatar';
import Button from './Button';
import { usePersonStore } from '@/stores/personStore';
import type { Person } from '@/data/types';

const PRESET_COLORS = [
  '#4C6EF5', '#3B5BDB', '#F76707', '#E8590C',
  '#2F9E44', '#40C057', '#FA5252', '#AE3EC9',
];

interface AddPersonSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated?: (person: Person) => void;
}

const AddPersonSheet = ({ visible, onClose, onCreated }: AddPersonSheetProps) => {
  const insets = useSafeAreaInsets();
  const { me } = usePersonStore();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isMe, setIsMe] = useState(false);
  const [saving, setSaving] = useState(false);

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const handleAdd = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const person = await usePersonStore.getState().createPerson(
      name.trim(),
      initials || (name[0]?.toUpperCase() ?? '?'),
      selectedColor,
      isMe,
    );
    setSaving(false);
    setName('');
    setSelectedColor(PRESET_COLORS[0]);
    setIsMe(false);
    onCreated?.(person);
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
          <Text style={styles.title}>Thêm người</Text>

          {/* Preview */}
          <View style={styles.preview}>
            <Avatar initials={initials || '?'} color={selectedColor} size="lg" />
          </View>

          {/* Name */}
          <TextField
            label="Tên"
            value={name}
            onChangeText={setName}
            placeholder="Nguyễn Văn A"
          />

          {/* Color picker */}
          <Text style={styles.label}>Màu</Text>
          <View style={styles.colorRow}>
            {PRESET_COLORS.map((c) => (
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

          {/* Is Me checkbox */}
          {!me && (
            <Pressable style={styles.checkRow} onPress={() => setIsMe(!isMe)}>
              <View style={[styles.checkbox, isMe && styles.checkboxActive]}>
                {isMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkLabel}>Đây là tôi</Text>
            </Pressable>
          )}

          <View style={styles.gap} />
          <Button
            title="Thêm"
            variant="primary"
            full
            onPress={handleAdd}
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
  preview: { alignItems: 'center', marginBottom: spacing.xl },
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
  checkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginTop: spacing.lg, paddingVertical: 8,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: colors.grey400,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  checkmark: { color: '#fff', fontSize: 13, fontWeight: '700' },
  checkLabel: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
  gap: { height: spacing.xl },
});

export default AddPersonSheet;

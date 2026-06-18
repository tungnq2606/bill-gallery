import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, radius } from '@/shared/theme';

interface TextFieldProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  keyboardType?: 'default' | 'numeric' | 'number-pad';
}

const TextField = ({ label, value, onChangeText, placeholder, icon, keyboardType = 'default' }: TextFieldProps) => (
  <View style={styles.field}>
    {label && <Text style={styles.label}>{label}</Text>}
    <View style={styles.box}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
        keyboardType={keyboardType}
      />
    </View>
  </View>
);

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  box: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    height: 48, paddingHorizontal: 14,
    backgroundColor: colors.bgSunken, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  icon: { flexShrink: 0 },
  input: { flex: 1, fontSize: 15, fontWeight: '500', color: colors.textPrimary },
});

export default TextField;

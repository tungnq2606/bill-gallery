import { View, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme';

interface ListRowProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
}

const ListRow = ({ icon, title, subtitle, trailing, onPress }: ListRowProps) => {
  const content = (
    <>
      {icon}
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {trailing && <View style={styles.trail}>{trailing}</View>}
    </>
  );

  if (onPress) {
    return <Pressable style={styles.row} onPress={onPress}>{content}</Pressable>;
  }
  return <View style={styles.row}>{content}</View>;
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingVertical: 10 },
  body: { flex: 1, minWidth: 0 },
  title: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  trail: { flexShrink: 0, flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default ListRow;

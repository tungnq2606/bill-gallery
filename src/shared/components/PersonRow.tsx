import { View, Text, StyleSheet } from 'react-native';
import Avatar from './Avatar';
import { colors, radius } from '@/shared/theme';

interface PersonRowProps {
  name: string;
  initials: string;
  avatarColor: string;
  subtitle?: string;
  amount?: string;
  amountColor?: string;
  borderColor?: string;
}

const PersonRow = ({
  name, initials, avatarColor, subtitle,
  amount, amountColor = colors.textPrimary, borderColor,
}: PersonRowProps) => (
  <View style={[styles.row, borderColor ? { borderLeftWidth: 3, borderLeftColor: borderColor, paddingLeft: 11 } : undefined]}>
    <Avatar initials={initials} color={avatarColor} size="md" />
    <View style={styles.info}>
      <Text style={styles.name}>{name}</Text>
      {subtitle && <Text style={styles.sub}>{subtitle}</Text>}
    </View>
    {amount && <Text style={[styles.amount, { color: amountColor }]}>{amount}</Text>}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 10, paddingHorizontal: 14,
    backgroundColor: colors.bgCard, borderRadius: radius.md, marginBottom: 6,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  amount: { fontSize: 15, fontWeight: '700', fontFamily: 'Outfit-Bold' },
});

export default PersonRow;

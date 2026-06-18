import { View, StyleSheet } from 'react-native';
import { colors } from '@/shared/theme';

interface StatusDotProps {
  status: 'paid' | 'unpaid';
}

const StatusDot = ({ status }: StatusDotProps) => (
  <View style={[styles.dot, { backgroundColor: status === 'paid' ? colors.green500 : colors.orange500 }]} />
);

const styles = StyleSheet.create({
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
});

export default StatusDot;

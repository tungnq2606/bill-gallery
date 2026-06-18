import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { colors, spacing } from '@/shared/theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.desc}>{description}</Text>
    {actionLabel && onAction && (
      <View style={styles.action}>
        <Button title={actionLabel} variant="primary" size="sm" onPress={onAction} />
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingTop: 60,
  },
  icon: { fontSize: 52, marginBottom: 16, opacity: 0.6 },
  title: {
    fontSize: 18, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, marginBottom: 6, textAlign: 'center',
  },
  desc: {
    fontSize: 14, lineHeight: 22, color: colors.textSecondary,
    textAlign: 'center', maxWidth: 260,
  },
  action: { marginTop: spacing.xl },
});

export default EmptyState;

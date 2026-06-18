import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '@/shared/components';
import { colors, typography, spacing } from '@/shared/theme';

const ScanScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Button title="Đóng" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>
      <View style={styles.body}>
        <View style={styles.frame}>
          <Text style={styles.icon}>📷</Text>
          <Text style={styles.text}>Camera sẽ mở ở đây</Text>
          <Text style={styles.sub}>Hướng camera vào hóa đơn</Text>
        </View>
      </View>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Button
          title="Chọn từ thư viện"
          variant="secondary"
          full
          onPress={() => {/* TODO: Image picker */}}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.grey900 },
  header: {
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
  },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 280, height: 380,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  text: { ...typography.title, color: 'rgba(255,255,255,0.8)' },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 6 },
  footer: { padding: spacing.xl },
});

export default ScanScreen;

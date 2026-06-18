import { View, Text, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/shared/components';
import { colors, typography, spacing } from '@/shared/theme';

const ScanScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn hóa đơn.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      router.push({
        pathname: '/review',
        params: { imageUri: asset.uri },
      });
    }
  };

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
          onPress={pickImage}
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

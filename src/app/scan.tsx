import { useState, useRef } from 'react';
import { View, Text, Alert, Pressable, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/shared/components';
import { colors, typography, spacing, radius } from '@/shared/theme';
import { haptics } from '@/utils/haptics';

const ScanScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  const capture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    haptics.medium();
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    setCapturing(false);
    if (photo) {
      setPreviewUri(photo.uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.5,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const confirmImage = () => {
    if (!previewUri) return;
    router.push({ pathname: '/review', params: { imageUri: previewUri } });
    setPreviewUri(null);
  };

  const retake = () => {
    setPreviewUri(null);
  };

  // Image preview mode
  if (previewUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: previewUri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <View style={styles.headerSpacer} />
          <Button title="Đóng" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>
        <View style={[styles.previewFooter, { paddingBottom: insets.bottom + 20 }]}>
          <Pressable style={styles.retakeBtn} onPress={retake}>
            <Text style={styles.retakeText}>Chụp lại</Text>
          </Pressable>
          <Pressable style={styles.confirmBtn} onPress={confirmImage}>
            <Text style={styles.confirmText}>Dùng ảnh này</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Permission not granted yet
  if (!permission?.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.permIcon}>📷</Text>
        <Text style={styles.permText}>Cần quyền camera để chụp hóa đơn</Text>
        <Button title="Cho phép" variant="primary" onPress={requestPermission} />
        <View style={{ height: 8 }} />
        <Button title="Chọn từ thư viện" variant="secondary" onPress={pickImage} />
        <View style={{ height: 4 }} />
        <Button title="Đóng" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>
    );
  }

  // Camera mode
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />

      {/* Top bar */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerSpacer} />
        <Button title="Đóng" variant="ghost" size="sm" onPress={() => router.back()} />
      </View>

      {/* Viewfinder frame */}
      <View style={styles.body}>
        <View style={styles.frame} />
        <Text style={styles.hint}>Hướng camera vào hóa đơn</Text>
      </View>

      {/* Bottom controls */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <Pressable style={styles.galleryBtn} onPress={pickImage}>
          <Text style={styles.galleryIcon}>🖼️</Text>
        </Pressable>

        <Pressable
          style={[styles.captureBtn, capturing && styles.captureBtnActive]}
          onPress={capture}
          disabled={capturing}
        >
          <View style={styles.captureInner} />
        </Pressable>

        <View style={styles.galleryBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { alignItems: 'center', justifyContent: 'center', gap: 16, padding: 40 },
  permIcon: { fontSize: 56, marginBottom: 8 },
  permText: { ...typography.title, color: '#fff', textAlign: 'center', marginBottom: 8 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'flex-end',
    paddingHorizontal: spacing.lg, paddingBottom: 4,
  },
  headerSpacer: { flex: 1 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: {
    width: 280, height: 380,
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 16,
  },
  hint: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 16 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.xl,
  },
  galleryBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  galleryIcon: { fontSize: 22 },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: '#fff',
    padding: 4, alignItems: 'center', justifyContent: 'center',
  },
  captureBtnActive: { opacity: 0.5 },
  captureInner: {
    width: '100%', height: '100%', borderRadius: 30,
    backgroundColor: '#fff',
  },
  // Preview mode
  previewFooter: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: spacing.xl, paddingVertical: spacing.xl,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  retakeBtn: {
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: radius.md, borderWidth: 1.5, borderColor: '#fff',
  },
  retakeText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  confirmBtn: {
    paddingVertical: 14, paddingHorizontal: 28,
    borderRadius: radius.md, backgroundColor: colors.accent,
  },
  confirmText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ScanScreen;

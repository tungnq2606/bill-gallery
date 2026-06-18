import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = 'bill-gallery:onboarded';

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': require('@/assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('@/assets/fonts/Outfit-Medium.ttf'),
    'Outfit-SemiBold': require('@/assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Bold': require('@/assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('@/assets/fonts/Outfit-ExtraBold.ttf'),
  });

  const [isReady, setIsReady] = useState(false);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const value = await AsyncStorage.getItem(ONBOARDING_KEY);
      setHasOnboarded(value === 'true');
      setIsReady(true);
      // Pre-request permissions so picker/camera open instantly
      ImagePicker.requestMediaLibraryPermissionsAsync();
      Camera.requestCameraPermissionsAsync();
    };
    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isReady]);

  if (!fontsLoaded || !isReady) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        {!hasOnboarded && (
          <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
        )}
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="review" />
        <Stack.Screen name="split" />
        <Stack.Screen name="edit-bill" />
      </Stack>
    </>
  );
};

export default RootLayout;

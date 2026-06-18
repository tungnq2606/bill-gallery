import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    'Outfit-Regular': require('@/assets/fonts/Outfit-Regular.ttf'),
    'Outfit-Medium': require('@/assets/fonts/Outfit-Medium.ttf'),
    'Outfit-SemiBold': require('@/assets/fonts/Outfit-SemiBold.ttf'),
    'Outfit-Bold': require('@/assets/fonts/Outfit-Bold.ttf'),
    'Outfit-ExtraBold': require('@/assets/fonts/Outfit-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal' }} />
        <Stack.Screen name="review" />
        <Stack.Screen name="split" />
      </Stack>
    </>
  );
};

export default RootLayout;

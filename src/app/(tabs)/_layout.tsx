import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

const ACCENT = '#3B5BDB';
const TERTIARY = '#ADB5BD';

const TabLayout = () => {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: TERTIARY,
        tabBarLabelStyle: {
          fontWeight: '600',
          fontSize: 10,
        },
        tabBarStyle: {
          borderTopWidth: 0.5,
          borderTopColor: 'rgba(0,0,0,0.05)',
          ...Platform.select({
            ios: {
              backgroundColor: 'rgba(255,255,255,0.92)',
            },
            android: {
              backgroundColor: '#FFFFFF',
              elevation: 0,
            },
          }),
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Gallery',
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
        }}
      />
    </Tabs>
  );
};

export default TabLayout;

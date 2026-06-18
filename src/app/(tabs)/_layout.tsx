import { Tabs } from 'expo-router';
import { Platform, View, Text, StyleSheet } from 'react-native';

const ACCENT = '#3B5BDB';
const TERTIARY = '#ADB5BD';

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <View style={styles.iconWrap}>
    <Text style={[styles.emoji, !focused && styles.emojiInactive]}>{emoji}</Text>
  </View>
);

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
          height: Platform.select({ ios: 85, android: 65 }),
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
          tabBarIcon: ({ focused }) => <TabIcon emoji="🖼️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="trips"
        options={{
          title: 'Trips',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✈️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: 'Summary',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
    </Tabs>
  );
};

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  emoji: { fontSize: 22 },
  emojiInactive: { opacity: 0.5 },
});

export default TabLayout;

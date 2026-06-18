import { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, FAB, CreateTripSheet } from '@/shared/components';
import { colors, spacing } from '@/shared/theme';
import { useTripStore } from '@/stores/tripStore';
import TripCard from '@/features/trips/TripCard';

const TripsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { trips, loading, loadTrips } = useTripStore();
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Trips" large />
      {trips.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>✈️</Text>
          <Text style={styles.emptyTitle}>Chưa có chuyến đi</Text>
          <Text style={styles.emptyDesc}>Tạo trip để nhóm hóa đơn theo chuyến</Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TripCard
              name={item.name}
              coverColor={item.coverColor}
              billCount={item.billCount}
              totalSpent={item.totalSpent}
              onPress={() => router.push(`/trip/${item.id}`)}
            />
          )}
        />
      )}
      <FAB
        icon={<PlusIcon />}
        onPress={() => setShowCreate(true)}
      />
      <CreateTripSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
      />
    </View>
  );
};

const PlusIcon = () => {
  const { Text: RNText } = require('react-native');
  return <RNText style={{ color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</RNText>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  list: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 40, paddingTop: 60,
  },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.6 },
  emptyTitle: {
    fontSize: 18, fontWeight: '700', fontFamily: 'Outfit-Bold',
    color: colors.textPrimary, marginBottom: 6,
  },
  emptyDesc: { fontSize: 14, color: colors.textSecondary, textAlign: 'center' },
});

export default TripsScreen;

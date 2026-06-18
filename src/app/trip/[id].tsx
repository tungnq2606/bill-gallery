import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/shared/components';
import { colors } from '@/shared/theme';
import { useBillStore } from '@/stores/billStore';
import { useTripStore } from '@/stores/tripStore';
import GalleryGrid from '@/features/gallery/GalleryGrid';

const TripDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bills, setFilter, loadBills } = useBillStore();
  const { trips } = useTripStore();

  const trip = trips.find((t) => t.id === id);

  useEffect(() => {
    if (id) {
      setFilter({ tripId: id });
    }
  }, [id]);

  return (
    <View style={styles.container}>
      <ScreenHeader
        title={trip?.name ?? 'Trip'}
        leftIcon={<BackIcon />}
        onBack={() => {
          setFilter({});
          router.back();
        }}
      />
      <GalleryGrid bills={bills} />
    </View>
  );
};

const BackIcon = () => {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, fontWeight: '600', color: '#1A1D26' }}>‹</Text>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
});

export default TripDetailScreen;

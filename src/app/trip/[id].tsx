import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, FAB, ActionSheet } from '@/shared/components';
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
  const [showActions, setShowActions] = useState(false);

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
      <FAB
        icon={<PlusIcon />}
        onPress={() => setShowActions(true)}
      />
      <ActionSheet
        visible={showActions}
        onClose={() => setShowActions(false)}
        options={[
          {
            icon: '📷', label: 'Chụp / Chọn ảnh',
            onPress: () => router.push({ pathname: '/scan', params: { tripId: id } }),
          },
          {
            icon: '✏️', label: 'Nhập tay',
            onPress: () => router.push({ pathname: '/review', params: { tripId: id } }),
          },
        ]}
      />
    </View>
  );
};

const BackIcon = () => {
  const { Text } = require('react-native');
  return <Text style={{ fontSize: 22, fontWeight: '600', color: '#1A1D26' }}>‹</Text>;
};

const PlusIcon = () => {
  const { Text } = require('react-native');
  return <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</Text>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
});

export default TripDetailScreen;

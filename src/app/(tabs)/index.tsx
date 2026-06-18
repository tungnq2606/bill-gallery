import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader, FAB } from '@/shared/components';
import { colors } from '@/shared/theme';
import { useBillStore } from '@/stores/billStore';
import GalleryGrid from '@/features/gallery/GalleryGrid';
import FilterChips from '@/features/gallery/FilterChips';
import type { BillStatus, BillType } from '@/data/types';

const GalleryScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bills, loading, loadBills, setFilter } = useBillStore();
  const [selected, setSelected] = useState('all');

  useEffect(() => {
    loadBills();
  }, []);

  const handleFilter = (key: string) => {
    setSelected(key);
    if (key === 'all') {
      setFilter({});
    } else if (key === 'receipt' || key === 'transfer') {
      setFilter({ type: key as BillType });
    } else if (key === 'settled' || key === 'unsettled') {
      setFilter({ status: key as BillStatus });
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScreenHeader title="Gallery" large />
      <FilterChips selected={selected} onSelect={handleFilter} />
      <GalleryGrid bills={bills} />
      <FAB
        icon={<PlusIcon />}
        onPress={() => router.push('/scan')}
      />
    </View>
  );
};

const PlusIcon = () => {
  const { Text } = require('react-native');
  return <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</Text>;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
});

export default GalleryScreen;

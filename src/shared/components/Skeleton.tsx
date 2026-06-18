import { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '@/shared/theme';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton = ({ width, height, borderRadius = radius.sm, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View
      style={[
        { width: width as number, height, borderRadius, backgroundColor: colors.grey200, opacity },
        style,
      ]}
    />
  );
};

const SkeletonTile = () => (
  <View style={skStyles.tile}>
    <Skeleton width="100%" height={200} borderRadius={radius.md} />
  </View>
);

const SkeletonList = () => (
  <View style={skStyles.list}>
    {[1, 2, 3].map((i) => (
      <View key={i} style={skStyles.row}>
        <Skeleton width={40} height={40} borderRadius={20} />
        <View style={skStyles.rowText}>
          <Skeleton width={120} height={14} />
          <Skeleton width={80} height={12} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={14} />
      </View>
    ))}
  </View>
);

const skStyles = StyleSheet.create({
  tile: { width: '48%', marginBottom: 10 },
  list: { gap: 12, padding: 20 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowText: { flex: 1 },
});

export { Skeleton, SkeletonTile, SkeletonList };
export default Skeleton;

import { View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { colors, radius, shadows, typography } from '@/shared/theme';
import { StatusDot } from '@/shared/components';
import { formatAmountShort } from '@/utils/currency';
import type { Bill, BillAttachment } from '@/data/types';

const TILE_GAP = 10;
const TILE_COLS = 2;
const TILE_WIDTH = (Dimensions.get('window').width - 40 - TILE_GAP) / TILE_COLS;
const TILE_HEIGHT = TILE_WIDTH * 1.3;

interface BillTileProps {
  bill: Bill;
  attachment?: BillAttachment | null;
  onPress: () => void;
}

const CATEGORY_ICONS: Record<string, string> = {
  'cat-food': '🍜',
  'cat-transport': '🚗',
  'cat-shopping': '🛍️',
  'cat-entertainment': '🎬',
  'cat-accommodation': '🏨',
  'cat-utilities': '💡',
  'cat-health': '💊',
  'cat-other': '📦',
};

const BillTile = ({ bill, attachment, onPress }: BillTileProps) => {
  const hasImage = attachment?.uri;
  const icon = bill.categoryId ? CATEGORY_ICONS[bill.categoryId] ?? '📦' : '📦';
  const isPaid = bill.status === 'settled';

  return (
    <Pressable
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
      onPress={onPress}
    >
      {hasImage ? (
        <Image
          source={{ uri: attachment.thumbnailUri ?? attachment.uri }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
      ) : (
        <View style={[styles.placeholder, { backgroundColor: colors.grey100 }]}>
          <Text style={styles.placeholderIcon}>{icon}</Text>
        </View>
      )}

      {/* Status dot */}
      <View style={styles.statusDot}>
        <StatusDot status={isPaid ? 'paid' : 'unpaid'} />
      </View>

      {/* Bottom overlay */}
      <View style={styles.overlay}>
        <Text style={styles.amount}>{formatAmountShort(bill.amount)}</Text>
        {bill.merchant && (
          <Text style={styles.merchant} numberOfLines={1}>{bill.merchant}</Text>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: TILE_WIDTH,
    height: TILE_HEIGHT,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bgCard,
    ...shadows.sm,
  },
  pressed: { transform: [{ scale: 0.96 }] },
  image: { width: '100%', height: '100%' },
  placeholder: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  placeholderIcon: { fontSize: 36, opacity: 0.6 },
  statusDot: {
    position: 'absolute', top: 10, right: 10,
  },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 10,
    paddingTop: 30,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  amount: {
    ...typography.title,
    color: colors.white,
    fontVariant: ['tabular-nums'],
  },
  merchant: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 1,
  },
});

export { TILE_WIDTH, TILE_GAP };
export default BillTile;

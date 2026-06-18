import { useState, useRef } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Dimensions, ViewToken } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from '@/shared/components';
import { colors, typography, spacing, radius } from '@/shared/theme';
import { usePersonStore } from '@/stores/personStore';

const { width } = Dimensions.get('window');

interface Slide {
  icon: string;
  title: string;
  desc: string;
  bg: string;
}

const SLIDES: Slide[] = [
  {
    icon: '📷',
    title: 'Chụp & Lưu',
    desc: 'Chụp ảnh hóa đơn, chuyển khoản. AI tự nhận diện số tiền, nơi mua.',
    bg: '#EDF2FF',
  },
  {
    icon: '✂️',
    title: 'Chia Tiền Dễ',
    desc: 'Chia đều, tùy chỉnh, phần trăm. Theo dõi ai đã trả, ai chưa.',
    bg: '#EBFBEE',
  },
  {
    icon: '📊',
    title: 'Tổng Quan',
    desc: 'Xem tổng chi tiêu, theo chuyến, theo tháng. Mọi thứ trong tầm tay.',
    bg: '#FFF4E6',
  },
];

const AVATAR_COLORS = ['#4C6EF5', '#E64980', '#7950F2', '#20C997', '#F76707', '#FA5252'];

const OnboardingScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createPerson } = usePersonStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<Slide>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const handleGetStarted = async () => {
    // Create default "me" person
    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    await createPerson('Tôi', 'T', randomColor, true);
    await AsyncStorage.setItem('bill-gallery:onboarded', 'true');
    router.replace('/(tabs)');
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      handleGetStarted();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.illustration, { backgroundColor: item.bg }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.textArea}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.desc}>{item.desc}</Text>
            </View>
          </View>
        )}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        <Button
          title={currentIndex === SLIDES.length - 1 ? 'Bắt đầu' : 'Tiếp tục'}
          variant="primary"
          full
          onPress={handleNext}
        />

        {currentIndex < SLIDES.length - 1 && (
          <Pressable onPress={handleGetStarted} style={styles.skipBtn}>
            <Text style={styles.skipText}>Bỏ qua</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgPage },
  slide: { width, flex: 1 },
  illustration: {
    flex: 1, marginHorizontal: spacing.xl, marginTop: spacing.xl,
    borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 80 },
  textArea: { padding: spacing.xxl, paddingTop: spacing.xxxl },
  title: {
    ...typography.displayMd, fontSize: 28,
    color: colors.textPrimary, marginBottom: 10,
  },
  desc: {
    fontSize: 15, lineHeight: 24, color: colors.textSecondary, maxWidth: 300,
  },
  footer: {
    padding: spacing.xxl, alignItems: 'center', gap: 12,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  dot: {
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: colors.grey300,
  },
  dotActive: {
    backgroundColor: colors.accent, width: 20, borderRadius: 4,
  },
  skipBtn: { padding: 8 },
  skipText: { fontSize: 14, fontWeight: '500', color: colors.textTertiary },
});

export default OnboardingScreen;

import { View, Text, StyleSheet } from 'react-native';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  initials: string;
  color: string;
  size?: AvatarSize;
}

const SIZES: Record<AvatarSize, { container: number; font: number }> = {
  sm: { container: 32, font: 12 },
  md: { container: 40, font: 14 },
  lg: { container: 48, font: 16 },
};

const Avatar = ({ initials, color, size = 'md' }: AvatarProps) => {
  const s = SIZES[size];
  return (
    <View style={[styles.base, { width: s.container, height: s.container, backgroundColor: color }]}>
      <Text style={[styles.text, { fontSize: s.font }]}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: { borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#FFFFFF', fontWeight: '700' },
});

export default Avatar;

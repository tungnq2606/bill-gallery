import { View, Text, StyleSheet } from 'react-native';

const GalleryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gallery</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontFamily: 'Outfit-Bold' },
});

export default GalleryScreen;

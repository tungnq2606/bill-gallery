import { View, Text, StyleSheet } from 'react-native';

const SummaryScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Summary</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8F9FA' },
  title: { fontSize: 24, fontFamily: 'Outfit-Bold' },
});

export default SummaryScreen;

import { View, Text, FlatList, StyleSheet } from "react-native";

const sampleFixtures = [
  { id: '1', match: "Team A vs Team B" },
  { id: '2', match: "Team C vs Team D" },
];

export default function FixturesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fixtures</Text>
      <FlatList
        data={sampleFixtures}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.match}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 16 },
  item: { fontSize: 18, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});

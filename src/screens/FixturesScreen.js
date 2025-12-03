import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from "react-native";
import { API_URL } from "../../App";

export default function FixturesScreen({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch(`${API_URL}/fixtures`);
        const data = await response.json();
        setFixtures(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.fixture}
      onPress={() => navigation.navigate("Prediction", { fixture: item.teams })}
    >
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.teams.home.logo }} style={styles.logo} />
        <Text style={styles.teamName}>{item.teams.home.name}</Text>
      </View>
      <Text style={styles.vs}>vs</Text>
      <View style={styles.teamContainer}>
        <Image source={{ uri: item.teams.away.logo }} style={styles.logo} />
        <Text style={styles.teamName}>{item.teams.away.name}</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={fixtures}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  fixture: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    padding: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  teamContainer: { alignItems: "center" },
  logo: { width: 50, height: 50, marginBottom: 4 },
  teamName: { fontWeight: "bold" },
  vs: { fontSize: 18, fontWeight: "bold" },
});

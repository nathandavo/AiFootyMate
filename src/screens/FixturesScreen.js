import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
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

  const renderItem = ({ item }) => {
    const matchDate = new Date(item.fixture.date).toLocaleString();
    return (
      <TouchableOpacity
        style={styles.matchBox}
        onPress={() => navigation.navigate("Prediction", { fixture: item.teams, date: matchDate })}
      >
        <Text style={styles.matchText}>{item.teams.home.name} vs {item.teams.away.name}</Text>
        <Text style={styles.dateText}>{matchDate}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#888" />;

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
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0" },
  matchBox: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
  },
  matchText: { fontWeight: "bold", fontSize: 16, color: "#333" },
  dateText: { marginTop: 4, fontSize: 14, color: "#555" },
});

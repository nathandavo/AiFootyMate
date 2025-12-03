import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";

export default function FixturesScreen({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      const response = await fetch("https://football-predictor-im87.onrender.com/fixtures");
      const data = await response.json();
      setFixtures(data);
    } catch (err) {
      console.log("Error fetching fixtures:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMatch = async (match) => {
    try {
      const response = await fetch("https://football-predictor-im87.onrender.com/predict/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fixtureId: match.fixture.id,
          homeTeam: match.teams.home.name,
          awayTeam: match.teams.away.name,
        }),
      });

      const data = await response.json();

      navigation.navigate("Prediction", {
        match,
        prediction: data.prediction,
      });
    } catch (err) {
      console.log("Prediction error:", err);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gameweek Fixtures</Text>

      <FlatList
        data={fixtures}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectMatch(item)}
          >
            <Text style={styles.teams}>
              {item.teams.home.name} vs {item.teams.away.name}
            </Text>
            <Text style={styles.date}>
              {new Date(item.fixture.date).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

  card: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 12,
  },

  teams: { fontSize: 18, fontWeight: "600" },
  date: { marginTop: 4, color: "#555" },
});

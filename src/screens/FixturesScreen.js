import { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from "react-native";

export default function FixturesScreen({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFixtures(FIXTURE_DATA); // Replace with API later
  }, []);

  const handleSelectMatch = async (match) => {
    try {
      setLoading(true);

      const response = await fetch("https://football-predictor-im87.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home: match.teams.home.name,
          away: match.teams.away.name,
          fixtureId: match.fixture.id,
        }),
      });

      const data = await response.json();
      setLoading(false);

      navigation.navigate("Prediction", {
        match,
        prediction: data.prediction, // ← what your backend returns
      });

    } catch (err) {
      setLoading(false);
      alert("Error contacting prediction server");
      console.log(err);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleSelectMatch(item)}>
      <View style={styles.row}>
        <View style={styles.teamBlock}>
          <Image source={{ uri: item.teams.home.logo }} style={styles.logo} />
          <Text style={styles.teamName}>{item.teams.home.name}</Text>
        </View>

        <Text style={styles.vs}>VS</Text>

        <View style={styles.teamBlock}>
          <Image source={{ uri: item.teams.away.logo }} style={styles.logo} />
          <Text style={styles.teamName}>{item.teams.away.name}</Text>
        </View>
      </View>

      <Text style={styles.date}>{new Date(item.fixture.date).toLocaleString()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upcoming Fixtures</Text>

      {loading && <ActivityIndicator size="large" style={{ marginBottom: 20 }} />}

      <FlatList
        data={fixtures}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 18, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  card: { padding: 14, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  teamBlock: { alignItems: "center", width: "35%" },
  teamName: { marginTop: 5, fontSize: 15, fontWeight: "500", textAlign: "center" },
  logo: { width: 50, height: 50 },
  vs: { fontSize: 18, fontWeight: "bold" },
  date: { marginTop: 10, textAlign: "center", fontSize: 14, color: "#555" },
});

// your JSON data
const FIXTURE_DATA = [
  // paste your fixtures here
];

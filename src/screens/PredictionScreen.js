import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

export default function PredictionScreen() {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [prediction, setPrediction] = useState("");

  // Fetch fixtures from backend
  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const res = await fetch(
          "https://football-predictor-im87.onrender.com/fixtures"
        );
        const data = await res.json();

        setFixtures(data);
      } catch (err) {
        Alert.alert("Error", "Failed to load fixtures");
      } finally {
        setLoading(false);
      }
    };

    fetchFixtures();
  }, []);

  const handlePredict = async () => {
    if (!selected) {
      return Alert.alert("Select a Match", "Please choose a fixture first.");
    }

    try {
      const response = await fetch(
        "https://football-predictor-im87.onrender.com/predict/free",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + global.userToken, // JWT saved on login
          },
          body: JSON.stringify({
            fixtureId: selected.fixture.id,
            homeTeam: selected.teams.home.name,
            awayTeam: selected.teams.away.name,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert("Prediction Error", data.error);
      }

      setPrediction(data.prediction);
    } catch (err) {
      Alert.alert("Error", "Could not connect to server");
      console.log(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Loading fixtures...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Match</Text>

      <ScrollView style={{ maxHeight: "60%" }}>
        {fixtures.map((f) => {
          const isSelected = selected?.fixture.id === f.fixture.id;

          return (
            <TouchableOpacity
              key={f.fixture.id}
              style={[
                styles.fixtureCard,
                isSelected && styles.selectedFixture,
              ]}
              onPress={() => setSelected(f)}
            >
              <Text style={styles.fixtureText}>
                {f.teams.home.name} vs {f.teams.away.name}
              </Text>
              <Text style={styles.dateText}>
                {new Date(f.fixture.date).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>

      {prediction ? (
        <View style={styles.predCard}>
          <Text style={styles.predTitle}>AI Prediction</Text>
          <Text style={styles.prediction}>{prediction}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 15 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  fixtureCard: {
    padding: 14,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  selectedFixture: {
    borderColor: "black",
    backgroundColor: "#e9e9e9",
  },
  fixtureText: { fontSize: 18, fontWeight: "600" },
  dateText: { fontSize: 14, color: "#555" },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 6,
    marginTop: 20,
  },
  buttonText: { color: "white", textAlign: "center", fontSize: 18 },
  predCard: {
    marginTop: 25,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
  },
  predTitle: { fontSize: 22, fontWeight: "bold", marginBottom: 10 },
  prediction: { fontSize: 18, lineHeight: 24 },
});

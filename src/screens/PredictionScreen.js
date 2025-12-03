import { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";

export default function PredictionScreen({ route }) {
  const { fixture } = route.params; // fixture object passed from FixturesScreen
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const token = "YOUR_USER_JWT_TOKEN"; // replace with stored token from login

      const response = await fetch(`${API_URL}/predict/free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fixtureId: fixture.home.id + "-" + fixture.away.id, // optional, depends on backend
          homeTeam: fixture.home.name,
          awayTeam: fixture.away.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.prediction);
      } else {
        Alert.alert("Error", data.error || "Prediction failed");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.teams}>
        <View style={styles.team}>
          <Image source={{ uri: fixture.home.logo }} style={styles.logo} />
          <Text style={styles.teamName}>{fixture.home.name}</Text>
        </View>
        <Text style={styles.vs}>vs</Text>
        <View style={styles.team}>
          <Image source={{ uri: fixture.away.logo }} style={styles.logo} />
          <Text style={styles.teamName}>{fixture.away.name}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
      {prediction ? <Text style={styles.prediction}>{prediction}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, alignItems: "center" },
  teams: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  team: { alignItems: "center" },
  logo: { width: 60, height: 60, marginBottom: 4 },
  teamName: { fontWeight: "bold" },
  vs: { fontSize: 20, fontWeight: "bold", marginHorizontal: 16 },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: { color: "white", fontWeight: "bold" },
  prediction: { marginTop: 20, fontSize: 18, textAlign: "center" },
});

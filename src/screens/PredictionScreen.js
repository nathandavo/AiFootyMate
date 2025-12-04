import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage"; // added

export default function PredictionScreen({ route }) {
  const { fixture, date } = route.params; // fixture object passed from FixturesScreen
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);

  // Get saved JWT token
  useEffect(() => {
    const getToken = async () => {
      const savedToken = await AsyncStorage.getItem("token");
      setToken(savedToken);
    };
    getToken();
  }, []);

  const handlePredict = async () => {
    if (!token) {
      Alert.alert("Login Required", "You must be logged in to get a prediction.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/predict/free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fixtureId: fixture.home.id + "-" + fixture.away.id,
          homeTeam: fixture.home.name,
          awayTeam: fixture.away.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPrediction(data.prediction);
        Alert.alert("Prediction Ready", data.prediction); // show prediction in alert
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
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>{fixture.home.name} vs {fixture.away.name}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} color="#888" />}
      {prediction ? <Text style={styles.prediction}>{prediction}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0", alignItems: "center" },
  matchBox: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    marginBottom: 24,
    alignItems: "center",
  },
  matchText: { fontWeight: "bold", fontSize: 18, color: "#333" },
  dateText: { marginTop: 4, fontSize: 14, color: "#555" },
  button: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  prediction: { marginTop: 20, fontSize: 16, textAlign: "center", color: "#222" },
});

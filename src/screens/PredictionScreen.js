import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium } = route.params;

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const token =
        passedToken || (await AsyncStorage.getItem("userToken"));
      if (!token) {
        Alert.alert("Login Required", "You must be logged in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/predict/free`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fixtureId: fixture.id,
          homeTeam: fixture.home.id,
          awayTeam: fixture.away.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPrediction(data); // SHOW EXACT BACKEND JSON
      } else {
        Alert.alert("Error", data.error || "Prediction failed");
      }
    } catch (err) {
      Alert.alert("Error", "Cannot reach backend");
    } finally {
      setLoading(false);
    }
  };

  const renderDots = (arr) =>
    arr.map((v, i) => {
      let color = "#ccc";
      if (v === "W") color = "#4CAF50";
      if (v === "D") color = "#FFC107";
      if (v === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
          {isPremium ? "PREMIUM USER ⭐" : "FREE USER"}
        </Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>
          {fixture.home.name} vs {fixture.away.name}
        </Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      {/* Predict Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePredict}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#555" />}

      {/* Prediction Output */}
      {prediction && (
        <View style={styles.card}>
          
          <Text style={styles.title}>Score Prediction</Text>
          <Text style={styles.value}>{prediction.score}</Text>

          <Text style={styles.title}>Win Probability</Text>
          <Text style={styles.bar}>{prediction.winBar}</Text>
          <Text style={styles.value}>{prediction.winPct}</Text>

          <Text style={styles.title}>Both Teams To Score</Text>
          <Text style={styles.bar}>{prediction.bttsBar}</Text>
          <Text style={styles.value}>{prediction.bttsPct}</Text>

          <Text style={styles.title}>AI Match Analysis</Text>
          <Text style={styles.reason}>{prediction.reasoning}</Text>

          <Text style={styles.title}>Recent Form (Last 5)</Text>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.home.name}:</Text>
            <View style={styles.dotsRow}>
              {renderDots(prediction.recentForm.home)}
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.away.name}:</Text>
            <View style={styles.dotsRow}>
              {renderDots(prediction.recentForm.away)}
            </View>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#e0e0e0",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backButton: {
    padding: 6,
    backgroundColor: "#444",
    borderRadius: 6,
  },
  backButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  versionText: { color: "#222", fontSize: 12, fontWeight: "bold" },
  matchBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  matchText: { fontSize: 18, fontWeight: "bold" },
  dateText: { color: "#666", marginTop: 4 },
  button: {
    backgroundColor: "#333",
    padding: 15,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
  },
  title: { fontSize: 16, fontWeight: "bold", marginTop: 12 },
  value: { fontSize: 14, marginTop: 4 },
  bar: { fontSize: 20, marginTop: 4 },
  reason: { marginTop: 6, fontSize: 14, color: "#333" },
  formRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  formLabel: { width: 120, fontSize: 14 },
  dotsRow: { flexDirection: "row" },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 4,
  },
});

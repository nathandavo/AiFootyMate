import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium: passedIsPremium } = route.params;

  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const token = passedToken || (await AsyncStorage.getItem("userToken"));
      if (!token) {
        Alert.alert("Login Required", "You must be logged in to get a prediction.");
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
        setPredictionData(data);
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

  // ▌ RENDER RECENT FORM DOTS
  const renderFormDots = (form) =>
    form.map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  // ▌ RENDER AI-GENERATED BAR STRING (🟩🟧🟥…)
  const renderBarSquares = (barString) => (
    <View style={{ flexDirection: "row", marginBottom: 4 }}>
      {barString.split("").map((square, i) => (
        <Text key={i} style={styles.square}>{square}</Text>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>
          {passedIsPremium ? "Premium Version" : "Free Version"}
        </Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>
          {fixture.home.name} vs {fixture.away.name}
        </Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      {/* Prediction Button */}
      <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={loading}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#888" style={{ marginTop: 16 }} />}

      {/* Prediction Output */}
      {predictionData && (
        <View style={styles.predictionCard}>

          {/* Score */}
          <Text style={styles.sectionTitle}>Score Prediction</Text>
          <Text style={styles.predictionText}>{predictionData.score}</Text>

          {/* Reasoning */}
          <Text style={styles.sectionTitle}>AI Match Analysis</Text>
          <Text style={styles.reasoning}>{predictionData.reasoning}</Text>

          {/* WIN BAR */}
          <Text style={styles.sectionTitle}>Win Probability</Text>
          {renderBarSquares(predictionData.winBar)}
          <Text style={styles.barPct}>{predictionData.winPct}</Text>

          {/* BTTS BAR */}
          <Text style={styles.sectionTitle}>Both Teams to Score</Text>
          {renderBarSquares(predictionData.bttsBar)}
          <Text style={styles.barPct}>BTTS: {predictionData.bttsPct}%</Text>

          {/* RECENT FORM */}
          <Text style={styles.sectionTitle}>Recent Form (Last 5)</Text>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.home.name}:</Text>
            <View style={styles.dotsRow}>
              {renderFormDots(predictionData.recentForm.home)}
            </View>
          </View>

          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.away.name}:</Text>
            <View style={styles.dotsRow}>
              {renderFormDots(predictionData.recentForm.away)}
            </View>
          </View>

        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0", alignItems: "center" },

  topBar: { width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  backButton: { backgroundColor: "#555", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6 },
  backButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  versionText: { fontSize: 12, fontWeight: "bold", color: "#333" },

  matchBox: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    marginBottom: 16,
    alignItems: "center",
  },
  matchText: { fontWeight: "bold", fontSize: 18, color: "#333" },
  dateText: { marginTop: 4, fontSize: 14, color: "#555" },

  button: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    marginBottom: 16,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },

  predictionCard: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    marginTop: 10,
  },

  sectionTitle: { fontWeight: "bold", fontSize: 16, marginTop: 12, marginBottom: 4, color: "#111" },
  predictionText: { fontSize: 18, fontWeight: "600", color: "#000" },
  reasoning: { fontSize: 14, color: "#444", marginTop: 4 },

  square: { fontSize: 20, marginRight: 2 },
  barPct: { fontSize: 14, color: "#333", marginBottom: 10 },

  formRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  formLabel: { width: 100, fontSize: 14, fontWeight: "bold", color: "#444" },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },
});

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

  const renderFormDots = (form) =>
    form.map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  const renderWinBar = (homePct, drawPct, awayPct) => {
    const squares = 10;
    const homeSquares = Math.round((homePct / 100) * squares);
    const drawSquares = Math.round((drawPct / 100) * squares);
    const awaySquares = squares - homeSquares - drawSquares;

    return (
      <View style={styles.barRow}>
        {Array.from({ length: homeSquares }).map((_, i) => (
          <View key={`h${i}`} style={[styles.barSquare, { backgroundColor: "#4CAF50" }]} />
        ))}
        {Array.from({ length: drawSquares }).map((_, i) => (
          <View key={`d${i}`} style={[styles.barSquare, { backgroundColor: "#FFA500" }]} />
        ))}
        {Array.from({ length: awaySquares }).map((_, i) => (
          <View key={`a${i}`} style={[styles.barSquare, { backgroundColor: "#F44336" }]} />
        ))}
      </View>
    );
  };

  const renderBttsBar = (bttsPct) => {
    const squares = 10;
    const yesSquares = Math.round((bttsPct / 100) * squares);
    const noSquares = squares - yesSquares;

    return (
      <View style={styles.barRow}>
        {Array.from({ length: yesSquares }).map((_, i) => (
          <View key={`y${i}`} style={[styles.barSquare, { backgroundColor: "#4CAF50" }]} />
        ))}
        {Array.from({ length: noSquares }).map((_, i) => (
          <View key={`n${i}`} style={[styles.barSquare, { backgroundColor: "#F44336" }]} />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>{passedIsPremium ? "Premium Version" : "Free Version"}</Text>
      </View>

      {/* Match Info */}
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>{fixture.home.name} vs {fixture.away.name}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={loading}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} color="#888" />}

      {predictionData && (
        <View style={styles.predictionCard}>
          {/* Score */}
          <Text style={styles.sectionTitle}>Score Prediction</Text>
          <Text style={styles.predictionText}>{predictionData.score}</Text>
          <Text style={styles.explanationText}>{predictionData.explanation}</Text>

          {/* Win Probability */}
          <Text style={styles.sectionTitle}>Win Probability</Text>
          {renderWinBar(
            predictionData.winChances.home,
            predictionData.winChances.draw,
            predictionData.winChances.away
          )}
          <Text style={styles.barLabel}>
            {fixture.home.name}: {predictionData.winChances.home}%, Draw: {predictionData.winChances.draw}%, {fixture.away.name}: {predictionData.winChances.away}%
          </Text>

          {/* BTTS */}
          <Text style={styles.sectionTitle}>Both Teams To Score (BTTS)</Text>
          {renderBttsBar(predictionData.bttsPct)}
          <Text style={styles.barLabel}>{predictionData.bttsPct}% Yes / {100 - predictionData.bttsPct}% No</Text>

          {/* Recent Form */}
          <Text style={styles.sectionTitle}>Recent Form (Last 5 Matches)</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.home.name}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm.home)}</View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.away.name}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm.away)}</View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0", alignItems: "center" },
  topBar: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
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
  },
  sectionTitle: { fontWeight: "bold", fontSize: 16, marginTop: 12, marginBottom: 6, color: "#222" },
  predictionText: { fontSize: 18, fontWeight: "bold", marginBottom: 4, color: "#333" },
  explanationText: { fontSize: 14, marginBottom: 12, color: "#555" },

  formRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  formLabel: { width: 80, fontSize: 14, color: "#555" },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },

  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  barSquare: { width: 20, height: 20, marginHorizontal: 1 },
  barLabel: { fontSize: 12, color: "#333", marginBottom: 8 },
});

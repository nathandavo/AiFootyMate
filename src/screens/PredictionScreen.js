import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium: passedIsPremium } = route.params;
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [winChances, setWinChances] = useState({ home: 0, away: 0, draw: 0 });
  const [recentForm, setRecentForm] = useState({ home: [], away: [] });

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
        setPrediction(data.prediction);

        if (data.stats) {
          const homeForm = data.stats.homeStats.recentForm.slice(-5);
          const awayForm = data.stats.awayStats.recentForm.slice(-5);
          setRecentForm({ home: homeForm, away: awayForm });

          const homeWins = homeForm.filter(f => f === "W").length;
          const awayWins = awayForm.filter(f => f === "W").length;
          const homeDraws = homeForm.filter(f => f === "D").length;
          const awayDraws = awayForm.filter(f => f === "D").length;

          // realistic calculation with smoothing
          let homeScore = homeWins + 0.5 * homeDraws;
          let awayScore = awayWins + 0.5 * awayDraws;
          let drawScore = homeDraws + awayDraws;

          // total must not be zero
          let total = homeScore + awayScore + drawScore || 1;

          let homePct = Math.round((homeScore / total) * 100);
          let awayPct = Math.round((awayScore / total) * 100);
          let drawPct = 100 - homePct - awayPct;

          // enforce minimum draw of 20%
          const minDraw = 20;
          if (drawPct < minDraw) {
            const diff = minDraw - drawPct;
            drawPct = minDraw;
            // reduce home/away proportionally
            const reduceHome = Math.round((homePct / (homePct + awayPct)) * diff);
            const reduceAway = diff - reduceHome;
            homePct = Math.max(0, homePct - reduceHome);
            awayPct = Math.max(0, awayPct - reduceAway);
          }

          setWinChances({ home: homePct, away: awayPct, draw: drawPct });
        }
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
      if (f === "W") color = "#4CAF50"; // green
      else if (f === "D") color = "#FFC107"; // yellow
      else if (f === "L") color = "#F44336"; // red
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  return (
    <View style={styles.container}>
      {/* Top Bar with Back Button & Version Info */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>{passedIsPremium ? "Premium Version" : "Free Version"}</Text>
      </View>

      <View style={styles.matchBox}>
        <Text style={styles.matchText}>{fixture.home.name} vs {fixture.away.name}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={loading}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} color="#888" />}

      {prediction ? (
        <View style={styles.predictionCard}>
          <Text style={styles.sectionTitle}>Score Prediction</Text>
          <Text style={styles.predictionText}>{prediction}</Text>

          <Text style={styles.sectionTitle}>Win Probability</Text>
          <View style={styles.probRow}>
            <Text style={styles.probText}>{fixture.home.name}: {winChances.home}%</Text>
            <Text style={styles.probText}>{fixture.away.name}: {winChances.away}%</Text>
            <Text style={styles.probText}>Draw: {winChances.draw}%</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent Form (Last 5 Matches)</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.home.name}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(recentForm.home)}</View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.away.name}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(recentForm.away)}</View>
          </View>
        </View>
      ) : null}
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
  predictionText: { fontSize: 16, marginBottom: 8, color: "#333" },
  probRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  probText: { fontSize: 14, color: "#555" },
  formRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  formLabel: { width: 80, fontSize: 14, color: "#555" },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },
});

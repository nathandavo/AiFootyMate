import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken } = route.params;
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [winChances, setWinChances] = useState({ home: 0, away: 0, draw: 0 });
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const getUserPremiumStatus = async () => {
      const token = passedToken || (await AsyncStorage.getItem("userToken"));
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await res.json();
        setIsPremium(userData.isPremium);
      } catch (err) {
        console.log("Error fetching user info:", err);
      }
    };

    getUserPremiumStatus();
  }, []);

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

        // Calculate realistic win probabilities
        const homeForm = (data.stats.homeStats.recentForm || []).slice(-5);
        const awayForm = (data.stats.awayStats.recentForm || []).slice(-5);

        const calcWinProb = (homeForm, awayForm) => {
          const homeW = homeForm.filter(f => f === "W").length;
          const homeD = homeForm.filter(f => f === "D").length;

          const awayW = awayForm.filter(f => f === "W").length;
          const awayD = awayForm.filter(f => f === "D").length;

          const homeScore = homeW + 0.5 * homeD;
          const awayScore = awayW + 0.5 * awayD;

          const totalScore = homeScore + awayScore || 1;

          const homePct = Math.round((homeScore / totalScore) * 100);
          const awayPct = Math.round((awayScore / totalScore) * 100);
          const drawPct = 100 - homePct - awayPct;

          return { home: homePct, away: awayPct, draw: drawPct };
        };

        setWinChances(calcWinProb(homeForm, awayForm));

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
    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Fixtures</Text>
      </TouchableOpacity>

      {/* Premium status */}
      <Text style={styles.premiumText}>
        {isPremium ? "Premium Version" : "Free Version"}
      </Text>

      <View style={styles.matchBox}>
        <Text style={styles.matchText}>{fixture.home.name} vs {fixture.away.name}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={loading}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} color="#888" />}

      {prediction ? (
        <View style={styles.predictionBox}>
          <Text style={styles.prediction}>{prediction}</Text>

          <View style={styles.probBox}>
            <Text style={styles.probText}>Win Probability:</Text>
            <Text style={styles.probText}>{fixture.home.name}: {winChances.home}%</Text>
            <Text style={styles.probText}>Draw: {winChances.draw}%</Text>
            <Text style={styles.probText}>{fixture.away.name}: {winChances.away}%</Text>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: "#e0e0e0" },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#555",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    zIndex: 10,
  },
  backButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  premiumText: { marginTop: 16, fontSize: 12, color: "#555", fontWeight: "bold" },
  matchBox: {
    width: "90%",
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
    marginVertical: 24,
    alignItems: "center",
  },
  matchText: { fontWeight: "bold", fontSize: 18, color: "#333" },
  dateText: { marginTop: 4, fontSize: 14, color: "#555" },
  button: {
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    marginBottom: 16,
    width: "90%",
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  predictionBox: { width: "90%", marginTop: 20 },
  prediction: { fontSize: 16, color: "#222", marginBottom: 16, lineHeight: 22 },
  probBox: { backgroundColor: "#f9f9f9", padding: 12, borderRadius: 6, borderWidth: 1, borderColor: "#ccc" },
  probText: { fontSize: 14, color: "#333", marginVertical: 2 },
});

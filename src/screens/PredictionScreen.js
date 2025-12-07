// src/screens/PredictionScreen.js
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium: passedIsPremium } = route.params || {};
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(passedIsPremium ?? false);

  // fetch premium status if not passed
  useEffect(() => {
    const fetchPremium = async () => {
      if (typeof passedIsPremium !== "undefined") {
        setIsPremium(passedIsPremium);
        return;
      }
      const t = passedToken || (await AsyncStorage.getItem("userToken"));
      if (!t) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${t}` },
        });
        const d = await res.json();
        const premiumStatus = d?.isPremium ?? d?.user?.isPremium ?? d?.data?.isPremium ?? false;
        setIsPremium(premiumStatus);
      } catch (err) {
        console.log("Error checking premium:", err);
      }
    };
    fetchPremium();
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
        // Split AI prediction into score (first line) and reasoning (rest)
        let score = "N/A";
        let reasoning = data.prediction || "";
        const lines = reasoning.split(/\n/).filter(l => l.trim() !== "");
        if (lines.length > 0) {
          score = lines[0];
          reasoning = lines.slice(1).join("\n").trim() || reasoning;
        }
        setPredictionData({ ...data, score, reasoning });
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
    (form || []).map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  const renderWinBarSingle = (winChances) => {
    const totalSquares = 10;
    const h = Math.round((winChances.home / 100) * totalSquares);
    const d = Math.round((winChances.draw / 100) * totalSquares);
    let a = Math.round((winChances.away / 100) * totalSquares);
    let sum = h + d + a;
    if (sum !== totalSquares) {
      const diff = totalSquares - sum;
      a = Math.max(0, a + diff);
      sum = h + d + a;
    }

    const squares = [];
    for (let i = 0; i < h; i++) squares.push({ color: "#4CAF50" });
    for (let i = 0; i < d; i++) squares.push({ color: "#FFC107" });
    for (let i = 0; i < a; i++) squares.push({ color: "#F44336" });
    while (squares.length < totalSquares) squares.push({ color: "#ccc" });

    return (
      <View style={styles.barRow}>
        {squares.map((s, i) => (
          <View key={i} style={[styles.barSquare, { backgroundColor: s.color }]} />
        ))}
      </View>
    );
  };

  const renderBttsBar = (bttsPct) => {
    const total = 10;
    const yesCount = Math.round((bttsPct / 100) * total);
    const noCount = total - yesCount;
    const squares = [];
    for (let i = 0; i < yesCount; i++) squares.push({ color: "#4CAF50" });
    for (let i = 0; i < noCount; i++) squares.push({ color: "#F44336" });
    return (
      <View style={styles.barRow}>
        {squares.map((s, i) => (
          <View key={i} style={[styles.barSquare, { backgroundColor: s.color }]} />
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
        <Text style={styles.versionText}>{isPremium ? "Premium" : "Free Version"}</Text>
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

          {/* Win Probability single bar */}
          <Text style={styles.sectionTitle}>Win Probability</Text>
          {renderWinBarSingle(predictionData.winChances)}
          <Text style={styles.percentLine}>
            {fixture.home.name}: {predictionData.winChances.home}%  ·  Draw: {predictionData.winChances.draw}%  ·  {fixture.away.name}: {predictionData.winChances.away}%
          </Text>

          {/* BTTS */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Both Teams To Score</Text>
          {renderBttsBar(predictionData.bttsPct)}
          <Text style={styles.percentLine}>BTTS: {predictionData.bttsPct}%</Text>

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

          {/* AI reasoning */}
          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>AI Analysis</Text>
          <Text style={styles.predictionText}>{predictionData.reasoning}</Text>
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
  predictionText: { fontSize: 16, marginBottom: 8, color: "#333" },

  formRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  formLabel: { width: 100, fontSize: 14, color: "#555" },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },

  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  barSquare: { width: 26, height: 14, marginHorizontal: 1, borderRadius: 3 },
  percentLine: { marginTop: 6, fontSize: 14, color: "#333" },
});

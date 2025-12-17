// src/screens/PredictionScreen.js
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* 🔹 FRONTEND GAMEWEEK HELPER (NO BACKEND CHANGE) */
const getCurrentGW = () => {
  const seasonStart = new Date("2025-08-01");
  const today = new Date();
  const diff = Math.floor((today - seasonStart) / (1000 * 60 * 60 * 24));
  const gw = Math.max(1, Math.min(38, Math.ceil(diff / 7)));
  return `GW${gw}`;
};

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium: passedIsPremium } = route.params || {};

  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(passedIsPremium ?? false);
  const [usedFreeThisWeek, setUsedFreeThisWeek] = useState(false);

  /* 🔹 LOAD USER + FREE PICK STATUS */
  useEffect(() => {
    const loadUserStatus = async () => {
      const token = passedToken || (await AsyncStorage.getItem("userToken"));
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        const premiumStatus =
          data?.isPremium ??
          data?.user?.isPremium ??
          data?.data?.isPremium ??
          false;

        setIsPremium(premiumStatus);

        const gw = getCurrentGW();
        const used =
          data?.freePredictions?.[gw] ??
          data?.user?.freePredictions?.[gw] ??
          false;

        setUsedFreeThisWeek(Boolean(used));
      } catch (err) {
        console.log("Error loading user status:", err);
      }
    };

    loadUserStatus();
  }, []);

  /* 🔹 PREDICT HANDLER */
  const handlePredict = async () => {
    // 🚫 BLOCK FREE USERS BEFORE BACKEND
    if (!isPremium && usedFreeThisWeek) {
      navigation.navigate("Premium");
      return;
    }

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

      if (!response.ok) {
        Alert.alert("Error", data.error || "Prediction failed");
        setLoading(false);
        return;
      }

      setPredictionData({
        score: data.score,
        reasoning: data.reasoning,
        winChances: data.winChances,
        bttsPct: data.bttsPct,
        recentForm: data.recentForm,
      });
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  /* 🔹 UI HELPERS */
  const renderFormDots = (form) =>
    (form || []).map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  const renderBttsBar = (pct) => {
    const total = 10;
    const yes = Math.round((pct / 100) * total);
    const no = total - yes;
    return (
      <View style={styles.barRow}>
        {[...Array(yes)].map((_, i) => (
          <View key={`y${i}`} style={[styles.barSquare, { backgroundColor: "#4CAF50" }]} />
        ))}
        {[...Array(no)].map((_, i) => (
          <View key={`n${i}`} style={[styles.barSquare, { backgroundColor: "#F44336" }]} />
        ))}
      </View>
    );
  };

  /* 🔹 RENDER */
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.versionText}>{isPremium ? "Premium" : "Free Version"}</Text>
      </View>

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
          <Text style={styles.sectionTitle}>Score Prediction</Text>
          <Text style={styles.predictionText}>{predictionData.score}</Text>

          <Text style={styles.sectionTitle}>Both Teams To Score</Text>
          {renderBttsBar(predictionData.bttsPct)}
          <Text style={styles.percentLine}>BTTS: {predictionData.bttsPct}%</Text>

          <Text style={styles.sectionTitle}>Recent Form</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.home.name}</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm.home)}</View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture.away.name}</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm.away)}</View>
          </View>

          <Text style={styles.sectionTitle}>AI Analysis</Text>
          <Text style={styles.predictionText}>{predictionData.reasoning}</Text>
        </View>
      )}
    </View>
  );
}

/* 🔹 STYLES (UNCHANGED) */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0", alignItems: "center" },
  topBar: { width: "100%", flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  backButton: { backgroundColor: "#555", padding: 6, borderRadius: 6 },
  backButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
  versionText: { fontSize: 12, fontWeight: "bold" },

  matchBox: { width: "100%", backgroundColor: "#f0f0f0", padding: 16, borderRadius: 8, marginBottom: 16 },
  matchText: { fontWeight: "bold", fontSize: 18 },
  dateText: { color: "#555" },

  button: { backgroundColor: "#333", padding: 14, borderRadius: 8, width: "100%" },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },

  predictionCard: { width: "100%", backgroundColor: "#f0f0f0", padding: 16, borderRadius: 8, marginTop: 16 },

  sectionTitle: { fontWeight: "bold", marginTop: 12 },
  predictionText: { marginTop: 6 },

  formRow: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  formLabel: { width: 100 },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },

  barRow: { flexDirection: "row", marginVertical: 6 },
  barSquare: { width: 24, height: 14, marginHorizontal: 1, borderRadius: 3 },
  percentLine: { marginTop: 6 },
});

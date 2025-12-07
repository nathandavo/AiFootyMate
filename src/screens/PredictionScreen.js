// src/screens/PredictionScreen.js
import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date, token: passedToken, isPremium: passedIsPremium } = route.params ?? {};
  const [predictionData, setPredictionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(passedIsPremium ?? null); // null = unknown/loading

  useEffect(() => {
    // if passedIsPremium is undefined, try to fetch /auth/me
    const fetchMeIfNeeded = async () => {
      if (passedIsPremium !== undefined) {
        setIsPremium(passedIsPremium);
        return;
      }
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setIsPremium(false);
          return;
        }
        const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` }});
        const data = await res.json();
        const premiumStatus = data?.isPremium ?? data?.user?.isPremium ?? data?.data?.isPremium ?? false;
        setIsPremium(premiumStatus);
      } catch (err) {
        console.log("Could not fetch /auth/me:", err);
        setIsPremium(false);
      }
    };
    fetchMeIfNeeded();
  }, [passedIsPremium]);

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
          fixtureId: fixture?.id,
          homeTeam: fixture?.home?.id,
          awayTeam: fixture?.away?.id,
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
    (form || []).map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  // single 10-block win bar combined: home (green), draw (orange), away (red)
  const renderCombinedWinBar = (homePct, drawPct, awayPct) => {
    // Ensure integers and sum=100
    homePct = Math.max(0, Math.round(homePct || 0));
    drawPct = Math.max(0, Math.round(drawPct || 0));
    awayPct = Math.max(0, Math.round(awayPct || 0));
    // Fix rounding drift
    let sum = homePct + drawPct + awayPct;
    if (sum !== 100) {
      const diff = 100 - sum;
      // add to home by default
      homePct += diff;
      sum = homePct + drawPct + awayPct;
    }
    const totalBlocks = 10;
    const homeBlocks = Math.round((homePct / 100) * totalBlocks);
    const drawBlocks = Math.round((drawPct / 100) * totalBlocks);
    // ensure the blocks sum to totalBlocks
    let awayBlocks = totalBlocks - homeBlocks - drawBlocks;
    if (awayBlocks < 0) awayBlocks = 0;

    const blocks = [];
    for (let i = 0; i < homeBlocks; i++) blocks.push(<View key={`h${i}`} style={[styles.block, { backgroundColor: "#4CAF50" }]} />);
    for (let i = 0; i < drawBlocks; i++) blocks.push(<View key={`d${i}`} style={[styles.block, { backgroundColor: "#FF9800" }]} />);
    for (let i = 0; i < awayBlocks; i++) blocks.push(<View key={`a${i}`} style={[styles.block, { backgroundColor: "#F44336" }]} />);
    // in rare rounding cases, if blocks < totalBlocks, pad with grey
    while (blocks.length < totalBlocks) blocks.push(<View key={`p${blocks.length}`} style={[styles.block, { backgroundColor: "#ccc" }]} />);
    return (
      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <View style={styles.barRow}>{blocks}</View>
        <View style={styles.pctRow}>
          <Text style={styles.pctText}>Home: {homePct}%</Text>
          <Text style={styles.pctText}>Draw: {drawPct}%</Text>
          <Text style={styles.pctText}>Away: {awayPct}%</Text>
        </View>
      </View>
    );
  };

  // BTTS bar: single 10-block (green = yes, red = no)
  const renderBttsBar = (bttsPct) => {
    const yesBlocks = Math.round((bttsPct / 100) * 10);
    const noBlocks = 10 - yesBlocks;
    const blocks = [];
    for (let i = 0; i < yesBlocks; i++) blocks.push(<View key={`y${i}`} style={[styles.blockSmall, { backgroundColor: "#4CAF50" }]} />);
    for (let i = 0; i < noBlocks; i++) blocks.push(<View key={`n${i}`} style={[styles.blockSmall, { backgroundColor: "#F44336" }]} />);
    return (
      <View style={{ alignItems: "center", marginTop: 6 }}>
        <View style={styles.barRowSmall}>{blocks}</View>
        <View style={styles.pctRow}>
          <Text style={styles.pctText}>BTTS Yes: {bttsPct}%</Text>
          <Text style={styles.pctText}>No: {100 - bttsPct}%</Text>
        </View>
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
        <Text style={styles.versionText}>{isPremium ? "Premium Version" : "Free Version"}</Text>
      </View>

      {/* Match info */}
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>{fixture?.home?.name ?? 'Home'} vs {fixture?.away?.name ?? 'Away'}</Text>
        <Text style={styles.dateText}>{date ?? ''}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handlePredict} disabled={loading}>
        <Text style={styles.buttonText}>Get Prediction</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} color="#888" />}

      {predictionData && (
        <View style={styles.predictionCard}>
          {/* Score */}
          <Text style={styles.sectionTitle}>Score Prediction</Text>
          <Text style={styles.predictionText}>{predictionData.score ?? predictionData.explanation ?? 'No score returned'}</Text>

          {/* AI explanation */}
          <Text style={styles.sectionTitle}>AI Explanation</Text>
          <Text style={styles.predictionText}>{predictionData.explanation ?? 'No explanation returned'}</Text>

          {/* Win Probability - single 10-block */}
          <Text style={styles.sectionTitle}>Win Probability</Text>
          {renderCombinedWinBar(predictionData.winChances?.home, predictionData.winChances?.draw, predictionData.winChances?.away)}

          {/* BTTS bar */}
          <Text style={styles.sectionTitle}>BTTS</Text>
          {renderBttsBar(predictionData.bttsPct ?? 0)}

          {/* Recent Form */}
          <Text style={styles.sectionTitle}>Recent Form (Last 5 Matches)</Text>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture?.home?.name ?? 'Home'}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm?.home ?? [])}</View>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>{fixture?.away?.name ?? 'Away'}:</Text>
            <View style={styles.dotsRow}>{renderFormDots(predictionData.recentForm?.away ?? [])}</View>
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
  predictionText: { fontSize: 16, marginBottom: 8, color: "#333" },

  formRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  formLabel: { width: 100, fontSize: 14, color: "#555" },
  dotsRow: { flexDirection: "row" },
  dot: { width: 14, height: 14, borderRadius: 7, marginHorizontal: 2 },

  // Win bar (10 blocks)
  barRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  block: { width: 22, height: 22, marginHorizontal: 2, borderRadius: 3 },

  // BTTS smaller blocks
  barRowSmall: { flexDirection: "row", justifyContent: "center", alignItems: "center", marginBottom: 4 },
  blockSmall: { width: 18, height: 18, marginHorizontal: 2, borderRadius: 3 },

  pctRow: { flexDirection: "row", justifyContent: "space-between", width: "100%", paddingHorizontal: 8 },
  pctText: { fontSize: 13, color: "#333" },

});

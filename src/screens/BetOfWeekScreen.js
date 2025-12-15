import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";

export default function BetOfWeekScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [bet, setBet] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBet = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setError("User token missing. Please log in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_URL}/bet-of-the-week`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const errData = await res.json();
          setError(errData.error || "Failed to fetch Bet of the Week");
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log("Bet data fetched:", data); // <-- Debugging
        setBet(data);
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadBet();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  if (error) {
    return <Text style={{ marginTop: 60, textAlign: "center", color: "red" }}>{error}</Text>;
  }

  if (!bet || !bet.picks || !Array.isArray(bet.picks) || bet.picks.length === 0) {
    return <Text style={{ marginTop: 60, textAlign: "center" }}>No bet available.</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* ✅ Back button to go to Fixtures screen */}
      <TouchableOpacity style={styles.back} onPress={() => navigation.navigate("Fixtures")}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🔥 Ai Pick of the week</Text>

      {bet.picks.map((pick, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.market}>{pick.market || "Market N/A"}</Text>
          <Text style={styles.match}>{pick.match || "Match N/A"}</Text>
          <Text style={styles.selection}>{pick.selection || "Selection N/A"}</Text>
          <Text style={styles.confidence}>
            Confidence: {pick.confidence !== undefined ? pick.confidence + "%" : "N/A"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#e0e0e0" },
  back: { marginBottom: 10 },
  backText: { fontSize: 18, fontWeight: "bold" },
  title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 6 },
  gw: { textAlign: "center", marginBottom: 20, color: "#555" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  market: { fontSize: 16, fontWeight: "bold", color: "#333" },
  match: { fontSize: 15, marginTop: 4 },
  selection: { fontSize: 18, fontWeight: "bold", marginTop: 6 },
  confidence: { marginTop: 6, color: "#006400", fontWeight: "600" },
});

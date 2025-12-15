import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";

export default function BetOfWeekScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [bet, setBet] = useState(null);

  useEffect(() => {
    const loadBet = async () => {
      const token = await AsyncStorage.getItem("userToken");

      const res = await fetch(`${API_URL}/bet-of-the-week`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setBet(data);
      setLoading(false);
    };

    loadBet();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 60 }} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🔥 Bet of the Week</Text>
      <Text style={styles.gw}>{bet.gameweek}</Text>

      {bet.picks.map((pick, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.market}>{pick.market}</Text>
          <Text style={styles.match}>{pick.match}</Text>
          <Text style={styles.selection}>{pick.selection}</Text>
          <Text style={styles.confidence}>Confidence: {pick.confidence}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#e0e0e0" },
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

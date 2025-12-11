import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";

export default function BetOfTheWeekScreen() {
  const [loading, setLoading] = useState(false);
  const [bet, setBet] = useState(null);

  const generateBet = async () => {
    setLoading(true);
    setBet(null);

    const token = await AsyncStorage.getItem("userToken");

    try {
      const fixturesRes = await fetch(`${API_URL}/fixtures/upcoming`); 
      const fixturesData = await fixturesRes.json();

      const res = await fetch(`${API_URL}/bet/weekly`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ fixtures: fixturesData }),
      });

      const data = await res.json();
      setBet(data);
    } catch (err) {
      Alert.alert("Error", "Failed to generate bet");
    }

    setLoading(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Bet Of The Week</Text>

      <TouchableOpacity style={styles.btn} onPress={generateBet}>
        <Text style={styles.btnText}>Generate Best Bet</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" />}

      {bet && (
        <View style={styles.box}>
          <Text style={styles.title}>
            {bet.fixture.home} vs {bet.fixture.away}
          </Text>

          <Text style={styles.line}>Score Prediction: {bet.score}</Text>
          <Text style={styles.line}>BTTS Chance: {bet.bttsPct}%</Text>

          <Text style={styles.subTitle}>Win Chances:</Text>
          <Text>Home: {bet.winChances.home}%</Text>
          <Text>Draw: {bet.winChances.draw}%</Text>
          <Text>Away: {bet.winChances.away}%</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#eee" },
  header: { fontSize: 30, fontWeight: "bold", textAlign: "center", marginBottom: 25 },
  btn: { padding: 14, backgroundColor: "#000", borderRadius: 10, marginBottom: 20 },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "bold", textAlign: "center" },
  box: { backgroundColor: "#fff", padding: 20, borderRadius: 10, marginTop: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  line: { fontSize: 16, marginBottom: 4 },
  subTitle: { marginTop: 10, fontWeight: "bold", fontSize: 16 },
});

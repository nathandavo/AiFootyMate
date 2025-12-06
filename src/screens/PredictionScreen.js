import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PredictionScreen({ route, navigation }) {
  const { fixture, date } = route.params;
  const [prediction, setPrediction] = useState("");
  const [loading, setLoading] = useState(false);
  const [winChances, setWinChances] = useState({ home: 0, away: 0, draw: 0 });
  const [recentForm, setRecentForm] = useState({ home: [], away: [] });
  const [isPremium, setIsPremium] = useState(null); // null = loading

  // Fetch actual user premium status on mount
  useEffect(() => {
    const fetchUserStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (!token) {
          setIsPremium(false);
          return;
        }

        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setIsPremium(data.user.isPremium);
        } else {
          setIsPremium(false);
        }
      } catch (err) {
        console.log("Failed to fetch user info:", err);
        setIsPremium(false);
      }
    };
    fetchUserStatus();
  }, []);

  const handlePredict = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
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
        const homeForm = data.stats?.homeStats?.recentForm?.slice(-5) || [];
        const awayForm = data.stats?.awayStats?.recentForm?.slice(-5) || [];
        setRecentForm({ home: homeForm, away: awayForm });

        setPrediction(data.prediction);

        const homeWins = homeForm.filter(f => f === "W").length;
        const awayWins = awayForm.filter(f => f === "W").length;
        const homeDraws = homeForm.filter(f => f === "D").length;
        const awayDraws = awayForm.filter(f => f === "D").length;

        let homeScore = homeWins + 0.5 * homeDraws || 0;
        let awayScore = awayWins + 0.5 * awayDraws || 0;
        let drawScore = homeDraws + awayDraws || 0;

        let total = homeScore + awayScore + drawScore;
        if (!total || isNaN(total)) total = 1;

        let homePct = Math.round((homeScore / total) * 100);
        let awayPct = Math.round((awayScore / total) * 100);
        let drawPct = 100 - homePct - awayPct;

        const minDraw = 20;
        if (drawPct < minDraw) {
          const diff = minDraw - drawPct;
          drawPct = minDraw;
          const reduceHome = Math.round((homePct / (homePct + awayPct)) * diff);
          const reduceAway = diff - reduceHome;
          homePct = Math.max(0, homePct - reduceHome);
          awayPct = Math.max(0, awayPct - reduceAway);
        }

        setWinChances({ home: homePct, away: awayPct, draw: drawPct });
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

  const renderFormDots = (form = []) =>
    form.map((f, i) => {
      let color = "#ccc";
      if (f === "W") color = "#4CAF50";
      else if (f === "D") color = "#FFC107";
      else if (f === "L") color = "#F44336";
      return <View key={i} style={[styles.dot, { backgroundColor: color }]} />;
    });

  if (isPremium === null) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} color="#888" />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        {/* Free/Premium label removed safely */}
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

// Styles remain the same as before

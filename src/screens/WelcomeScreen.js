import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

export default function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 Welcome to MyFootyAiMate!</Text>
      <Text style={styles.subtitle}>Your ultimate Premier League prediction companion.</Text>

      <View style={styles.bulletContainer}>
        <Text style={styles.bullet}>• Select Upcoming Matches 🏟️</Text>
        <Text style={styles.bulletText}>Pick the Premier League games you want insights on.</Text>

        <Text style={styles.bullet}>• Instant Stats Fetch 📊</Text>
        <Text style={styles.bulletText}>We pull all the latest team & player stats automatically.</Text>

        <Text style={styles.bullet}>• AI-Powered Predictions 🤖</Text>
        <Text style={styles.bulletText}>Get data-driven predictions for every selected match.</Text>

        <Text style={styles.bullet}>• Make Smarter Bets & Fantasy Picks 💡</Text>
        <Text style={styles.bulletText}>Use our insights to improve your football decisions.</Text>

        <Text style={styles.bullet}>• Easy & Intuitive ✅</Text>
        <Text style={styles.bulletText}>Simple interface. Just select, fetch, and see your predictions.</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace("Fixtures")}
      >
        <Text style={styles.buttonText}>Okay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
    color: "#555",
  },
  bulletContainer: {
    marginBottom: 30,
  },
  bullet: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 12,
    color: "#333",
  },
  bulletText: {
    fontSize: 14,
    marginLeft: 12,
    color: "#666",
  },
  button: {
    backgroundColor: "#555",
    padding: 14,
    borderRadius: 6,
    alignSelf: "center",
    minWidth: 120,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
  },
});

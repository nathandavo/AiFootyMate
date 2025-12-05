import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import FixturesScreen from "./src/screens/FixturesScreen";
import PredictionScreen from "./src/screens/PredictionScreen";
import AccountScreen from "./src/screens/AccountScreen"; // <--- ADDED

export const API_URL = "https://football-predictor-im87.onrender.com";

const Stack = createNativeStackNavigator();

function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎯 Welcome to MyFootyAiMate!</Text>
      <Text style={styles.bullet}>• Select Upcoming Matches 🏟️</Text>
      <Text style={styles.description}>Pick the Premier League games you want insights on.</Text>

      <Text style={styles.bullet}>• Instant Stats Fetch 📊</Text>
      <Text style={styles.description}>We pull all the latest team & player stats automatically.</Text>

      <Text style={styles.bullet}>• AI-Powered Predictions 🤖</Text>
      <Text style={styles.description}>Get data-driven predictions for every selected match.</Text>

      <Text style={styles.bullet}>• Make Smarter Bets & Fantasy Picks 💡</Text>
      <Text style={styles.description}>Use our insights to improve your football decisions.</Text>

      <Text style={styles.bullet}>• Easy & Intuitive ✅</Text>
      <Text style={styles.description}>Simple interface. Just select, fetch, and see your predictions.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Fixtures")}
      >
        <Text style={styles.buttonText}>Okay</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Fixtures" component={FixturesScreen} />
        <Stack.Screen name="Prediction" component={PredictionScreen} />
        <Stack.Screen name="Account" component={AccountScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  bullet: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
    marginLeft: 12,
    color: "#555",
  },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 6,
    marginTop: 30,
    alignSelf: "center",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
});

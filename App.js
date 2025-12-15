import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import FixturesScreen from "./src/screens/FixturesScreen";
import PredictionScreen from "./src/screens/PredictionScreen";
import AccountScreen from "./src/screens/AccountScreen";
import PremiumScreen from "./src/screens/PremiumScreen";
import BetOfWeekScreen from "./src/screens/BetOfWeekScreen";

export const API_URL = "https://football-predictor-im87.onrender.com";

const Stack = createNativeStackNavigator();

function WelcomeScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>🎯 Welcome to MyAiFootyMate!</Text>

        <View style={styles.box}>
          <Text style={styles.bullet}>• Select Upcoming Matches 🏟️</Text>
          <Text style={styles.description}>Pick the Premier League games you want insights on.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.bullet}>• Instant Stats Fetch 📊</Text>
          <Text style={styles.description}>We pull all the latest team & player stats automatically.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.bullet}>• AI-Powered Predictions 🤖</Text>
          <Text style={styles.description}>Get data-driven predictions for every selected match.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.bullet}>• Make Smarter Bets & Fantasy Picks 💡</Text>
          <Text style={styles.description}>Use our insights to improve your football decisions.</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.bullet}>• Easy & Intuitive ✅</Text>
          <Text style={styles.description}>Simple interface. Just select, fetch, and see your predictions.</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.replace("Fixtures")}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          ⚠️ Predictions are for informational purposes only. Please gamble responsibly. All decisions are at your own risk. MyFootyAiMate does not guarantee winnings or outcomes.
        </Text>
      </View>
    </ScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Fixtures" component={FixturesScreen} />
        <Stack.Screen name="Prediction" component={PredictionScreen} />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="Premium" component={PremiumScreen} />
        <Stack.Screen name="BetOfWeek" component={BetOfWeekScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: "#e0e0e0" },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  box: {
    borderWidth: 2,
    borderColor: "#333",
    padding: 16,
    borderRadius: 12,
    marginVertical: 8,
    backgroundColor: "#fff",
  },
  bullet: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginLeft: 6,
  },
  button: {
    backgroundColor: "#333",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  disclaimer: {
    marginTop: 16,
    fontSize: 12,
    color: "#999",
    textAlign: "center",
  },
});

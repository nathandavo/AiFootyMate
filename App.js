import { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import FixturesScreen from "./src/screens/FixturesScreen";
import PredictionScreen from "./src/screens/PredictionScreen";

// 🔥 Your backend URL (local or deployed)
export const API_URL = "https://football-predictor-im87.onrender.com";  

const Stack = createNativeStackNavigator();

export default function App() {

  useEffect(() => {
    // Show the welcome alert only once on app load
    Alert.alert(
      "🎯 Welcome to MyFootyAiMate!",
      "Your ultimate Premier League prediction companion.\n\n" +
      "• Select Upcoming Matches 🏟️\nPick the Premier League games you want insights on.\n" +
      "• Instant Stats Fetch 📊\nWe pull all the latest team & player stats automatically.\n" +
      "• AI-Powered Predictions 🤖\nGet data-driven predictions for every selected match.\n" +
      "• Make Smarter Bets & Fantasy Picks 💡\nUse our insights to improve your football decisions.\n" +
      "• Easy & Intuitive ✅\nSimple interface. Just select, fetch, and see your predictions.",
      [
        { text: "Okay", style: "default" }
      ],
      { cancelable: true }
    );
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Fixtures" component={FixturesScreen} />
        <Stack.Screen name="Prediction" component={PredictionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

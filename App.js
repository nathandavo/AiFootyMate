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
    // Delay slightly to make sure app is ready
    const timeout = setTimeout(() => {
      Alert.alert(
        "Welcome to MyFootyAi ⚽",
        "• Select games from each gameweek\n• Your AI friend fetches the stats\n• Get predictions on how the match can go",
        [{ text: "Let's go!" }]
      );
    }, 500); // half-second delay

    return () => clearTimeout(timeout);
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

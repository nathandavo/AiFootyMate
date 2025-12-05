import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";
import { useEffect, useState } from "react";

export default function AccountScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(false);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      setToken(savedToken);

      if (!savedToken) return;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const data = await res.json();
        setIsPremium(data?.user?.isPremium ?? false);
      } catch (err) {
        console.log("Error fetching user:", err);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    Alert.alert("Logged out", "You have been logged out.");
    navigation.navigate("Login"); // go back to login
  };

  const handleGetPremium = () => {
    navigation.navigate("GetPremium"); // Navigate to your purchase screen
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.version}>Version: {isPremium ? "Premium" : "Free"}</Text>

      {!isPremium && (
        <TouchableOpacity style={styles.premiumButton} onPress={handleGetPremium}>
          <Text style={styles.buttonText}>Get Premium</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  version: { fontSize: 18, marginBottom: 20 },
  premiumButton: { backgroundColor: "#ff9900", padding: 12, borderRadius: 8, marginBottom: 10 },
  logoutButton: { backgroundColor: "#333", padding: 12, borderRadius: 8 },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
});

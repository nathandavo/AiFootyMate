import Constants from "expo-constants";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";

const API_URL = Constants?.expoConfig?.extra?.apiUrl ?? null;

console.log("🔍 API_URL:", API_URL);

export default function PremiumScreen({ navigation }) {
  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/stripe/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      console.log("🔍 Response status:", response.status);

      const data = await response.json();
      console.log("🔍 Response JSON:", data);

      if (data?.url) {
        Linking.openURL(data.url);
      }
    } catch (err) {
      console.log("❌ Front-end payment error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Fixtures")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Upgrade to Premium</Text>

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay & Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#333", padding: 16, borderRadius: 8 },
  buttonText: { color: "#fff" },
  backButton: { position: "absolute", top: 20, left: 20 },
  backText: { color: "white" },
});

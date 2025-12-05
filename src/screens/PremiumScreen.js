import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { API_URL } from "../../App";

export default function PremiumScreen() {

  const openStripeCheckout = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert("Error", "Cannot open payment link");
    }
  };

  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.url) {
        await openStripeCheckout(data.url);
      } else {
        Alert.alert("Error", "Failed to create payment session");
      }
    } catch (err) {
      console.log("Payment error:", err);
      Alert.alert("Error", "Something went wrong with payment");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upgrade to Premium</Text>
      <Text style={styles.info}>
        Unlock premium features like advanced predictions, win probabilities, and AI insights for all matches.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay & Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#e0e0e0" },
  header: { fontSize: 28, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  info: { fontSize: 16, marginBottom: 40, textAlign: "center", color: "#333" },
  button: { backgroundColor: "#333", padding: 16, borderRadius: 8 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", textAlign: "center" },
});

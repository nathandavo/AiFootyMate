import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking } from "react-native";
import { API_URL } from "../../App";

export default function PremiumScreen({ navigation }) {
  const handlePayment = async () => {
    try {
      const response = await fetch(`${API_URL}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data?.url) {
        const supported = await Linking.canOpenURL(data.url);
        if (supported) {
          await Linking.openURL(data.url);
        } else {
          Alert.alert("Error", "Cannot open payment link");
        }
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
      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay & Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#333", padding: 15, borderRadius: 8 },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

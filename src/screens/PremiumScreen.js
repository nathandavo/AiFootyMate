import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking } from "react-native";
import { API_URL } from "../../App";

export default function PremiumScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.url) {
        try {
          await Linking.openURL(data.url);
        } catch {
          Alert.alert("Error", "Cannot open payment link");
        }
      } else {
        Alert.alert("Error", "Failed to create payment session");
      }
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Something went wrong with payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Upgrade to Premium</Text>
      <TouchableOpacity style={styles.button} onPress={handlePayment} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Pay & Upgrade</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  button: { backgroundColor: "#333", padding: 15, borderRadius: 8, minWidth: 150, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

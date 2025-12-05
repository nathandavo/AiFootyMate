import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";

export default function PremiumScreen({ navigation }) {
  const [isPremium, setIsPremium] = useState(null); // null = loading

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        setIsPremium(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const premiumStatus =
          data?.isPremium ??
          data?.user?.isPremium ??
          data?.data?.isPremium ??
          false;
        setIsPremium(premiumStatus);
      } catch (err) {
        console.log("Error fetching user info:", err);
        setIsPremium(false);
      }
    };

    fetchUser();
  }, []);

  if (isPremium === null) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} color="#888" />;
  }

  if (isPremium) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>You are already a Premium user ⭐</Text>
      </View>
    );
  }

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
        Unlock premium feature and get predictions for all matches.
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

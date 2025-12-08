import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking } from "react-native";
import { API_URL } from "../../App";

export default function PremiumScreen({ navigation }) {
  
  const openStripeCheckout = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handlePayment = async () => {
    try {
      console.log("🔍 FRONTEND: Calling backend:", `${API_URL}/stripe/payment`);

      const response = await fetch(`${API_URL}/stripe/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();
      console.log("🔍 FRONTEND stripe response:", data);

      if (data.url) {
        openStripeCheckout(data.url);
      }
    } catch (err) {
      console.log("⚠️ Payment error:", err);
    }
  };

  return (
    <View style={styles.container}>

      {/* ✅ BACK BUTTON RESTORED */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Fixtures")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Upgrade to Premium</Text>
      <Text style={styles.info}>
        Unlock premium features and get predictions for all matches.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handlePayment}>
        <Text style={styles.buttonText}>Pay & Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: 24, 
    backgroundColor: "#e0e0e0" 
  },
  header: { 
    fontSize: 28, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center" 
  },
  info: { 
    fontSize: 16, 
    marginBottom: 40, 
    textAlign: "center", 
    color: "#333" 
  },
  button: { 
    backgroundColor: "#333", 
    padding: 16, 
    borderRadius: 8 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold", 
    textAlign: "center" 
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#555",
    borderRadius: 6,
    zIndex: 10,
  },
  backText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 14 
  },
});

import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../../App";

export default function AccountScreen({ navigation, route }) {
  const [isPremium, setIsPremium] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

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

        const userEmail =
          data?.email ??
          data?.user?.email ??
          data?.data?.email ??
          "";

        setEmail(userEmail);
      } catch (err) {
        console.log("Error loading user info:", err);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    Alert.alert("Logged Out", "You have been logged out.");
    navigation.reset({
      index: 0,
      routes: [{ name: "Fixtures" }],
    });
  };

  return (
    <View style={styles.container}>
      
      {/* 🔙 Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.navigate("Fixtures")}
      >
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>My Account</Text>

      {email ? (
        <Text style={styles.emailText}>{email}</Text>
      ) : null}

      <View style={styles.box}>
        <Text style={styles.label}>Account Type:</Text>
        <Text style={styles.value}>
          {isPremium ? "⭐ Premium" : "Free Version"}
        </Text>
      </View>

      {!isPremium && (
        <TouchableOpacity 
          style={styles.upgradeButton} 
          onPress={() => navigation.navigate("Premium")}
        >
          <Text style={styles.upgradeText}>Upgrade to Premium</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0e0e0", padding: 20 },

  /* 🔙 Back button style */
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  backText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
  },

  header: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  emailText: { fontSize: 17, textAlign: "center", marginBottom: 10, color: "#333" },
  box: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
  },
  label: { fontSize: 16, fontWeight: "bold", color: "#555" },
  value: { marginTop: 6, fontSize: 18, fontWeight: "bold", color: "#222" },
  upgradeButton: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  upgradeText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "#b30000",
    padding: 12,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});

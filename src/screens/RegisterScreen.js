import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter both email and password");
    }

    try {
      const response = await fetch(
        "https://football-predictor-im87.onrender.com/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert("Registration Error", data.error || "Something went wrong");
      }

      if (data.token) {
        await AsyncStorage.setItem("userToken", data.token); // save token
        Alert.alert("Success", "Account created successfully!");
      }

      navigation.navigate("Fixtures"); // go to Fixtures after registration
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Cannot connect to backend");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Fixtures")}
      >
        <Text style={styles.backButtonText}>Back to Fixtures</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={{ marginTop: 18, textAlign: "center" }}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  backButton: { position: "absolute", top: 40, left: 20, backgroundColor: "#555", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  backButtonText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 28 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 6, marginBottom: 12 },
  button: { backgroundColor: "black", padding: 14, borderRadius: 6, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
});

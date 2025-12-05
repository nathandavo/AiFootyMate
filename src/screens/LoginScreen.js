import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Error", "Please enter both email and password");
    }

    try {
      const response = await fetch(
        "https://football-predictor-im87.onrender.com/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return Alert.alert("Login Error", data.error || "Something went wrong");
      }

      const token = data.token;
      if (token) {
        await AsyncStorage.setItem("userToken", token); // Save token
        Alert.alert("Success", "Logged in successfully!");
      }

      navigation.navigate("Fixtures"); // go to Fixtures after login
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

      <Text style={styles.title}>MyFootyAiMate</Text>

      <View style={styles.inputBox}>
        <TextInput
          placeholder="Email"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputBox}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.registerText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", justifyContent: "center", padding: 24 },
  backButton: { position: "absolute", top: 40, left: 20, backgroundColor: "#555", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  backButtonText: { color: "#fff", fontWeight: "600" },
  title: { fontSize: 32, fontWeight: "bold", textAlign: "center", marginBottom: 28, color: "#222" },
  inputBox: { backgroundColor: "#e0e0e0", borderColor: "#999", borderWidth: 1, borderRadius: 8, marginBottom: 12, paddingHorizontal: 10 },
  input: { height: 48, color: "#000" },
  button: { backgroundColor: "#555", padding: 14, borderRadius: 8, marginTop: 10 },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
  registerText: { marginTop: 18, textAlign: "center", color: "#333", fontWeight: "500" },
});


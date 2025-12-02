import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function PredictionScreen() {
  const [match, setMatch] = useState("");
  const [prediction, setPrediction] = useState("");

  const handlePredict = () => {
    setPrediction("Prediction not connected yet"); // backend comes later
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get Prediction</Text>

      <TextInput
        placeholder="Enter Match"
        style={styles.input}
        value={match}
        onChangeText={setMatch}
      />

      <TouchableOpacity style={styles.button} onPress={handlePredict}>
        <Text style={styles.buttonText}>Predict</Text>
      </TouchableOpacity>

      {prediction ? <Text style={styles.prediction}>{prediction}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 24 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "black",
    padding: 14,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "600" },
  prediction: { marginTop: 20, fontSize: 20, fontWeight: "bold" },
});


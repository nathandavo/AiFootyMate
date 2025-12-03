import { View, Text, StyleSheet } from "react-native";

export default function PredictionScreen({ route }) {
  const { match, prediction } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prediction</Text>

      <Text style={styles.teams}>
        {match.teams.home.name} vs {match.teams.away.name}
      </Text>

      <Text style={styles.pred}>{prediction}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 32, textAlign: "center", marginBottom: 20 },
  teams: { fontSize: 22, fontWeight: "600", textAlign: "center", marginBottom: 15 },
  pred: { fontSize: 20, textAlign: "center", marginTop: 20, padding: 10 },
});

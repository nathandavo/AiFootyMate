import { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { API_URL } from "../../App";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FixturesScreen({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const fetchFixtures = async () => {
      try {
        const response = await fetch(`${API_URL}/fixtures`);
        const data = await response.json();
        setFixtures(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    const getToken = async () => {
      const savedToken = await AsyncStorage.getItem("userToken");
      setToken(savedToken);

      // Optionally, fetch user info to check premium status
      if (savedToken) {
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${savedToken}` },
          });
          const userData = await res.json();
          setIsPremium(userData.isPremium);
        } catch (err) {
          console.log(err);
        }
      }
    };

    fetchFixtures();
    getToken();
  }, []);

  const handlePredict = (fixture) => {
    if (!token) {
      Alert.alert(
        "Login Required",
        "You must be logged in to get a prediction.",
        [
          { text: "Cancel" },
          { text: "Login/Register", onPress: () => navigation.navigate("Login") },
        ]
      );
      return;
    }

    navigation.navigate("Prediction", {
      fixture: fixture.teams,
      date: new Date(fixture.fixture.date).toLocaleString(),
      token,
    });
  };

  const renderItem = ({ item }) => {
    const matchDate = new Date(item.fixture.date).toLocaleString();
    return (
      <View style={styles.matchBox}>
        <Text style={styles.matchText}>
          {item.teams.home.name} vs {item.teams.away.name}
        </Text>
        <Text style={styles.dateText}>{matchDate}</Text>
        <TouchableOpacity style={styles.button} onPress={() => handlePredict(item)}>
          <Text style={styles.buttonText}>Get Prediction</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} color="#888" />;

  return (
    <View style={styles.container}>
      {/* Top-right account/status button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => {
          if (token) {
            Alert.alert("Account Info", isPremium ? "Premium Version" : "Free Version");
          } else {
            navigation.navigate("Login");
          }
        }}
      >
        <Text style={styles.loginButtonText}>
          {token ? (isPremium ? "Premium" : "Free Version") : "Login/Register"}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={fixtures}
        keyExtractor={(item) => item.fixture.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#e0e0e0" },
  matchBox: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    marginVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#999",
  },
  matchText: { fontWeight: "bold", fontSize: 16, color: "#333" },
  dateText: { marginTop: 4, fontSize: 14, color: "#555" },
  button: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  buttonText: { color: "white", fontWeight: "bold", textAlign: "center" },
  loginButton: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#555",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  loginButtonText: { color: "white", fontSize: 12, fontWeight: "bold" },
});

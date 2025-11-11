import { StyleSheet, Text, View } from "react-native";

export default function StatisticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Статистика</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    fontWeight: "600",
  },
});

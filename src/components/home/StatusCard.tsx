import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { CycleStatus } from "@/src/types/cycle";

interface StatusCardProps {
  cycleStatus: CycleStatus;
}

const StatusCardComponent = ({ cycleStatus }: StatusCardProps) => {
  return (
    <LinearGradient
      colors={["#FFE4E9", "#FFD4DD"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>💗</Text>
      </View>
      <View style={styles.content}>
        <Text style={[typography.caption, styles.subtitle]}>
          Текущий статус
        </Text>
        <Text style={[typography.body, styles.dayText]}>
          День цикла: {cycleStatus.currentDay}
        </Text>
        <Text style={[typography.h3, styles.statusText]}>
          {cycleStatus.phaseDisplayName}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 24,
    borderRadius: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  subtitle: {
    color: colors.text.light,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  dayText: {
    color: colors.text.dark,
    fontWeight: "600",
  },
  statusText: {
    color: colors.text.dark,
    fontWeight: "700",
  },
});

export const StatusCard = memo(StatusCardComponent);

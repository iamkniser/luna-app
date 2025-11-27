import { LinearGradient } from "expo-linear-gradient";
import { memo, useMemo } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { CycleStatus } from "@/src/types/cycle";

interface StatusCardProps {
  cycleStatus: CycleStatus;
}

export const getPhaseStyles = (phase: CycleStatus["phase"]) => {
  switch (phase) {
    case "menstruation":
      return {
        gradient: ["#FFE4E9", "#FFD4DD"] as const,
        icon: "🩸",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "follicular":
      return {
        gradient: ["#FFE9F7", "#F8D9FF"] as const,
        icon: "💗",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "ovulation":
      return {
        gradient: ["#E3FFE8", "#C8F7D8"] as const,
        icon: "✨",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "luteal":
      return {
        gradient: ["#FFF6D9", "#FFE9B8"] as const,
        icon: "☀️",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    default:
      return {
        gradient: ["#FFE4E9", "#FFD4DD"] as const,
        icon: "💗",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
  }
};

const StatusCardComponent = ({ cycleStatus }: StatusCardProps) => {
  const phaseStyles = useMemo(
    () => getPhaseStyles(cycleStatus.phase),
    [cycleStatus.phase]
  );

  return (
    <View style={styles.shadowCard}>
      <LinearGradient
        colors={phaseStyles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: phaseStyles.iconBackground },
          ]}
        >
          <Text style={styles.icon}>{phaseStyles.icon}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[typography.caption, styles.subtitle]}>
            Текущий статус
          </Text>
          <Text
            style={[
              typography.body,
              styles.dayText,
              { color: phaseStyles.textColor },
            ]}
          >
            День цикла: {cycleStatus.currentDay}
          </Text>
          <Text
            style={[
              typography.h3,
              styles.statusText,
              { color: phaseStyles.textColor },
            ]}
          >
            {cycleStatus.phaseDisplayName}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const shadowCard = {
  borderRadius: 24,
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
    },
    android: {
      elevation: 4,
    },
  }),
};

const styles = StyleSheet.create({
  shadowCard: {
    ...shadowCard,
  },
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
    fontSize: 28,
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

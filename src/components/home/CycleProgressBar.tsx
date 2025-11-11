import { LinearGradient } from "expo-linear-gradient";
import { memo } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/src/constants/colors";

interface CycleProgressBarProps {
  currentDay: number;
  totalDays: number;
}

const CycleProgressBarComponent = ({
  currentDay,
  totalDays,
}: CycleProgressBarProps) => {
  const clampedTotal = Math.max(totalDays, 1);
  const progress = Math.min(Math.max(currentDay / clampedTotal, 0), 1);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#FFE4E9", "#A855F7"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.progress, { width: `${progress * 100}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    marginTop: 16,
  },
  progress: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});

export const CycleProgressBar = memo(CycleProgressBarComponent);

import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface CycleParameterProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const CycleParameterComponent = ({
  label,
  value,
  isLast,
}: CycleParameterProps) => {
  return (
    <View style={[styles.row, isLast && styles.lastRow]}>
      <Text style={[typography.body, styles.label]}>{label}</Text>
      <Text style={[typography.body, styles.value]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    color: colors.text.light,
    opacity: 0.9,
    fontSize: 14,
  },
  value: {
    color: colors.text.dark,
    fontWeight: "600",
    fontSize: 14,
  },
});

export const CycleParameter = memo(CycleParameterComponent);

import { ReactElement } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface InfoBoxProps {
  icon?: string;
  text: string;
  variant?: "info" | "warning";
}

const variantColors = {
  info: {
    background: "#F3E8FF",
    text: colors.primaryDark,
  },
  warning: {
    background: "#FEF3C7",
    text: "#92400E",
  },
} as const;

const InfoBox = ({
  icon = "💜",
  text,
  variant = "info",
}: InfoBoxProps): ReactElement => {
  const palette = variantColors[variant];

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[typography.caption, styles.text, { color: palette.text }]}>
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  icon: {
    fontSize: 20,
    marginTop: 2,
  },
  text: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default InfoBox;


import { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";

interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

export const SettingsSection = ({ title, children }: SettingsSectionProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
});

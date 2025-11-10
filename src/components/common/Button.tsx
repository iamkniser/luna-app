import { ReactElement } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
}

const SHADOW_IOS: ViewStyle = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 1,
  shadowRadius: 20,
};

const SHADOW_ANDROID: ViewStyle = {
  elevation: 8,
};

const Button = ({
  title,
  onPress,
  variant = "primary",
  fullWidth = true,
}: ButtonProps): ReactElement => {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[typography.body, styles.label]}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    ...SHADOW_IOS,
    ...SHADOW_ANDROID,
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  label: {
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default Button;

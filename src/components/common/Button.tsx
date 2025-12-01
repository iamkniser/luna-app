import { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface ButtonProps {
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "magenta"
    | "cardGhost";
  fullWidth?: boolean;
  disabled?: boolean;
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
  icon,
  onPress,
  variant = "primary",
  fullWidth = true,
  disabled = false,
}: ButtonProps): ReactElement => {
  const buttonVariantStyle =
    variant === "secondary"
      ? styles.secondary
      : variant === "danger"
      ? styles.danger
      : variant === "magenta"
      ? styles.magenta
      : variant === "cardGhost"
      ? styles.cardGhost
      : styles.primary;

  const labelVariantStyle =
    variant === "secondary"
      ? styles.secondaryLabel
      : variant === "danger"
      ? styles.dangerLabel
      : variant === "cardGhost"
      ? styles.cardGhostLabel
      : styles.primaryLabel;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.fullWidth,
        buttonVariantStyle,
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text style={[typography.body, styles.labelBase, labelVariantStyle]}>
          {title}
        </Text>
      </View>
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
  magenta: {
    backgroundColor: "#E63FA3",
    height: 48,
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  cardGhost: {
    backgroundColor: "#FFE7D1",
    borderWidth: 1,
    borderColor: "#FFC999",
    height: 48,
  },
  labelBase: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  primaryLabel: {
    color: colors.white,
  },
  secondaryLabel: {
    color: colors.primary,
  },
  dangerLabel: {
    color: colors.danger,
  },
  cardGhostLabel: {
    color: colors.text.primary,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconWrapper: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
});

export default Button;

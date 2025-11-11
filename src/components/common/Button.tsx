import { ReactElement } from "react";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface ButtonProps {
  title: string;
  icon?: React.ReactNode;
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
  icon,
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
      <View style={styles.content}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        <Text
          style={[
            typography.body,
            styles.label,
            variant === "secondary" && styles.secondaryLabel,
          ]}
        >
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
  secondaryLabel: {
    color: colors.primary,
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
  pressed: {
    opacity: 0.8,
  },
});

export default Button;

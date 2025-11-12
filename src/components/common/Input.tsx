import { ReactElement, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  required?: boolean;
  variant?: "filled" | "subtle";
}

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  required = false,
  variant = "filled",
}: InputProps): ReactElement => {
  const [isFocused, setIsFocused] = useState(false);

  const variantStyle =
    variant === "subtle" ? styles.inputSubtle : styles.inputFilled;
  const variantFocusedStyle =
    variant === "subtle"
      ? styles.inputSubtleFocused
      : styles.inputFilledFocused;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required ? " *" : ""}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.light}
        keyboardType={keyboardType}
        style={[
          styles.inputBase,
          variantStyle,
          isFocused && [styles.inputFocusedBase, variantFocusedStyle],
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  inputBase: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text.primary,
  },
  inputFilled: {
    backgroundColor: colors.white,
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  inputSubtle: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputFocusedBase: {
    borderWidth: 1,
  },
  inputFilledFocused: {
    borderColor: colors.primary,
    elevation: 4,
    shadowOpacity: 0.3,
  },
  inputSubtleFocused: {
    borderColor: colors.primary,
  },
});

export default Input;

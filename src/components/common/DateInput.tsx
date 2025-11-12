import DateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ReactElement, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

interface DateInputProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
  variant?: "filled" | "subtle";
}

const pickerStyle: ViewStyle =
  Platform.select({
    ios: {
      backgroundColor: colors.white,
    },
    default: {},
  }) ?? {};

const DateInput = ({
  label,
  value,
  onChange,
  variant = "filled",
}: DateInputProps): ReactElement => {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange: IOSNativeProps["onChange"] &
    AndroidNativeProps["onChange"] = (_, selectedDate) => {
    if (selectedDate) {
      onChange(selectedDate);
    }
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }
  };

  const formatted = format(value, "dd.MM.yyyy", { locale: ru });

  const variantStyle =
    variant === "subtle" ? styles.inputSubtle : styles.inputFilled;
  const variantPressedStyle =
    variant === "subtle"
      ? styles.inputSubtlePressed
      : styles.inputFilledPressed;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => setShowPicker(true)}
        style={({ pressed }) => [
          styles.inputBase,
          variantStyle,
          pressed && [styles.pressedBase, variantPressedStyle],
        ]}
      >
        <Text style={styles.value}>{formatted}</Text>
      </Pressable>

      {showPicker &&
        (Platform.OS === "ios" ? (
          <View style={styles.modalContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Выбери дату</Text>
              <Pressable onPress={() => setShowPicker(false)}>
                <Text style={styles.doneButton}>Готово</Text>
              </Pressable>
            </View>
            <DateTimePicker
              display="spinner"
              value={value}
              mode="date"
              locale="ru-RU"
              maximumDate={new Date()}
              style={[styles.picker, pickerStyle]}
              onChange={handleChange}
            />
          </View>
        ) : (
          <DateTimePicker
            value={value}
            mode="date"
            display="calendar"
            maximumDate={new Date()}
            onChange={handleChange}
          />
        ))}
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
    justifyContent: "center",
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
  pressedBase: {
    opacity: 0.9,
  },
  inputFilledPressed: {
    elevation: 4,
    shadowOpacity: 0.3,
  },
  inputSubtlePressed: {
    borderColor: colors.primary,
  },
  value: {
    fontSize: 16,
    color: colors.text.primary,
  },
  modalContainer: {
    marginTop: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryDark,
  },
  picker: {
    width: "100%",
  },
});

export default DateInput;

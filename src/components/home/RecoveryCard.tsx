import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Button from "@/src/components/common/Button";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { User } from "@/src/types/user";

interface RecoveryCardProps {
  user: User;
  onPeriodStarted: (date: Date) => void;
  onNoPeriod: () => void;
}

const clampDate = (date: Date, min: Date, max: Date) => {
  if (date < min) return min;
  if (date > max) return max;
  return date;
};

export const RecoveryCard = ({
  user,
  onPeriodStarted,
  onNoPeriod,
}: RecoveryCardProps) => {
  const lastPeriodDate = new Date(user.lastPeriodDate);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleOpenPicker = () => {
    setSelectedDate(new Date());
    setShowPicker(true);
  };

  const handlePickerChange = (_: any, date?: Date) => {
    if (!date) {
      setShowPicker(false);
      return;
    }
    const clamped = clampDate(date, lastPeriodDate, new Date());
    setSelectedDate(clamped);

    // На Android сохраняем сразу после выбора
    if (Platform.OS !== "ios") {
      setShowPicker(false);
      onPeriodStarted(clamped);
    }
  };

  const handleConfirmIOS = () => {
    setShowPicker(false);
    onPeriodStarted(selectedDate);
  };

  return (
    <View style={styles.shadowCard}>
      <LinearGradient
        colors={["#FFE7D1", "#FFD8B5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>!</Text>
          </View>
          <View style={styles.header}>
            <Text style={styles.title}>Обнови данные о цикле</Text>
            <Text style={styles.subtitle}>
              Давно не было отметки о последней менструации
            </Text>
          </View>
        </View>

        <View style={styles.buttonsRow}>
          <View style={styles.buttonWrapper}>
            <Button
              title="Началась"
              onPress={handleOpenPicker}
              fullWidth
              variant="magenta"
            />
          </View>
          <View style={styles.buttonWrapper}>
            <Button
              title="Не было"
              onPress={onNoPeriod}
              variant="cardGhost"
              fullWidth
            />
          </View>
        </View>

        {showPicker && (
          <View style={styles.pickerContainer}>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={handlePickerChange}
              maximumDate={new Date()}
              minimumDate={lastPeriodDate}
            />
            {Platform.OS === "ios" && (
              <Pressable
                onPress={handleConfirmIOS}
                style={styles.confirmButton}
              >
                <Text style={styles.confirmText}>Сохранить</Text>
              </Pressable>
            )}
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowCard: {
    borderRadius: 24,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 24,
    fontWeight: "800",
    color: "#EA580C",
  },
  header: {
    gap: 6,
    flex: 1,
  },
  title: {
    ...typography.h4,
    color: colors.text.primary,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.dark,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
  pickerContainer: {
    marginTop: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    padding: 10,
  },
  confirmButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  confirmText: {
    color: colors.primary,
    fontWeight: "600",
  },
});

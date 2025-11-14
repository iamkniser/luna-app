import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Switch, Text, TextInput, View } from "react-native";

import Button from "@/src/components/common/Button";
import { colors } from "@/src/constants/colors";
import { calculateCycleStatus } from "@/src/services/cycleCalculations";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";
import { DailyLog } from "@/src/types/cycle";
import { formatDate, toISODate } from "@/src/utils/dateHelpers";
import { MoodSelector } from "./MoodSelector";

interface DayDetailsDrawerProps {
  selectedDate: Date | null;
  onClose: () => void;
}

export const DayDetailsDrawer: React.FC<DayDetailsDrawerProps> = ({
  selectedDate,
  onClose,
}) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["75%"], []);

  const user = useUserStore((state) => state.user);
  const cycles = useCycleStore((state) => state.cycles);
  const updateDailyLog = useCycleStore((state) => state.updateDailyLog);
  const getDailyLog = useCycleStore((state) => state.getDailyLog);

  const [mood, setMood] = useState<DailyLog["mood"]>();
  const [notes, setNotes] = useState("");
  const [isPeriodDay, setIsPeriodDay] = useState(false);

  const loadDayData = useCallback(() => {
    if (!selectedDate) return;

    const dateStr = toISODate(selectedDate);
    const existingLog = getDailyLog(dateStr);

    if (existingLog) {
      setMood(existingLog.mood);
      setNotes(existingLog.notes ?? "");
      setIsPeriodDay(existingLog.isPeriodDay);
      return;
    }

    setMood(undefined);
    setNotes("");
    setIsPeriodDay(false);
  }, [getDailyLog, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      bottomSheetRef.current?.expand();
      loadDayData();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [loadDayData, selectedDate]);

  const cycleDay = useMemo(() => {
    if (!selectedDate || !user) return null;

    const status = calculateCycleStatus(user, cycles, selectedDate);
    return status?.currentDay ?? null;
  }, [cycles, selectedDate, user]);

  const handleSave = useCallback(() => {
    if (!selectedDate) return;

    const dateStr = toISODate(selectedDate);
    updateDailyLog(dateStr, {
      mood,
      notes: notes.trim() || undefined,
      isPeriodDay,
    });

    onClose();
  }, [isPeriodDay, mood, notes, onClose, selectedDate, updateDailyLog]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        onPress={handleClose}
      />
    ),
    [handleClose]
  );

  if (!selectedDate) {
    return null;
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.date}>
            {formatDate(selectedDate, "d MMMM yyyy")}
          </Text>
          {cycleDay !== null && cycleDay !== undefined && (
            <Text style={styles.cycleDay}>День цикла: {cycleDay}</Text>
          )}
        </View>

        <MoodSelector selectedMood={mood} onSelectMood={setMood} />

        <View style={styles.section}>
          <Text style={styles.label}>Заметка</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Добавь заметку о самочувствии..."
            placeholderTextColor={colors.text.light}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.periodSection}>
          <Text style={styles.periodLabel}>День менструации</Text>
          <Switch
            value={isPeriodDay}
            onValueChange={setIsPeriodDay}
            trackColor={{ false: "#E5E7EB", true: colors.primaryLight }}
            thumbColor={isPeriodDay ? colors.primary : "#f4f3f4"}
            ios_backgroundColor="#E5E7EB"
          />
        </View>

        <View style={styles.buttons}>
          <Button title="Отмена" onPress={handleClose} variant="secondary" />
          <Button title="Сохранить" onPress={handleSave} />
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: colors.text.light,
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    gap: 20,
  },
  header: {
    gap: 4,
  },
  date: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
  },
  cycleDay: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  notesInput: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    minHeight: 80,
  },
  periodSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFF0F5",
    padding: 16,
    borderRadius: 12,
  },
  periodLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
  },
});

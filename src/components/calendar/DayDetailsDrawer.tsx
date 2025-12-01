import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
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
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["75%"], []);
  const previousDateRef = useRef<string | null>(null);

  const user = useUserStore((state) => state.user);
  const cycles = useCycleStore((state) => state.cycles);
  const updateDailyLog = useCycleStore((state) => state.updateDailyLog);
  const getDailyLog = useCycleStore((state) => state.getDailyLog);
  const setWaitingForNextPeriod = useCycleStore(
    (state) => state.setWaitingForNextPeriod
  );
  const setRecoverySuppressedForStartDate = useCycleStore(
    (state) => state.setRecoverySuppressedForStartDate
  );
  const isWaitingForNextPeriod = useCycleStore(
    (state) => state.isWaitingForNextPeriod
  );

  const [mood, setMood] = useState<DailyLog["mood"]>();
  const [notes, setNotes] = useState("");
  const [isPeriodDay, setIsPeriodDay] = useState(false);

  // Загружаем данные дня при изменении selectedDate
  useEffect(() => {
    if (!selectedDate) {
      setMood(undefined);
      setNotes("");
      setIsPeriodDay(false);
      previousDateRef.current = null;
      return;
    }

    const dateStr = toISODate(selectedDate);

    // Загружаем данные только если дата действительно изменилась
    if (previousDateRef.current !== dateStr) {
      const existingLog = getDailyLog(dateStr);

      if (existingLog) {
        setMood(existingLog.mood);
        setNotes(existingLog.notes ?? "");
        setIsPeriodDay(existingLog.isPeriodDay);
      } else {
        setMood(undefined);
        setNotes("");
        setIsPeriodDay(false);
      }

      previousDateRef.current = dateStr;
    }
  }, [selectedDate, getDailyLog]);

  // Управляем открытием/закрытием drawer
  useEffect(() => {
    if (!selectedDate) {
      bottomSheetRef.current?.dismiss();
      previousDateRef.current = null;
      return;
    }

    const dateStr = toISODate(selectedDate);
    const dateChanged = previousDateRef.current !== dateStr;

    // Если дата изменилась, сначала закрываем, потом открываем
    // Это гарантирует корректное обновление данных
    if (dateChanged) {
      bottomSheetRef.current?.dismiss();
      const timeoutId = setTimeout(() => {
        bottomSheetRef.current?.present();
        previousDateRef.current = dateStr;
      }, 150);

      return () => clearTimeout(timeoutId);
    } else {
      // Если дата не изменилась, просто открываем
      const timeoutId = setTimeout(() => {
        bottomSheetRef.current?.present();
      }, 50);

      return () => clearTimeout(timeoutId);
    }
  }, [selectedDate]);

  const cycleDay = useMemo(() => {
    if (!selectedDate || !user || isWaitingForNextPeriod) return null;

    const status = calculateCycleStatus(user, cycles, selectedDate);
    return status?.currentDay ?? null;
  }, [cycles, isWaitingForNextPeriod, selectedDate, user]);

  const handleSave = useCallback(() => {
    if (!selectedDate) return;

    const dateStr = toISODate(selectedDate);
    updateDailyLog(dateStr, {
      mood,
      notes: notes.trim() || undefined,
      isPeriodDay,
    });

    if (isPeriodDay) {
      setWaitingForNextPeriod(false);
      setRecoverySuppressedForStartDate(null);
    }

    onClose();
  }, [
    isPeriodDay,
    mood,
    notes,
    onClose,
    selectedDate,
    updateDailyLog,
    setWaitingForNextPeriod,
    setRecoverySuppressedForStartDate,
  ]);

  const handleClose = useCallback(() => {
    previousDateRef.current = null;
    onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  // BottomSheetModal автоматически рендерится поверх всего контента
  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      stackBehavior="push"
      enablePanDownToClose
      onDismiss={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.content}>
        {selectedDate && (
          <>
            <View style={styles.header}>
              <Text style={styles.date}>
                {formatDate(selectedDate, "d MMMM yyyy")}
              </Text>
              {cycleDay !== null && cycleDay !== undefined && (
                <Text style={styles.cycleDay}>День цикла: {cycleDay}</Text>
              )}
            </View>

            <MoodSelector
              selectedMood={mood}
              onSelectMood={(selectedMood) =>
                setMood((prev) =>
                  prev === selectedMood ? undefined : selectedMood
                )
              }
            />

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
              <View style={styles.buttonWrapper}>
                <Button
                  title="Отмена"
                  onPress={handleClose}
                  variant="secondary"
                  fullWidth={false}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  title="Сохранить"
                  onPress={handleSave}
                  fullWidth={false}
                />
              </View>
            </View>
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
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
    width: "100%",
    paddingBottom: 20,
  },
  buttonWrapper: {
    flex: 1,
  },
});

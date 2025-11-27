import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarList, DateObject, LocaleConfig } from "react-native-calendars";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/src/constants/colors";
import { useCycleStore } from "@/src/store/cycleStore";
import { DailyLog } from "@/src/types/cycle";

// ---- Русская локаль ----
LocaleConfig.locales["ru"] = {
  monthNames: [
    "Январь",
    "Февраль",
    "Март",
    "Апрель",
    "Май",
    "Июнь",
    "Июль",
    "Август",
    "Сентябрь",
    "Октябрь",
    "Ноябрь",
    "Декабрь",
  ],
  monthNamesShort: [
    "Янв",
    "Фев",
    "Мар",
    "Апр",
    "Май",
    "Июн",
    "Июл",
    "Авг",
    "Сен",
    "Окт",
    "Ноя",
    "Дек",
  ],
  dayNames: [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ],
  dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  today: "Сегодня",
};
LocaleConfig.defaultLocale = "ru";

interface CalendarDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
}

const CALENDAR_START = "2025-10-01";
const CALENDAR_END = "2027-12-31";

export const CalendarDrawer: React.FC<CalendarDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDate,
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const dailyLogs = useCycleStore((state) => state.dailyLogs);

  const snapPoints = useMemo(() => ["100%"], []);

  const initialDate = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (today < CALENDAR_START) return CALENDAR_START;
    if (today > CALENDAR_END) return CALENDAR_END;
    return today;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};

    // точки для дней, где есть любые данные
    dailyLogs.forEach((log: DailyLog) => {
      const hasData =
        log.mood ||
        log.notes ||
        log.isPeriodDay ||
        (log.symptoms && log.symptoms.length > 0);

      if (!hasData) return;

      result[log.date] = {
        ...(result[log.date] || {}),
        marked: true,
        dotColor: colors.primary,
      };
    });

    // выделение выбранной даты
    if (selectedDate) {
      result[selectedDate] = {
        ...(result[selectedDate] || {}),
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.white,
      };
    }

    return result;
  }, [dailyLogs, selectedDate]);

  useEffect(() => {
    if (isOpen) sheetRef.current?.present();
    else sheetRef.current?.dismiss();
  }, [isOpen]);

  const renderBackdrop = (props: BottomSheetBackdropProps) => (
    <BottomSheetBackdrop
      {...props}
      disappearsOnIndex={-1}
      appearsOnIndex={0}
      opacity={0.5}
      pressBehavior="close"
    />
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      stackBehavior="push"
      enableDynamicSizing={false}
      enablePanDownToClose={false}
      enableContentPanningGesture={false}
      handleComponent={null}
      backgroundStyle={styles.background}
      backdropComponent={renderBackdrop}
    >
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Календарь</Text>
            <Text style={styles.description}>
              Здесь будет отображаться твой календарь цикла.
            </Text>
          </View>

          <Pressable onPress={onClose} style={styles.closeButton} hitSlop={10}>
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Calendar */}
        <View style={{ flex: 1 }}>
          <CalendarList
            style={{ height: "100%" }}
            contentContainerStyle={{ paddingBottom: 40 }}
            current={initialDate}
            pastScrollRange={24}
            futureScrollRange={24}
            minDate={CALENDAR_START}
            maxDate={CALENDAR_END}
            onDayPress={(day: DateObject) => {
              setSelectedDate(day.dateString);
              onSelectDate(new Date(day.dateString));
            }}
            markedDates={markedDates}
            firstDay={1}
            theme={calendarTheme}
            horizontal={false}
            pagingEnabled={false}
            showScrollIndicator={false}
            removeClippedSubviews={false}
            nestedScrollEnabled={true}
          />
        </View>
      </View>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    gap: 4,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

const calendarTheme = {
  calendarBackground: colors.white,
  textSectionTitleColor: colors.text.secondary,
  todayTextColor: colors.primary,
  dayTextColor: colors.text.primary,
  selectedDayBackgroundColor: colors.primary,
  selectedDayTextColor: colors.white,
  monthTextColor: colors.text.primary,
  textMonthFontWeight: "700",
  textDayFontWeight: "600",
  textDayHeaderFontWeight: "600",
  textDisabledColor: "#d9e1e8",
};

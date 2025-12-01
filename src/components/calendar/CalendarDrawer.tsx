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

import { getPhaseDayBackground } from "@/src/components/home/phaseStyles";
import { colors } from "@/src/constants/colors";
import {
  calculateCycleStatus,
  getPredictedNextPeriodDate,
} from "@/src/services/cycleCalculations";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";
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
  const cycles = useCycleStore((state) => state.cycles);
  const user = useUserStore((state) => state.user);

  const snapPoints = useMemo(() => ["100%"], []);

  const initialDate = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (today < CALENDAR_START) return CALENDAR_START;
    if (today > CALENDAR_END) return CALENDAR_END;
    return today;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate);

  // Отдельно считаем фазовые периоды (дорогая операция, зависит только от профиля и циклов)
  const phaseMarkedDates = useMemo(() => {
    const result: Record<string, any> = {};

    if (!user || !user.lastPeriodDate) return result;

    const menstruationDates: string[] = [];
    const ovulationDates: string[] = [];

    const start = new Date(CALENDAR_START);
    const end = new Date(CALENDAR_END);
    const lastPeriodStart = new Date(user.lastPeriodDate);
    const nextPeriodDate = getPredictedNextPeriodDate(user);

    for (
      let d = new Date(start.getTime());
      d <= end;
      d.setDate(d.getDate() + 1)
    ) {
      const current = new Date(d.getTime());

      // Ограничиваем расчёты только текущим циклом:
      // от фактической даты последней менструации до следующей ожидаемой
      if (current < lastPeriodStart || current >= nextPeriodDate) {
        continue;
      }
      const iso = current.toISOString().slice(0, 10);

      const status = calculateCycleStatus(user, cycles, current);
      if (!status) continue;

      if (status.isPeriodActive) menstruationDates.push(iso);
      if (status.phase === "ovulation") ovulationDates.push(iso);
    }

    const applyBlocks = (dates: string[], color: string, textColor: string) => {
      if (!dates.length) return;
      const blocks = groupConsecutiveDates(dates);

      blocks.forEach((block) => {
        if (block.length === 1) {
          const d0 = block[0];
          result[d0] = {
            ...(result[d0] || {}),
            startingDay: true,
            endingDay: true,
            color,
            textColor,
          };
          return;
        }

        block.forEach((date, index) => {
          const isFirst = index === 0;
          const isLast = index === block.length - 1;

          result[date] = {
            ...(result[date] || {}),
            ...(isFirst ? { startingDay: true } : {}),
            ...(isLast ? { endingDay: true } : {}),
            color,
            textColor,
          };
        });
      });
    };

    applyBlocks(
      menstruationDates,
      getPhaseDayBackground("menstruation"),
      colors.text.primary
    );
    applyBlocks(
      ovulationDates,
      getPhaseDayBackground("ovulation"),
      colors.text.primary
    );

    return result;
  }, [user, cycles]);

  const markedDates = useMemo(() => {
    // начинаем с фазовых подсветок
    const result: Record<string, any> = { ...phaseMarkedDates };

    // точки для дней с данными
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
      const existing = result[selectedDate] || {};
      result[selectedDate] = {
        ...existing,
        // сохраняем startingDay / endingDay, если дата внутри периода,
        // но перекрашиваем её как выбранную
        color: colors.primary,
        textColor: colors.white,
      };
    }

    return result;
  }, [dailyLogs, selectedDate, phaseMarkedDates]);

  const hasPeriodMarks = useMemo(
    () => Object.keys(phaseMarkedDates).length > 0,
    [phaseMarkedDates]
  );

  useEffect(() => {
    if (isOpen) {
      // при каждом открытии подсвечиваем текущую (или ближайшую допустимую) дату
      setSelectedDate(initialDate);
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen, initialDate]);

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
            markingType={hasPeriodMarks ? "period" : undefined}
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

// ---- Вспомогательные утилиты для группировки дат фаз ----
const groupConsecutiveDates = (dates: string[]): string[][] => {
  if (!dates.length) return [];
  const sorted = [...dates].sort();
  const blocks: string[][] = [];
  let currentBlock: string[] = [];

  sorted.forEach((date) => {
    if (!currentBlock.length) {
      currentBlock.push(date);
      return;
    }

    const prev = currentBlock[currentBlock.length - 1];
    if (areConsecutiveDates(prev, date)) {
      currentBlock.push(date);
    } else {
      blocks.push(currentBlock);
      currentBlock = [date];
    }
  });

  if (currentBlock.length) {
    blocks.push(currentBlock);
  }

  return blocks;
};

const areConsecutiveDates = (prev: string, current: string): boolean => {
  const prevDate = new Date(prev);
  const currentDate = new Date(current);
  const diffMs = currentDate.getTime() - prevDate.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.round(diffMs / oneDayMs) === 1;
};

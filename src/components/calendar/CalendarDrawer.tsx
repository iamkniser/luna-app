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
import {
  formatCalendarDay,
  formatCalendarRange,
} from "@/src/utils/dateHelpers";

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
  disablePhases?: boolean;
}

const CALENDAR_START = "2025-10-01";
const CALENDAR_END = "2027-12-31";

export const CalendarDrawer: React.FC<CalendarDrawerProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  disablePhases = false,
}) => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const insets = useSafeAreaInsets();
  const dailyLogs = useCycleStore((state) => state.dailyLogs);
  const updateDailyLog = useCycleStore((state) => state.updateDailyLog);
  const cycles = useCycleStore((state) => state.cycles);
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);

  const snapPoints = useMemo(() => ["100%"], []);

  const initialDate = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (today < CALENDAR_START) return CALENDAR_START;
    if (today > CALENDAR_END) return CALENDAR_END;
    return today;
  }, []);

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [isEditingPeriod, setIsEditingPeriod] = useState(false);
  const [editStartDate, setEditStartDate] = useState<string | null>(null);
  const [editEndDate, setEditEndDate] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const calendarRef = useRef<any>(null);

  const canSaveEdit =
    !!editStartDate && !!editEndDate && editEndDate >= editStartDate;

  // Отдельно считаем фазовые периоды (дорогая операция, зависит от профиля, циклов и фактических логов)
  const phaseMarkedDates = useMemo(() => {
    if (disablePhases) return {};

    const result: Record<string, any> = {};

    if (!user || !user.lastPeriodDate) return result;

    const menstruationDates: string[] = [];
    const ovulationDates: string[] = [];

    const start = new Date(CALENDAR_START);
    const end = new Date(CALENDAR_END);
    const lastPeriodStart = new Date(user.lastPeriodDate);
    const nextPeriodDate = getPredictedNextPeriodDate(user);

    // Фактические дни менструации в текущем цикле (по логам), если пользователь их явно отметил
    const manualPeriodDatesSet = new Set<string>();
    dailyLogs.forEach((log) => {
      if (!log.isPeriodDay) return;
      const logDate = new Date(log.date);
      if (logDate >= lastPeriodStart && logDate < nextPeriodDate) {
        manualPeriodDatesSet.add(log.date);
      }
    });
    const hasManualPeriod = manualPeriodDatesSet.size > 0;

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

      // Модельный период:
      // - если пользователь явно отметил дни менструации в этом цикле,
      //   используем только эти даты
      // - иначе остаёмся на модельной логике (1–5 день цикла)
      if (hasManualPeriod) {
        if (manualPeriodDatesSet.has(iso)) {
          menstruationDates.push(iso);
        }
      } else {
        if (status.isPeriodActive) menstruationDates.push(iso);
      }

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
  }, [disablePhases, user, cycles, dailyLogs]);

  const markedDates = useMemo(() => {
    const result: Record<string, any> = {};

    // 1) Базовые фазовые подсветки
    const ovulationPhaseColor = getPhaseDayBackground("ovulation");

    Object.entries(phaseMarkedDates).forEach(([date, mark]) => {
      if (isEditingPeriod) {
        // В режиме редактирования:
        // - убираем фон
        // - убираем выделение овуляции (как обычный день)
        // - оставляем только цифры дней менструации, более контрастным цветом
        if (mark.color) {
          const phaseColor = mark.color;
          // Овуляцию в режиме редактирования не подсвечиваем вообще
          if (phaseColor === ovulationPhaseColor) {
            return;
          }

          const { startingDay, endingDay, color, ...rest } = mark;
          result[date] = {
            ...rest,
            // Более контрастный цвет цифр для дней менструации в режиме редактирования
            textColor: "#DB2777",
          };
        } else {
          // На всякий случай клонируем без изменений, если цвета нет
          result[date] = { ...mark };
        }
      } else {
        // Обычный режим: оставляем исходное оформление фаз
        result[date] = { ...mark };
      }
    });

    // 2) Точки для дней с данными
    dailyLogs.forEach((log: DailyLog) => {
      // Точка только если есть контент: настроение, симптомы или заметка
      const hasData =
        log.mood || log.notes || (log.symptoms && log.symptoms.length > 0);

      if (!hasData) return;

      result[log.date] = {
        ...(result[log.date] || {}),
        marked: true,
        dotColor: colors.primary,
      };
    });

    // 3) В режиме редактирования — поверх фаз рисуем временный диапазон с фоном менструации
    if (isEditingPeriod && editStartDate) {
      const start = new Date(editStartDate);
      const end = editEndDate ? new Date(editEndDate) : start;

      const current = new Date(start.getTime());
      while (current <= end) {
        const iso = current.toISOString().slice(0, 10);
        const isFirst = iso === editStartDate;
        const isLast = iso === (editEndDate || editStartDate);

        result[iso] = {
          ...(result[iso] || {}),
          ...(isFirst ? { startingDay: true } : {}),
          ...(isLast ? { endingDay: true } : {}),
          color: getPhaseDayBackground("menstruation"),
          textColor: colors.white,
        };

        current.setDate(current.getDate() + 1);
      }
    } else if (selectedDate) {
      // 4) Обычный режим — выделяем выбранную дату
      const existing = result[selectedDate] || {};
      result[selectedDate] = {
        ...existing,
        color: colors.primary,
        textColor: colors.white,
      };
    }

    return result;
  }, [
    dailyLogs,
    selectedDate,
    phaseMarkedDates,
    isEditingPeriod,
    editStartDate,
    editEndDate,
  ]);

  const hasPeriodMarks = useMemo(
    () => Object.keys(phaseMarkedDates).length > 0,
    [phaseMarkedDates]
  );

  useEffect(() => {
    if (isOpen) {
      // при каждом открытии подсвечиваем текущую (или ближайшую допустимую) дату
      setSelectedDate(initialDate);
      setIsEditingPeriod(false);
      setEditStartDate(null);
      setEditEndDate(null);
      setEditError(null);
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

  const handleDayPress = (day: DateObject) => {
    const dateStr = day.dateString;

    if (!isEditingPeriod) {
      setSelectedDate(dateStr);
      onSelectDate(new Date(dateStr));
      return;
    }

    setEditError(null);

    // Первый тап — выбор начала
    if (!editStartDate || (editStartDate && editEndDate)) {
      setEditStartDate(dateStr);
      setEditEndDate(null);
      return;
    }

    // Второй тап — выбор конца
    if (editStartDate && !editEndDate) {
      if (dateStr < editStartDate) {
        // если пользователь тапнул раньше начала — начинаем выбор заново с этой даты
        setEditStartDate(dateStr);
        setEditEndDate(null);
      } else {
        setEditEndDate(dateStr);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingPeriod(false);
    setEditStartDate(null);
    setEditEndDate(null);
    setEditError(null);
  };

  const handleSaveEdit = () => {
    if (!editStartDate || !editEndDate) {
      setEditError("Выбери начало и конец периода.");
      return;
    }

    if (editEndDate < editStartDate) {
      setEditError("Конец периода не может быть раньше начала.");
      return;
    }

    const today = new Date();
    const windowStart = new Date();
    windowStart.setDate(today.getDate() - 90);

    const start = new Date(editStartDate);
    const end = new Date(editEndDate);

    if (
      start < windowStart ||
      end < windowStart ||
      start > today ||
      end > today
    ) {
      setEditError("Даты периода должны быть в пределах последних 90 дней.");
      return;
    }

    // Перезаписываем фактический период в dailyLogs за последние 90 дней
    dailyLogs.forEach((log) => {
      const logDate = new Date(log.date);
      if (logDate >= windowStart && logDate <= today && log.isPeriodDay) {
        updateDailyLog(log.date, { isPeriodDay: false, flow: undefined });
      }
    });

    const cursor = new Date(start.getTime());
    while (cursor <= end) {
      const iso = cursor.toISOString().slice(0, 10);
      updateDailyLog(iso, { isPeriodDay: true });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Обновляем точку отсчёта цикла
    if (user) {
      updateUser({ lastPeriodDate: editStartDate });
    }

    // Закрываем режим редактирования и обновляем выбранную дату
    setSelectedDate(editStartDate);
    setIsEditingPeriod(false);
    setEditStartDate(null);
    setEditEndDate(null);
    setEditError(null);
  };

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
            <Text style={styles.title}>
              {isEditingPeriod ? "Редактирование периода" : "Календарь"}
            </Text>
            <Text style={styles.description}>
              {isEditingPeriod
                ? "Выбери начало и конец менструации."
                : "Выбери дату для просмотра данных или отметь дни с периодом"}
            </Text>
          </View>

          <Pressable
            onPress={() => {
              if (isEditingPeriod) {
                // В режиме редактирования X просто выходит из режима и сбрасывает выбор
                handleCancelEdit();
              } else {
                // В обычном режиме X закрывает дровер
                onClose();
              }
            }}
            style={styles.closeButton}
            hitSlop={10}
          >
            <Ionicons name="close" size={22} color={colors.text.primary} />
          </Pressable>
        </View>

        {/* Legend */}
        {!disablePhases && hasPeriodMarks && (
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: getPhaseDayBackground("menstruation") },
                ]}
              />
              <Text style={styles.legendLabel}>Менструация</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: getPhaseDayBackground("ovulation") },
                ]}
              />
              <Text style={styles.legendLabel}>Овуляция</Text>
            </View>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <CalendarList
            ref={calendarRef}
            style={{ height: "100%" }}
            contentContainerStyle={{ paddingBottom: 120 }}
            current={initialDate}
            pastScrollRange={24}
            futureScrollRange={24}
            minDate={CALENDAR_START}
            maxDate={CALENDAR_END}
            onDayPress={handleDayPress}
            markedDates={markedDates}
            markingType={
              !disablePhases && hasPeriodMarks ? "period" : undefined
            }
            firstDay={1}
            theme={calendarTheme}
            horizontal={false}
            pagingEnabled={false}
            showScrollIndicator={false}
            removeClippedSubviews={false}
            nestedScrollEnabled={true}
          />
          {/* Подсказка для режима редактирования периода */}
          {isEditingPeriod && (
            <View style={styles.editPanel}>
              <View style={styles.editPanelTextBlock}>
                <Text style={styles.editPanelTitle}>
                  {!editStartDate
                    ? "Выбери день начала менструации"
                    : !editEndDate
                    ? "Теперь выбери день окончания"
                    : "Проверь период и сохрани"}
                </Text>
                <Text style={styles.editPanelSubtitle}>
                  {!editStartDate &&
                    "Тапни по дню начала, затем по дню окончания"}
                  {editStartDate &&
                    !editEndDate &&
                    formatCalendarDay(editStartDate)}
                  {editStartDate &&
                    editEndDate &&
                    formatCalendarRange(editStartDate, editEndDate)}
                </Text>
                {editError && (
                  <Text style={styles.editPanelError}>{editError}</Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.bottomActions}>
            {/* Кнопка календаря всегда слева */}
            <Pressable
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => {
                setSelectedDate(initialDate);
                // @ts-ignore: scrollToDay is available at runtime
                calendarRef.current?.scrollToDay?.(
                  initialDate,
                  undefined,
                  true
                );
              }}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.text.primary}
              />
            </Pressable>

            {/* Справа: карандаш в режиме просмотра, галочка в режиме редактирования */}
            {!isEditingPeriod ? (
              <Pressable
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => {
                  setIsEditingPeriod(true);
                  setEditStartDate(null);
                  setEditEndDate(null);
                  setEditError(null);
                }}
              >
                <Ionicons
                  name="create-outline"
                  size={20}
                  color={colors.white}
                />
              </Pressable>
            ) : (
              <Pressable
                style={[
                  styles.actionButton,
                  styles.actionButtonPrimary,
                  !canSaveEdit && styles.actionButtonDisabled,
                ]}
                disabled={!canSaveEdit}
                onPress={handleSaveEdit}
              >
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </Pressable>
            )}
          </View>
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
  calendarContainer: {
    flex: 1,
    position: "relative",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  bottomActions: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  editPanel: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 96,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    flexDirection: "column",
    gap: 10,
  },
  editPanelTextBlock: {
    gap: 4,
  },
  editPanelTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text.primary,
  },
  editPanelSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  editPanelError: {
    marginTop: 4,
    fontSize: 12,
    color: "#DC2626",
  },
  editPanelButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  confirmButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  confirmButtonPrimary: {
    backgroundColor: colors.primary,
  },
  confirmButtonDisabled: {
    opacity: 0.5,
  },
  confirmButtonSecondaryText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.text.primary,
  },
  confirmButtonPrimaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonSecondary: {
    backgroundColor: "#F3F4F6",
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
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

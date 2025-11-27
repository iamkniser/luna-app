import { format } from "date-fns";
import { isSameDay } from "date-fns/isSameDay";
import { ru } from "date-fns/locale";
import { startOfDay } from "date-fns/startOfDay";
import { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { calculateCycleStatus } from "@/src/services/cycleCalculations";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";
import { DailyLog, MOOD_EMOJIS } from "@/src/types/cycle";
import { getWeekDays, toISODate } from "@/src/utils/dateHelpers";
import { getPhaseDayBackground } from "./phaseStyles";

interface WeekCalendarProps {
  currentDate: Date;
  onDayPress?: (date: Date) => void;
}

const WeekCalendarComponent = ({
  currentDate,
  onDayPress,
}: WeekCalendarProps) => {
  const dailyLogs = useCycleStore((state) => state.dailyLogs);
  const cycles = useCycleStore((state) => state.cycles);
  const user = useUserStore((state) => state.user);

  const logsByDate = useMemo(() => {
    const map: Record<string, DailyLog> = {};
    dailyLogs.forEach((log) => {
      map[log.date] = log;
    });
    return map;
  }, [dailyLogs]);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const today = startOfDay(new Date());

  return (
    <View style={styles.weekRow}>
      {weekDays.map((day) => {
        const isToday = isSameDay(day, currentDate);
        const isFutureDay = day.getTime() > today.getTime();
        const dateStr = toISODate(day);
        const log = logsByDate[dateStr];
        const moodEmoji = log?.mood ? MOOD_EMOJIS[log.mood] : undefined;

        const phaseBackground = user
          ? (() => {
              const status = calculateCycleStatus(user, cycles, day);
              if (!status) return styles.dayCircleDefault.backgroundColor;
              return getPhaseDayBackground(status.phase);
            })()
          : styles.dayCircleDefault.backgroundColor;

        return (
          <TouchableOpacity
            key={dateStr}
            style={styles.dayContainer}
            activeOpacity={0.8}
            disabled={isFutureDay}
            onPress={() => {
              if (!isFutureDay) {
                onDayPress?.(day);
              }
            }}
          >
            <Text
              style={[
                typography.caption,
                styles.dayLabel,
                isToday && styles.dayLabelCurrent,
              ]}
            >
              {format(day, "EE", { locale: ru }).slice(0, 2).toUpperCase()}
            </Text>
            <View style={styles.circleWrapper}>
              <View
                style={[
                  styles.dayCircle,
                  !isToday && { backgroundColor: phaseBackground },
                  isToday && styles.dayCircleCurrent,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    isToday && styles.dayNumberCurrent,
                    isFutureDay && styles.dayNumberFuture,
                  ]}
                >
                  {format(day, "d")}
                </Text>
              </View>
              {moodEmoji && (
                <View style={styles.moodEmojiWrapper}>
                  <Text style={styles.mood}>{moodEmoji}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  dayContainer: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  circleWrapper: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 46,
    height: 52,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  dayCircleCurrent: {
    backgroundColor: colors.primary,
  },
  dayCircleDefault: {
    backgroundColor: "#FFF0F5",
  },
  dayLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.text.light,
  },
  dayLabelCurrent: {
    color: colors.text.dark,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.dark,
  },
  dayNumberCurrent: {
    color: colors.white,
  },
  dayNumberFuture: {
    color: colors.text.light,
  },
  mood: {
    fontSize: 20,
  },
  moodEmojiWrapper: {
    position: "absolute",
    bottom: -6,
    alignItems: "center",
  },
});

export const WeekCalendar = memo(WeekCalendarComponent);

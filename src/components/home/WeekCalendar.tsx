import { format } from "date-fns";
import { isSameDay } from "date-fns/isSameDay";
import { ru } from "date-fns/locale";
import { memo, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { useCycleStore } from "@/src/store/cycleStore";
import { MOOD_EMOJIS } from "@/src/types/cycle";
import { getWeekDays, toISODate } from "@/src/utils/dateHelpers";

interface WeekCalendarProps {
  currentDate: Date;
  onDayPress?: (date: Date) => void;
}

const WeekCalendarComponent = ({
  currentDate,
  onDayPress,
}: WeekCalendarProps) => {
  const getDailyLog = useCycleStore((state) => state.getDailyLog);

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.listContent}
    >
      {weekDays.map((day) => {
        const isToday = isSameDay(day, currentDate);
        const dateStr = toISODate(day);
        const log = getDailyLog(dateStr);
        const moodEmoji = log?.mood ? MOOD_EMOJIS[log.mood] : undefined;

        return (
          <TouchableOpacity
            key={dateStr}
            style={[
              styles.card,
              isToday ? styles.cardCurrent : styles.cardDefault,
            ]}
            activeOpacity={0.8}
            onPress={() => onDayPress?.(day)}
          >
            <View>
              <Text
                style={[
                  typography.caption,
                  styles.dayLabel,
                  isToday && styles.dayLabelCurrent,
                ]}
              >
                {format(day, "EEE", { locale: ru }).slice(0, 3).toUpperCase()}
              </Text>
              <Text
                style={[
                  typography.h4,
                  styles.dayNumber,
                  isToday && styles.dayNumberCurrent,
                ]}
              >
                {format(day, "d")}
              </Text>
              {moodEmoji && <Text style={styles.mood}>{moodEmoji}</Text>}
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  listContent: {
    gap: 12,
  },
  card: {
    width: 60,
    height: 80,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardCurrent: {
    backgroundColor: colors.primary,
  },
  cardDefault: {
    backgroundColor: "#FFF0F5",
  },
  dayLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: colors.text.light,
  },
  dayLabelCurrent: {
    color: colors.white,
  },
  dayNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.dark,
  },
  dayNumberCurrent: {
    color: colors.white,
  },
  mood: {
    fontSize: 20,
    marginTop: 4,
  },
});

export const WeekCalendar = memo(WeekCalendarComponent);

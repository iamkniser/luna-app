import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { DayDetailsDrawer } from "@/src/components/calendar/DayDetailsDrawer";
import Button from "@/src/components/common/Button";
import { CycleParameter } from "@/src/components/home/CycleParameter";
import { CycleProgressBar } from "@/src/components/home/CycleProgressBar";
import { StatusCard } from "@/src/components/home/StatusCard";
import { WeekCalendar } from "@/src/components/home/WeekCalendar";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { calculateCycleStatus } from "@/src/services/cycleCalculations";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";
import { formatDate, formatDateShort } from "@/src/utils/dateHelpers";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const cycles = useCycleStore((state) => state.cycles);
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const cycleStatus = useMemo(() => {
    if (!user) return null;
    return calculateCycleStatus(user, cycles, currentDate);
  }, [user, cycles, currentDate]);

  const handleDayPress = useCallback((date: Date) => {
    // Создаем новый объект Date для гарантии обновления состояния
    // даже если это та же дата
    const newDate = new Date(date);
    setSelectedDate(newDate);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedDate(null);
  }, []);

  if (!user) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[typography.h2, styles.greeting]}>
            Привет{user.name ? `, ${user.name}` : ""}! 👋
          </Text>
          <Text style={[typography.caption, styles.date]}>
            {formatDate(currentDate, "d MMMM yyyy")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Текущая неделя
          </Text>
          <WeekCalendar currentDate={currentDate} onDayPress={handleDayPress} />
          <CycleProgressBar
            currentDay={cycleStatus?.currentDay ?? 1}
            totalDays={user.averageCycleLength}
          />
        </View>

        {cycleStatus && (
          <View style={styles.section}>
            <StatusCard cycleStatus={cycleStatus} />
          </View>
        )}

        <View style={styles.section}>
          <Button
            title="Открыть календарь"
            icon={<Ionicons name="calendar" size={24} color={colors.primary} />}
            onPress={() => {
              console.log("Open calendar");
            }}
            variant="secondary"
            fullWidth
          />
        </View>

        <View style={styles.section}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Параметры цикла
          </Text>
          <View style={styles.parametersContainer}>
            <CycleParameter
              label="Средняя длина"
              value={`${user.averageCycleLength} дней`}
            />
            {user.lastPeriodDate && (
              <CycleParameter
                label="Начало последней менструации"
                value={formatDateShort(user.lastPeriodDate)}
              />
            )}
            {cycleStatus?.daysUntilNextPeriod !== undefined && (
              <CycleParameter
                label="До следующей менструации"
                value={`${cycleStatus.daysUntilNextPeriod} дней`}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <DayDetailsDrawer
        selectedDate={selectedDate}
        onClose={handleCloseDrawer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
    gap: 24,
  },
  header: {
    marginTop: 8,
    gap: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
  },
  date: {
    fontSize: 14,
    color: colors.text.light,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
  },
  parametersContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
});

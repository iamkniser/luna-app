import { useCallback, useMemo, useState } from "react";
import { differenceInDays, parseISO } from "date-fns";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CalendarDrawer } from "@/src/components/calendar/CalendarDrawer";
import { DayDetailsDrawer } from "@/src/components/calendar/DayDetailsDrawer";
import Button from "@/src/components/common/Button";
import { CycleParametersSection } from "@/src/components/home/CycleParametersSection";
import { RecoveryCard } from "@/src/components/home/RecoveryCard";
import { StatusCard } from "@/src/components/home/StatusCard";
import { WeekCalendar } from "@/src/components/home/WeekCalendar";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import {
  calculateCycleStatus,
  getDaysSinceLastPeriod,
} from "@/src/services/cycleCalculations";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";
import { formatDate, toISODate } from "@/src/utils/dateHelpers";
import { Ionicons } from "@expo/vector-icons";

export default function HomeScreen() {
  const user = useUserStore((state) => state.user);
  const cycles = useCycleStore((state) => state.cycles);
  const dailyLogs = useCycleStore((state) => state.dailyLogs);
  const isWaitingForNextPeriod = useCycleStore(
    (state) => state.isWaitingForNextPeriod
  );
  const recoverySuppressedForStartDate = useCycleStore(
    (state) => state.recoverySuppressedForStartDate
  );
  const setWaitingForNextPeriod = useCycleStore(
    (state) => state.setWaitingForNextPeriod
  );
  const setRecoverySuppressedForStartDate = useCycleStore(
    (state) => state.setRecoverySuppressedForStartDate
  );
  const updateDailyLog = useCycleStore((state) => state.updateDailyLog);
  const updateUser = useUserStore((state) => state.updateUser);
  const [currentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCalendarOpen, setCalendarOpen] = useState(false);

  const cycleStatus = useMemo(() => {
    if (!user || isWaitingForNextPeriod) return null;
    return calculateCycleStatus(user, cycles, currentDate);
  }, [user, cycles, currentDate, isWaitingForNextPeriod]);

  const daysSinceLastPeriod = useMemo(() => {
    if (!user) return null;
    return getDaysSinceLastPeriod(user, currentDate);
  }, [currentDate, user]);

  const hasPeriodLogSinceLastPeriod = useMemo(() => {
    if (!user?.lastPeriodDate) return false;
    const lastStart = parseISO(user.lastPeriodDate);
    return dailyLogs.some((log) => {
      if (!log.isPeriodDay) return false;
      const logDate = parseISO(log.date);
      if (logDate < lastStart) return false;
      return (
        differenceInDays(logDate, lastStart) <= user.averageCycleLength + 1
      );
    });
  }, [dailyLogs, user]);

  const shouldShowRecoveryCard = useMemo(() => {
    if (!user?.lastPeriodDate) return false;
    if (isWaitingForNextPeriod) return false;
    if (recoverySuppressedForStartDate === user.lastPeriodDate) return false;
    if (hasPeriodLogSinceLastPeriod) return false;
    if (daysSinceLastPeriod === null) return false;
    return daysSinceLastPeriod > user.averageCycleLength + 3;
  }, [
    daysSinceLastPeriod,
    hasPeriodLogSinceLastPeriod,
    isWaitingForNextPeriod,
    recoverySuppressedForStartDate,
    user,
  ]);

  const handleDayPress = useCallback((date: Date) => {
    // Создаем новый объект Date для гарантии обновления состояния
    // даже если это та же дата
    const newDate = new Date(date);
    setSelectedDate(newDate);
  }, []);

  const handleCalendarDatePress = useCallback((date: Date) => {
    setSelectedDate(new Date(date));
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const handleRecoveryPeriodStarted = useCallback(
    (date: Date) => {
      if (!user) return;
      const isoDate = date.toISOString();

      updateUser({ lastPeriodDate: isoDate });
      updateDailyLog(toISODate(date), { isPeriodDay: true });
      setWaitingForNextPeriod(false);
      setRecoverySuppressedForStartDate(null);
    },
    [
      setRecoverySuppressedForStartDate,
      setWaitingForNextPeriod,
      updateDailyLog,
      updateUser,
      user,
    ]
  );

  const handleRecoveryNoPeriod = useCallback(() => {
    if (!user?.lastPeriodDate) return;
    setWaitingForNextPeriod(true);
    setRecoverySuppressedForStartDate(user.lastPeriodDate);
  }, [
    setRecoverySuppressedForStartDate,
    setWaitingForNextPeriod,
    user?.lastPeriodDate,
  ]);

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
          <Text style={[typography.h4, styles.sectionTitle]}>Текущая неделя</Text>
          <WeekCalendar
            currentDate={currentDate}
            onDayPress={handleDayPress}
            disablePhaseColors={isWaitingForNextPeriod}
          />
        </View>

        <View style={styles.section}>
          {shouldShowRecoveryCard ? (
            <RecoveryCard
              user={user}
              onPeriodStarted={handleRecoveryPeriodStarted}
              onNoPeriod={handleRecoveryNoPeriod}
            />
          ) : isWaitingForNextPeriod ? (
            <View style={styles.waitingCard}>
              <Text style={styles.waitingTitle}>
                Ждём начала следующей менструации
              </Text>
              <Text style={styles.waitingSubtitle}>
                Отметь новый день начала, чтобы восстановить прогнозы
              </Text>
            </View>
          ) : (
            cycleStatus && <StatusCard cycleStatus={cycleStatus} />
          )}
        </View>

        <View style={styles.section}>
          <Button
            title="Открыть календарь"
            icon={<Ionicons name="calendar" size={24} color={colors.primary} />}
            onPress={() => setCalendarOpen(true)}
            variant="secondary"
            fullWidth
          />
        </View>

        <CycleParametersSection user={user} cycleStatus={cycleStatus} />
      </ScrollView>

      <DayDetailsDrawer
        selectedDate={selectedDate}
        onClose={handleCloseDrawer}
      />
      <CalendarDrawer
        isOpen={isCalendarOpen}
        onClose={() => setCalendarOpen(false)}
        onSelectDate={handleCalendarDatePress}
        disablePhases={isWaitingForNextPeriod}
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
  waitingCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  waitingTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text.primary,
  },
  waitingSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

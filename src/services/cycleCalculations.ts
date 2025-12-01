import { Cycle, CycleStatus } from "@/src/types/cycle";
import { User } from "@/src/types/user";
import { addDays, differenceInDays, parseISO } from "date-fns";

export const getDaysSinceLastPeriod = (
  user: User,
  currentDate: Date = new Date()
): number | null => {
  if (!user.lastPeriodDate) return null;
  const lastPeriodStart = parseISO(user.lastPeriodDate);
  return differenceInDays(currentDate, lastPeriodStart) + 1;
};

export const calculateCycleStatus = (
  user: User,
  cycles: Cycle[],
  currentDate: Date = new Date()
): CycleStatus | null => {
  if (!user.lastPeriodDate) return null;

  const lastPeriodStart = parseISO(user.lastPeriodDate);
  const daysSinceLastPeriod =
    differenceInDays(currentDate, lastPeriodStart) + 1;

  // Потерянный цикл: прогнозы считаем невалидными
  const isCycleLost =
    daysSinceLastPeriod > user.averageCycleLength + 5 ||
    daysSinceLastPeriod > 40;
  if (isCycleLost) {
    return null;
  }

  const periodLength = 5;
  const isPeriodActive = daysSinceLastPeriod <= periodLength;

  let phase: CycleStatus["phase"] = "menstruation";
  let phaseDisplayName = `День ${daysSinceLastPeriod} менструации`;

  if (daysSinceLastPeriod > periodLength) {
    if (daysSinceLastPeriod <= 13) {
      phase = "follicular";
      phaseDisplayName = "Фолликулярная фаза";
    } else if (daysSinceLastPeriod <= 17) {
      phase = "ovulation";
      phaseDisplayName = "Овуляция";
    } else {
      phase = "luteal";
      phaseDisplayName = "Лютеиновая фаза";
    }
  }

  const daysUntilNextPeriod = user.averageCycleLength - daysSinceLastPeriod;

  return {
    currentDay: daysSinceLastPeriod,
    phase,
    phaseDisplayName,
    isPeriodActive,
    daysUntilNextPeriod: daysUntilNextPeriod > 0 ? daysUntilNextPeriod : 0,
    isPregnancyPossible: daysSinceLastPeriod >= 10 && daysSinceLastPeriod <= 17,
  };
};

export const getPredictedNextPeriodDate = (user: User): Date => {
  const lastPeriod = parseISO(user.lastPeriodDate);
  return addDays(lastPeriod, user.averageCycleLength);
};

export const getExpectedOvulationDate = (user: User): Date | null => {
  if (!user.lastPeriodDate) return null;
  const nextPeriod = getPredictedNextPeriodDate(user);
  // Овуляция = за 14 дней до следующей менструации
  return addDays(nextPeriod, -14);
};

export const getDaysUntilPhaseEnd = (
  cycleStatus: CycleStatus,
  user: User
): number | null => {
  const cycleLength = user.averageCycleLength;
  const currentDay = cycleStatus.currentDay;

  if (!cycleLength || currentDay <= 0) return null;

  // Центр овуляции: за 14 дней до конца цикла
  const ovulationCenterDay = cycleLength - 14;

  // Базовые границы фаз, адаптированные под длину цикла
  const menstruationEnd = 5; // 1–5
  const ovulationStart = Math.max(menstruationEnd + 1, ovulationCenterDay - 1); // ~13
  const ovulationEnd = Math.min(cycleLength, ovulationCenterDay + 1); // ~15
  const follicularEnd = Math.max(ovulationStart - 1, menstruationEnd + 1); // ~6–12
  const lutealStart = Math.min(cycleLength, ovulationEnd + 1); // ~16

  let phaseEndDay: number;

  switch (cycleStatus.phase) {
    case "menstruation":
      phaseEndDay = menstruationEnd;
      break;
    case "follicular":
      phaseEndDay = follicularEnd;
      break;
    case "ovulation":
      phaseEndDay = ovulationEnd;
      break;
    case "luteal":
    default:
      phaseEndDay = cycleLength;
      break;
  }

  return Math.max(phaseEndDay - currentDay, 0);
};

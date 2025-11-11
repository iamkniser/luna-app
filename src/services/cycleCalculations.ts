import { Cycle, CycleStatus } from "@/src/types/cycle";
import { User } from "@/src/types/user";
import { addDays, differenceInDays, parseISO } from "date-fns";

export const calculateCycleStatus = (
  user: User,
  cycles: Cycle[],
  currentDate: Date = new Date()
): CycleStatus | null => {
  if (!user.lastPeriodDate) return null;

  const lastPeriodStart = parseISO(user.lastPeriodDate);
  const daysSinceLastPeriod =
    differenceInDays(currentDate, lastPeriodStart) + 1;

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

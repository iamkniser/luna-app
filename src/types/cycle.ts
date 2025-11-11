export interface Cycle {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
}

export interface DailyLog {
  id: string;
  date: string;
  mood?: "great" | "good" | "okay" | "bad" | "awful";
  symptoms?: string[];
  notes?: string;
  flow?: "light" | "medium" | "heavy";
}

export interface CycleStatus {
  currentDay: number;
  phase: "menstruation" | "follicular" | "ovulation" | "luteal";
  phaseDisplayName: string;
  isPeriodActive: boolean;
  daysUntilNextPeriod?: number;
  isPregnancyPossible?: boolean;
}

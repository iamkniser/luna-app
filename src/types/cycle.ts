export interface Cycle {
  id: string;
  startDate: string;
  endDate?: string;
  cycleLength?: number;
}

export interface DailyLog {
  id: string;
  date: string;
  mood?:
    | "great"
    | "good"
    | "okay"
    | "bad"
    | "awful"
    | "love"
    | "happy"
    | "sad"
    | "sick";
  symptoms?: string[];
  notes?: string;
  flow?: "light" | "medium" | "heavy";
  isPeriodDay: boolean;
}

export interface CycleStatus {
  currentDay: number;
  phase: "menstruation" | "follicular" | "ovulation" | "luteal";
  phaseDisplayName: string;
  isPeriodActive: boolean;
  daysUntilNextPeriod?: number;
  isPregnancyPossible?: boolean;
}

export const MOOD_EMOJIS: Record<DailyLog["mood"] & string, string> = {
  great: "🥰",
  good: "😊",
  okay: "😐",
  bad: "😢",
  awful: "😭",
  love: "😍",
  happy: "😄",
  sad: "😭",
  sick: "🤒",
};

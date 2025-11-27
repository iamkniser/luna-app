import { colors } from "@/src/constants/colors";
import type { CycleStatus } from "@/src/types/cycle";

export const getPhaseStyles = (phase: CycleStatus["phase"]) => {
  switch (phase) {
    case "menstruation":
      return {
        gradient: ["#FFE4E9", "#FFD4DD"] as const,
        icon: "🩸",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "follicular":
      return {
        gradient: ["#FFE9F7", "#F8D9FF"] as const,
        icon: "💗",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "ovulation":
      return {
        gradient: ["#E3FFE8", "#C8F7D8"] as const,
        icon: "✨",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    case "luteal":
      return {
        gradient: ["#FFF6D9", "#FFE9B8"] as const,
        icon: "☀️",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
    default:
      return {
        gradient: ["#FFE4E9", "#FFD4DD"] as const,
        icon: "💗",
        iconBackground: "#FFFFFF",
        textColor: colors.text.dark,
      };
  }
};

export const getPhaseDayBackground = (phase: CycleStatus["phase"]) => {
  const { gradient } = getPhaseStyles(phase);
  // Берём первый цвет из градиента для заливки дня
  return gradient[0];
};

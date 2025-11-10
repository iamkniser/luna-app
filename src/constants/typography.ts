import { colors } from "@/src/constants/colors";

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as const,
    color: colors.text.primary,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as const,
    color: colors.text.secondary,
  },
} as const;

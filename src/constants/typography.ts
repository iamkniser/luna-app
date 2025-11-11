import { colors } from "@/src/constants/colors";

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  h3: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text.primary,
  },
  h4: {
    fontSize: 18,
    fontWeight: "600" as const,
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

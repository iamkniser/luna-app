import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { getExpectedOvulationDate } from "@/src/services/cycleCalculations";
import type { CycleStatus } from "@/src/types/cycle";
import type { User } from "@/src/types/user";
import { formatDateShort } from "@/src/utils/dateHelpers";
import { CycleParameter } from "./CycleParameter";

interface CycleParametersSectionProps {
  user: User;
  cycleStatus: CycleStatus | null;
}

const CycleParametersSectionComponent = ({
  user,
  cycleStatus,
}: CycleParametersSectionProps) => {
  const parameters: { label: string; value: string }[] = [];

  parameters.push({
    label: "Средняя длина",
    value: `${user.averageCycleLength} дней`,
  });

  if (user.lastPeriodDate) {
    parameters.push({
      label: "Начало последней менструации",
      value: formatDateShort(user.lastPeriodDate),
    });
  }

  if (cycleStatus?.daysUntilNextPeriod !== undefined) {
    parameters.push({
      label: "До следующей менструации",
      value: `${cycleStatus.daysUntilNextPeriod} дней`,
    });
  }

  if (user.lastPeriodDate) {
    const ovulationDate = getExpectedOvulationDate(user);
    if (ovulationDate) {
      parameters.push({
        label: "Ожидаемая овуляция",
        value: formatDateShort(ovulationDate),
      });
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Параметры цикла</Text>
      <View style={styles.parametersContainer}>
        {parameters.map((parameter, index) => (
          <CycleParameter
            key={parameter.label}
            label={parameter.label}
            value={parameter.value}
            isLast={index === parameters.length - 1}
          />
        ))}
        {/* {cycleStatus &&
          (() => {
            const daysLeft = getDaysUntilPhaseEnd(cycleStatus, user);
            if (daysLeft === null) return null;
            return (
              <CycleParameter
                label="До конца фазы"
                value={`${daysLeft} дней`}
              />
            );
          })()} */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontWeight: "600",
    fontSize: 16,
    color: colors.text.secondary,
    opacity: 0.85,
  },

  parametersContainer: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: colors.white,
  },
});

export const CycleParametersSection = memo(CycleParametersSectionComponent);

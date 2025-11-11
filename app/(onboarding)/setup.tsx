import { OnboardingData } from "@/src/types/user";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useRouter } from "expo-router";
import { ReactElement, useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/src/components/common/Button";
import DateInput from "@/src/components/common/DateInput";
import InfoBox from "@/src/components/common/InfoBox";
import Input from "@/src/components/common/Input";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";
import { useUserStore } from "@/src/store/userStore";

const DEFAULT_CYCLE = 28;

const SetupScreen = (): ReactElement => {
  const router = useRouter();
  const completeOnboarding = useUserStore((state) => state.completeOnboarding);

  const [name, setName] = useState<string>("");
  const [lastPeriodDate, setLastPeriodDate] = useState<Date>(new Date());
  const [cycleLength, setCycleLength] = useState<number>(DEFAULT_CYCLE);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const formattedDate = useMemo(
    () => format(lastPeriodDate, "dd MMMM yyyy", { locale: ru }),
    [lastPeriodDate]
  );

  const validate = (): boolean => {
    if (name.length > 50) {
      Alert.alert("Имя слишком длинное", "Пожалуйста, сократи до 50 символов.");
      return false;
    }

    const today = new Date();
    if (lastPeriodDate > today) {
      Alert.alert("Некорректная дата", "Дата не может быть в будущем.");
      return false;
    }

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    if (lastPeriodDate < threeMonthsAgo) {
      Alert.alert(
        "Слишком давняя дата",
        "Укажи дату за последние 3 месяца для точных расчётов."
      );
      return false;
    }

    if (cycleLength < 21 || cycleLength > 45) {
      Alert.alert(
        "Некорректная длина цикла",
        "Длина цикла должна быть от 21 до 45 дней."
      );
      return false;
    }

    return true;
  };

  const handleCycleChange = (text: string) => {
    const numericValue = text.replace(/[^0-9]/g, "");
    const parsed = Number(numericValue);
    if (!Number.isNaN(parsed)) {
      setCycleLength(parsed);
    } else if (numericValue === "") {
      setCycleLength(0);
    }
  };

  const handleSave = () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);

    const onboardingData: OnboardingData = {
      name: name.trim() || "Пользователь",
      lastPeriodDate: lastPeriodDate.toISOString(),
      averageCycleLength: cycleLength || DEFAULT_CYCLE,
    };

    completeOnboarding(onboardingData);
    setTimeout(() => {
      setIsSaving(false);
      router.replace("/(tabs)");
    }, 300);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={[typography.h1, styles.title]}>
              Начальные настройки
            </Text>
            <Text style={[typography.body, styles.subtitle]}>
              Эти данные нужны для расчёта следующего цикла и овуляции
            </Text>
          </View>

          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.formContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Input
              label="Как тебя зовут? (необязательно)"
              value={name}
              onChangeText={setName}
              placeholder="Например, Алёна"
            />

            <DateInput
              label="Дата начала последней менструации"
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
            />

            <View style={styles.cycleWrapper}>
              <Input
                label="Средняя длина цикла (дней)"
                value={cycleLength ? String(cycleLength) : ""}
                onChangeText={handleCycleChange}
                keyboardType="numeric"
                placeholder="28"
                required
              />
              <Text style={styles.hint}>
                Обычно от 21 до 35 дней, в среднем — 28
              </Text>
            </View>

            <InfoBox text="Не переживай, если не знаешь точную длину цикла — можешь изменить это позже в настройках" />
            <View style={styles.spacer} />
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title={`Сохранить (${formattedDate})`}
              onPress={handleSave}
              fullWidth
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 48,
  },
  header: {
    paddingVertical: 24,
    gap: 12,
  },
  title: {
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    lineHeight: 22,
  },
  formContent: {
    gap: 20,
    paddingBottom: 40,
  },
  cycleWrapper: {
    gap: 12,
  },
  hint: {
    ...typography.caption,
    color: colors.text.light,
  },
  footer: {
    paddingTop: 16,
  },
  spacer: {
    height: 120,
  },
});

export default SetupScreen;

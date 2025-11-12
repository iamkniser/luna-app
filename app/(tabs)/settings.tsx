import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/src/components/common/Button";
import DateInput from "@/src/components/common/DateInput";
import Input from "@/src/components/common/Input";
import { SettingsSection } from "@/src/components/settings/SettingsSection";
import { APP_INFO } from "@/src/constants/app";
import { colors } from "@/src/constants/colors";
import { useCycleStore } from "@/src/store/cycleStore";
import { useUserStore } from "@/src/store/userStore";

export default function SettingsScreen() {
  const user = useUserStore((state) => state.user);
  const updateUser = useUserStore((state) => state.updateUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [cycleLength, setCycleLength] = useState(
    user?.averageCycleLength ? String(user.averageCycleLength) : "28"
  );
  const [lastPeriodDate, setLastPeriodDate] = useState(
    user?.lastPeriodDate ? new Date(user.lastPeriodDate) : new Date()
  );

  if (!user) {
    return null;
  }

  const hasChanges =
    name !== (user.name ?? "") ||
    parseInt(cycleLength, 10) !== user.averageCycleLength ||
    lastPeriodDate.toISOString() !== user.lastPeriodDate;

  const validate = (): boolean => {
    if (name.length > 50) {
      Alert.alert("Ошибка", "Имя слишком длинное (максимум 50 символов)");
      return false;
    }

    const length = parseInt(cycleLength, 10);
    if (Number.isNaN(length) || length < 21 || length > 45) {
      Alert.alert("Ошибка", "Длина цикла должна быть от 21 до 45 дней");
      return false;
    }

    if (lastPeriodDate > new Date()) {
      Alert.alert("Ошибка", "Дата не может быть в будущем");
      return false;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    if (lastPeriodDate < sixMonthsAgo) {
      Alert.alert(
        "Ошибка",
        "Дата слишком давняя. Укажите дату за последние 6 месяцев."
      );
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (!validate()) return;

    updateUser({
      name: name.trim() || "Пользователь",
      averageCycleLength: parseInt(cycleLength, 10),
      lastPeriodDate: lastPeriodDate.toISOString(),
    });

    Alert.alert("Готово", "Параметры сохранены");
  };

  const handleResetData = () => {
    Alert.alert(
      "Сбросить все данные?",
      "Это действие удалит все твои данные о циклах, настроении и заметки. Восстановить их будет невозможно.",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            clearUser();
            useCycleStore.setState({ cycles: [], dailyLogs: [] });
            Alert.alert("Готово", "Все данные удалены");
            router.replace("/(onboarding)/welcome");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Настройки</Text>
        </View>

        <SettingsSection title="Параметры цикла">
          <View style={styles.card}>
            <Input
              label="Как тебя зовут? (необязательно)"
              value={name}
              onChangeText={setName}
              placeholder="Например, Мария"
              variant="subtle"
            />

            <DateInput
              label="Дата начала последней менструации"
              value={lastPeriodDate}
              onChange={setLastPeriodDate}
              variant="subtle"
            />

            <Input
              label="Средняя длина цикла (дней)"
              value={cycleLength}
              onChangeText={setCycleLength}
              keyboardType="numeric"
              placeholder="28"
              variant="subtle"
            />

            <Text style={styles.hint}>
              Обычно от 21 до 35 дней, в среднем — 28
            </Text>

            {hasChanges && (
              <Button
                title="Сохранить изменения"
                onPress={handleSave}
                fullWidth
              />
            )}
          </View>
        </SettingsSection>

        <SettingsSection title="Управление данными">
          <View style={styles.card}>
            <Button
              title="Сбросить все данные"
              onPress={handleResetData}
              variant="danger"
              fullWidth
            />
          </View>
        </SettingsSection>

        <SettingsSection title="О приложении">
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Версия</Text>
              <Text style={styles.infoValue}>{APP_INFO.version}</Text>
            </View>
          </View>
        </SettingsSection>

        <View style={styles.footer}>
          <Text style={styles.footerText}>🔒 {APP_INFO.privacyText}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  hint: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: -8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 16,
    color: colors.text.primary,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

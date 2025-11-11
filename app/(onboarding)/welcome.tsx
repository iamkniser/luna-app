import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ReactElement } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/src/components/common/Button";
import { colors } from "@/src/constants/colors";
import { typography } from "@/src/constants/typography";

const WelcomeScreen = (): ReactElement => {
  const handleStart = () => {
    console.log("Navigate to onboarding setup");
    router.push("/(onboarding)/setup");
  };

  return (
    <LinearGradient
      colors={["#FAF5FF", "#FDF2F8"]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView
        style={styles.safeArea}
        edges={["top", "left", "right", "bottom"]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.topSection}>
              <View style={styles.header}>
                <View style={styles.logoCircle}>
                  <Ionicons name="moon" size={40} color={colors.primary} />
                </View>
                <Text style={[typography.h1, styles.title]}>Luna</Text>

                <Text style={[typography.body, styles.subtitle]}>
                  Отслеживай свой цикл, настроение и гармонию
                </Text>

                <View style={styles.calendarContainer}>
                  <View style={styles.calendarCircle}>
                    <LinearGradient
                      colors={[colors.primaryLight, "#F9F5FF"]}
                      style={styles.calendarGradient}
                    >
                      <MaterialCommunityIcons
                        name="calendar-today"
                        size={62}
                        color={colors.primaryDark}
                      />
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.description}>
                  <Text style={[typography.body, styles.descriptionText]}>
                    Полностью локальное приложение.
                  </Text>
                  <Text style={[typography.body, styles.descriptionText]}>
                    Без регистрации. Без интернета.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.bottomSection}>
              <View style={styles.buttonWrapper}>
                <Button title="Начать" onPress={handleStart} fullWidth />
              </View>
              <Text style={[typography.caption, styles.footer]}>
                Твои данные всегда остаются только у тебя
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  topSection: {
    alignItems: "center",
    paddingBottom: 52,
  },
  header: {
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(168, 85, 247, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    color: colors.text.secondary,
    maxWidth: 280,
    lineHeight: 24,
    marginBottom: 40,
  },
  calendarContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  calendarCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "rgba(147, 51, 234, 0.25)",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 12,
  },
  calendarGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  calendarBadge: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 4,
    shadowColor: "rgba(147, 51, 234, 0.18)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  calendarDate: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryDark,
    letterSpacing: 1,
  },
  description: {
    alignItems: "center",
    gap: 4,
  },
  descriptionText: {
    textAlign: "center",
    color: colors.text.secondary,
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: "center",
    marginTop: 56,
    width: "100%",
  },
  buttonWrapper: {
    alignSelf: "stretch",
    marginBottom: 20,
  },
  footer: {
    textAlign: "center",
    color: colors.text.light,
    fontSize: 12,
    lineHeight: 18,
    maxWidth: 260,
  },
});

export default WelcomeScreen;

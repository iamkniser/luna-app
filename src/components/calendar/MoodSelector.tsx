import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/constants/colors";
import { DailyLog } from "@/src/types/cycle";

interface MoodSelectorProps {
  selectedMood?: DailyLog["mood"];
  onSelectMood: (mood: DailyLog["mood"]) => void;
}

const MOODS: {
  value: DailyLog["mood"];
  emoji: string;
  label: string;
}[] = [
  { value: "good", emoji: "🙂", label: "Хорошо" },
  { value: "neutral", emoji: "😐", label: "Нейтрально" },
  { value: "bad", emoji: "😣", label: "Плохо" },
  { value: "irritated", emoji: "😤", label: "Раздражение" },
  { value: "tired", emoji: "🥱", label: "Усталость" },
  { value: "libido_high", emoji: "🔥", label: "Либидо ↑" },
];

const COLUMNS = 4;
const GAP = 8;
const CONTAINER_PADDING = 20; // padding контейнера DayDetailsDrawer
const screenWidth = Dimensions.get("window").width;
const itemWidth =
  (screenWidth - CONTAINER_PADDING * 2 - GAP * (COLUMNS - 1)) / COLUMNS;

interface MoodButtonProps {
  mood: (typeof MOODS)[0];
  isSelected: boolean;
  onPress: () => void;
}

const MoodButton: React.FC<MoodButtonProps> = ({
  mood,
  isSelected,
  onPress,
}) => {
  return (
    <Pressable onPress={onPress} style={styles.moodButtonContainer}>
      <View
        style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
      >
        <Text style={styles.moodEmoji}>{mood.emoji}</Text>
        <Text
          style={[styles.moodLabel, isSelected && styles.moodLabelSelected]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
        >
          {mood.label}
        </Text>
      </View>
    </Pressable>
  );
};

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Как настроение?</Text>

      <View style={styles.moodGrid}>
        {MOODS.map((mood) => (
          <MoodButton
            key={mood.value}
            mood={mood}
            isSelected={selectedMood === mood.value}
            onPress={() => onSelectMood(mood.value)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  moodButtonContainer: {
    width: itemWidth,
    aspectRatio: 1,
  },
  moodButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    paddingVertical: 12,
    // paddingHorizontal: 8,
    gap: 8,
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primaryLight}20`,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
  },
  moodLabelSelected: {
    color: colors.primary,
  },
});

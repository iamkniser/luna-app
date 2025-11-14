import { colors } from "@/src/constants/colors";
import { DailyLog } from "@/src/types/cycle";
import { Pressable, StyleSheet, Text, View } from "react-native";

interface MoodSelectorProps {
  selectedMood?: DailyLog["mood"];
  onSelectMood: (mood: DailyLog["mood"]) => void;
}

const MOODS: Array<{ value: DailyLog["mood"]; emoji: string }> = [
  { value: "great", emoji: "🥰" },
  { value: "good", emoji: "😊" },
  { value: "okay", emoji: "😐" },
  { value: "bad", emoji: "😢" },
  { value: "awful", emoji: "😭" },
];

const ADDITIONAL_MOODS: Array<{ value: DailyLog["mood"]; emoji: string }> = [
  { value: "love", emoji: "😍" },
  { value: "happy", emoji: "😄" },
  { value: "sad", emoji: "😭" },
  { value: "sick", emoji: "🤒" },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Как настроение?</Text>

      <View style={styles.moodRow}>
        {MOODS.map((mood) => (
          <Pressable
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.moodButtonSelected,
            ]}
            onPress={() => onSelectMood(mood.value)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.moodRow}>
        {ADDITIONAL_MOODS.map((mood) => (
          <Pressable
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && styles.moodButtonSelected,
            ]}
            onPress={() => onSelectMood(mood.value)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  moodRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  moodButton: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primaryLight}20`,
  },
  moodEmoji: {
    fontSize: 32,
  },
});

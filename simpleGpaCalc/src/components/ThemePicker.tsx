import { Pressable, StyleSheet, Text, View } from "react-native";
import { availableThemes, useTheme } from "../context/ThemeContext";

export const ThemePicker = () => {
  const { theme, mode, setTheme } = useTheme();

  return (
    <View style={styles.grid}>
      {availableThemes.map((item) => {
        const active = mode === item;
        return (
          <Pressable
            key={item}
            onPress={() => setTheme(item)}
            style={[
              styles.card,
              {
                backgroundColor: theme.card,
                borderColor: active ? theme.accent : theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: theme.accent,
                },
              ]}
            />
            <Text
              style={[
                styles.label,
                { color: active ? theme.accent : theme.text },
              ]}
            >
              {item === "system" ? "System default" : item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  card: {
    width: "48%",
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dot: {
    height: 14,
    width: 14,
    borderRadius: 7,
  },
  label: {
    fontWeight: "700",
    textTransform: "capitalize",
  },
});

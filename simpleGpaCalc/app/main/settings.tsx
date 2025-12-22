import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useMemo } from 'react';
import { Theme, useTheme } from '../../src/context/ThemeContext';
import { ThemePicker } from '../../src/components/ThemePicker';
import { BannerAdView } from '../../src/ads/BannerAdView';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(() => createStyles(theme, uiScale), [theme, uiScale]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Theme</Text>
        <Text style={styles.subtle}>Pick the look you like best.</Text>
        <View style={styles.divider} />
        <ThemePicker />
      </View>
      <BannerAdView />
    </ScrollView>
  );
}

const createStyles = (theme: Theme, scale: number) => {
  const rs = (n: number) => Math.round(n * scale);

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: Math.max(12, Math.min(18, rs(14))),
      paddingVertical: Math.max(12, rs(16)),
      gap: rs(12),
    },
    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: rs(20),
      padding: rs(16),
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      color: theme.text,
      fontSize: rs(22),
      fontWeight: '800',
      marginBottom: rs(4),
    },
    subtle: {
      color: theme.subtle,
      fontSize: rs(14),
      marginBottom: rs(10),
    },
    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginBottom: rs(12),
    },
  });
};

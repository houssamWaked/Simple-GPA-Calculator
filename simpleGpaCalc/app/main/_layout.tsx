import { Slot, usePathname, router } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Theme, useTheme } from '../../src/context/ThemeContext';

const NavTabs = () => {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(() => createNavStyles(theme, uiScale), [theme, uiScale]);

  const isSemester = pathname === '/main' || pathname === '/main/index';
  const isCumulative = pathname?.startsWith('/main/cumulative');
  const isSettings = pathname?.startsWith('/main/settings');

  return (
    <View style={styles.navContainer}>
      <Pressable
        onPress={() => router.replace('/main')}
        style={[styles.navButton, isSemester && styles.navButtonActive]}
      >
        <Text style={[styles.navText, isSemester && styles.navTextActive]}>
          Semester
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/main/cumulative')}
        style={[styles.navButton, isCumulative && styles.navButtonActive]}
      >
        <Text style={[styles.navText, isCumulative && styles.navTextActive]}>
          Cumulative
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace('/main/settings')}
        style={[styles.navButton, isSettings && styles.navButtonActive]}
      >
        <Text style={[styles.navText, isSettings && styles.navTextActive]}>
          Settings
        </Text>
      </Pressable>
    </View>
  );
};

export default function RootLayout() {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 12,
        paddingTop: 12,
      }}
    >
      <NavTabs />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </View>
  );
}

const createNavStyles = (theme: Theme, scale: number) => {
  const rs = (n: number) => Math.round(n * scale);
  return StyleSheet.create({
    navContainer: {
      flexDirection: 'row',
      backgroundColor: theme.navBg,
      borderRadius: rs(16),
      borderWidth: 1,
      borderColor: theme.navBorder,
      overflow: 'hidden',
      marginTop: rs(20),
      marginBottom: rs(1),
    },
    navButton: {
      flex: 1,
      paddingVertical: rs(12),
      alignItems: 'center',
    },
    navButtonActive: {
      backgroundColor: theme.navActiveBg,
    },
    navText: {
      color: theme.navText,
      fontWeight: '800',
      fontSize: rs(14),
    },
    navTextActive: {
      color: theme.navTextActive,
    },
  });
};

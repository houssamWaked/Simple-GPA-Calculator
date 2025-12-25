import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ThemeMode =
  | "system"
  | "dark"
  | "light"
  | "emerald"
  | "ocean"
  | "sunset"
  | "midnight";

export type Theme = {
  background: string;
  card: string;
  cardAlt: string;
  border: string;
  borderMuted: string;
  text: string;
  subtle: string;
  input: string;
  accent: string;
  badge: string;
  muted: string;
  placeholder: string;
  navBg: string;
  navBorder: string;
  navActiveBg: string;
  navText: string;
  navTextActive: string;
  headerButtonBg: string;
  headerButtonBorder: string;
  gpaPanelBg: string;
  segmentBg: string;
  segmentBorder: string;
  segmentActiveBg: string;
  courseCardBg: string;
  divider: string;
  addBorder: string;
  addBg: string;
  shadow: string;
};

const palettes: Record<Exclude<ThemeMode, "system">, Theme> = {
  dark: {
    background: "#0b1a22",
    card: "#0f2430",
    cardAlt: "#0f2633",
    border: "#1e4a60",
    borderMuted: "#0f2c3a",
    text: "#e6f7ff",
    subtle: "#8bc5e6",
    input: "#0f2c3a",
    accent: "#2bb1ff",
    badge: "#0f2c3a",
    muted: "#78a6bc",
    placeholder: "#6a8da1",
    navBg: "#0f2430",
    navBorder: "#1e4a60",
    navActiveBg: "#123040",
    navText: "#78a6bc",
    navTextActive: "#2bb1ff",
    headerButtonBg: "#0f2c3a",
    headerButtonBorder: "#1e4a60",
    gpaPanelBg: "#0f2633",
    segmentBg: "#123445",
    segmentBorder: "#0f2c3a",
    segmentActiveBg: "#0f2c3a",
    courseCardBg: "#0f2633",
    divider: "#1c3f52",
    addBorder: "#1e4a60",
    addBg: "#0f2633",
    shadow: "#000000",
  },
  light: {
    background: "#f7faf7",
    card: "#ffffff",
    cardAlt: "#f5fbf6",
    border: "#cce0d5",
    borderMuted: "#b6cabc",
    text: "#0d2b21",
    subtle: "#4a7a63",
    input: "#e8f0e9",
    accent: "#1fa049",
    badge: "#e6f5ea",
    muted: "#5c7b6b",
    placeholder: "#7a8c80",
    navBg: "#ffffff",
    navBorder: "#cce0d5",
    navActiveBg: "#e6f2e9",
    navText: "#5c7b6b",
    navTextActive: "#1fa049",
    headerButtonBg: "#eef7f0",
    headerButtonBorder: "#cce0d5",
    gpaPanelBg: "#eef7f0",
    segmentBg: "#eef5f1",
    segmentBorder: "#cce0d5",
    segmentActiveBg: "#d9ecdf",
    courseCardBg: "#f5fbf6",
    divider: "#dbe8dd",
    addBorder: "#cce0d5",
    addBg: "#f5fbf6",
    shadow: "#6f8377",
  },
  emerald: {
    background: "#0b1812",
    card: "#0d2418",
    cardAlt: "#0f2b1c",
    border: "#195133",
    borderMuted: "#0f2e1d",
    text: "#e8fff0",
    subtle: "#91d9aa",
    input: "#0f2e1d",
    accent: "#2deb6e",
    badge: "#0f2e1d",
    muted: "#7db596",
    placeholder: "#6c8f7a",
    navBg: "#0f2e1d",
    navBorder: "#195133",
    navActiveBg: "#124028",
    navText: "#7db596",
    navTextActive: "#2deb6e",
    headerButtonBg: "#0f2e1d",
    headerButtonBorder: "#195133",
    gpaPanelBg: "#0f2b1c",
    segmentBg: "#143926",
    segmentBorder: "#0f2e1d",
    segmentActiveBg: "#113020",
    courseCardBg: "#0f2b1c",
    divider: "#19412b",
    addBorder: "#195133",
    addBg: "#0f2b1c",
    shadow: "#000000",
  },
  ocean: {
    background: "#0b1a22",
    card: "#0f2430",
    cardAlt: "#0f2633",
    border: "#1e4a60",
    borderMuted: "#0f2c3a",
    text: "#e6f7ff",
    subtle: "#8bc5e6",
    input: "#0f2c3a",
    accent: "#2bb1ff",
    badge: "#0f2c3a",
    muted: "#78a6bc",
    placeholder: "#6a8da1",
    navBg: "#0f2430",
    navBorder: "#1e4a60",
    navActiveBg: "#123040",
    navText: "#78a6bc",
    navTextActive: "#2bb1ff",
    headerButtonBg: "#0f2c3a",
    headerButtonBorder: "#1e4a60",
    gpaPanelBg: "#0f2633",
    segmentBg: "#123445",
    segmentBorder: "#0f2c3a",
    segmentActiveBg: "#0f2c3a",
    courseCardBg: "#0f2633",
    divider: "#1c3f52",
    addBorder: "#1e4a60",
    addBg: "#0f2633",
    shadow: "#000000",
  },
  sunset: {
    background: "#1f1512",
    card: "#2a1b17",
    cardAlt: "#2b1f1a",
    border: "#5a372f",
    borderMuted: "#3a261f",
    text: "#fff5ed",
    subtle: "#f2b8a2",
    input: "#2f201b",
    accent: "#ff7f50",
    badge: "#2f201b",
    muted: "#d99d86",
    placeholder: "#b28677",
    navBg: "#2a1b17",
    navBorder: "#5a372f",
    navActiveBg: "#3a261f",
    navText: "#d99d86",
    navTextActive: "#ff7f50",
    headerButtonBg: "#2f201b",
    headerButtonBorder: "#5a372f",
    gpaPanelBg: "#2b1f1a",
    segmentBg: "#35241e",
    segmentBorder: "#2f201b",
    segmentActiveBg: "#2a1b17",
    courseCardBg: "#2b1f1a",
    divider: "#4a3129",
    addBorder: "#5a372f",
    addBg: "#2b1f1a",
    shadow: "#000000",
  },
  midnight: {
    background: "#0b0f1a",
    card: "#11182a",
    cardAlt: "#131c31",
    border: "#23345a",
    borderMuted: "#131c31",
    text: "#edf0ff",
    subtle: "#9fb1df",
    input: "#131c31",
    accent: "#6f8dff",
    badge: "#131c31",
    muted: "#8090b5",
    placeholder: "#6d7a97",
    navBg: "#11182a",
    navBorder: "#23345a",
    navActiveBg: "#18213a",
    navText: "#8090b5",
    navTextActive: "#6f8dff",
    headerButtonBg: "#131c31",
    headerButtonBorder: "#23345a",
    gpaPanelBg: "#131c31",
    segmentBg: "#19243a",
    segmentBorder: "#131c31",
    segmentActiveBg: "#131c31",
    courseCardBg: "#131c31",
    divider: "#23345a",
    addBorder: "#23345a",
    addBg: "#131c31",
    shadow: "#000000",
  },
};

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  modes: ThemeMode[];
};

export const availableThemes = ["system", ...Object.keys(palettes)] as ThemeMode[];
const THEME_KEY = "app_theme_mode";

const ThemeContext = createContext<ThemeContextValue>({
  theme: palettes.dark,
  mode: "dark",
  setTheme: () => {},
  modes: availableThemes,
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [systemMode, setSystemMode] = useState<"light" | "dark">(
    Appearance.getColorScheme() === "light" ? "light" : "dark",
  );

  useEffect(() => {
    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemMode(colorScheme === "light" ? "light" : "dark");
    });
    return () => listener.remove();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY)
      .then((stored) => {
        if (stored && availableThemes.includes(stored as ThemeMode)) {
          setMode(stored as ThemeMode);
        } else {
          const fallback = Appearance.getColorScheme() === "light" ? "light" : "dark";
          setMode(fallback);
        }
      })
      .catch(() => {
        // ignore load errors; keep default
      });
  }, []);

  const persistMode = async (next: ThemeMode) => {
    setMode(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch {
      // ignore persistence errors; app should still work
    }
  };

  const resolvedPalette =
    mode === "system"
      ? palettes[systemMode] ?? palettes.dark
      : palettes[mode] ?? palettes.dark;

  const value = useMemo(
    () => ({
      mode,
      modes: availableThemes,
      theme: resolvedPalette,
      setTheme: (newMode: ThemeMode) => {
        persistMode(newMode);
      },
    }),
    [mode, resolvedPalette],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/context/ThemeContext';

export default function SplashLayout() {
  const { theme } = useTheme();
  const gradientStart = theme.card;
  const gradientEnd = theme.background;

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={styles.container}
    >
      <StatusBar hidden />
      <Slot />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

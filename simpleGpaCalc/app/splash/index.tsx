import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { theme } = useTheme();
  const gradientStart = theme.card;
  const gradientEnd = theme.background;

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/main');
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <LinearGradient
      colors={[gradientStart, gradientEnd]}
      style={styles.container}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
    >
      {/* Logo */}
      <View style={[styles.logoWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <MaterialIcons name="school" size={width * 0.25} color={theme.accent} />
        <View style={[styles.badge, { backgroundColor: theme.accent, borderColor: theme.background }]}>
          <Text style={[styles.badgeText, { color: theme.background }]}>A+</Text>
        </View>
      </View>

      {/* Title and subtitle */}
      <Text style={[styles.title, { color: theme.text }]}>GradePoint</Text>
      <Text style={[styles.subtitle, { color: theme.subtle }]}>
        Track. Calculate. Succeed.
      </Text>

      {/* Loader */}
      <ActivityIndicator
        size="large"
        color={theme.accent}
        style={styles.loader}
      />

      {/* Version */}
      <Text style={[styles.version, { color: theme.subtle }]}>v1.0.2</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 30,
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1.5,
  },
  badgeText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
    marginBottom: 40,
  },
  loader: {
    marginBottom: 40,
  },
  version: {
    position: 'absolute',
    bottom: 28,
    fontWeight: '600',
    letterSpacing: 1.5,
    fontSize: 12,
  },
});

import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CourseProvider } from '../src/context/CourseContext';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    // Dynamic import to avoid bundling native module on web.
    import('react-native-google-mobile-ads')
      .then((mod) => mod.default?.())
      .then((instance) => instance?.initialize?.())
      .catch(() => {
        // Ignore init failures; ads should not block app usage.
      });
  }, []);

  return (
    <ThemeProvider>
      <CourseProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'none',
          }}
          initialRouteName="splash"
        >
          <Stack.Screen name="splash" />
          <Stack.Screen name="main" />
        </Stack>
      </CourseProvider>
    </ThemeProvider>
  );
}

import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CourseProvider } from '../src/context/CourseContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CourseProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="splash" />
          <Stack.Screen name="onboarding" />
          <Stack.Screen name="main" />
        </Stack>
      </CourseProvider>
    </ThemeProvider>
  );
}

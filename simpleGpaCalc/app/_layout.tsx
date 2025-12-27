import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/context/ThemeContext';
import { CourseProvider } from '../src/context/CourseContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <CourseProvider>
          <SafeAreaProvider>
            <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
              <Stack
                screenOptions={{
                  headerShown: false,
                  gestureEnabled: true,
                  fullScreenGestureEnabled: false,
                }}
              >
                <Stack.Screen name="splash" options={{ gestureEnabled: false }} />
                <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
                <Stack.Screen name="main" />
              </Stack>
            </SafeAreaView>
          </SafeAreaProvider>
        </CourseProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

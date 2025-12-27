import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useCourses } from '../src/context/CourseContext';
import { useTheme } from '../src/context/ThemeContext';

export default function Index() {
  const { hydrated, planReady } = useCourses();
  const { theme } = useTheme();

  if (!hydrated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }] }>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return <Redirect href={planReady ? '/main' : '/onboarding'} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

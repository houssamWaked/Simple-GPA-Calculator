import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme, Theme } from '../src/context/ThemeContext';
import { Term, useCourses } from '../src/context/CourseContext';

const termOptions: Term[] = ['Fall', 'Spring', 'Summer'];

export default function OnboardingScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(() => createStyles(theme, uiScale), [theme, uiScale]);
  const router = useRouter();
  const { initializePlan, planReady } = useCourses();

  const [startYear, setStartYear] = useState('');
  const [startTerm, setStartTerm] = useState<Term>('Fall');
  const [programYears, setProgramYears] = useState('4');

  useEffect(() => {
    if (planReady) {
      router.replace('/main');
    }
  }, [planReady, router]);

  const onSubmit = () => {
    const numericYear = parseInt(startYear, 10);
    const numericProgramYears = Math.max(1, parseInt(programYears, 10) || 1);
    if (!Number.isFinite(numericYear) || numericYear < 1900) {
      Alert.alert('Invalid start year', 'Please enter a valid year (e.g., 2024).');
      return;
    }
    initializePlan(numericYear, startTerm, numericProgramYears);
    router.replace('/main');
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to GradePoint</Text>
        <Text style={styles.subtitle}>
          Tell us when you started and how long your program lasts. We will build your semesters
          automatically.
        </Text>

        <Text style={[styles.label, { marginTop: 8 }]}>Start Year</Text>
        <TextInput
          value={startYear}
          onChangeText={setStartYear}
          keyboardType="numeric"
          placeholder="e.g. 2024"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Start Term</Text>
        <View style={styles.termRow}>
          {termOptions.map((term) => {
            const active = startTerm === term;
            return (
              <TouchableOpacity
                key={term}
                activeOpacity={0.9}
                onPress={() => setStartTerm(term)}
                style={[
                  styles.termChip,
                  {
                    backgroundColor: active ? theme.segmentActiveBg : theme.segmentBg,
                    borderColor: active ? theme.accent : theme.segmentBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.termChipText,
                    { color: active ? theme.accent : theme.navText },
                  ]}
                >
                  {term}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 12 }]}>Program Length (Years)</Text>
        <TextInput
          value={programYears}
          onChangeText={setProgramYears}
          keyboardType="numeric"
          placeholder="e.g. 4"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={onSubmit}>
          <Text style={styles.primaryButtonText}>Create My Semesters</Text>
        </TouchableOpacity>
      </View>
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
      borderRadius: rs(22),
      padding: rs(18),
      borderWidth: 1,
      borderColor: theme.border,
    },
    title: {
      color: theme.text,
      fontSize: rs(24),
      fontWeight: '900',
      marginBottom: rs(6),
    },
    subtitle: {
      color: theme.subtle,
      fontSize: rs(15),
      marginBottom: rs(12),
      lineHeight: rs(20),
    },
    label: {
      color: theme.subtle,
      fontSize: rs(13),
      fontWeight: '700',
      marginBottom: rs(6),
    },
    input: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.input,
      borderRadius: rs(12),
      paddingHorizontal: rs(12),
      paddingVertical: rs(12),
      color: theme.text,
      fontWeight: '700',
      fontSize: rs(16),
    },
    placeholder: {
      color: theme.placeholder,
    },
    termRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: rs(8),
    },
    termChip: {
      paddingVertical: rs(10),
      paddingHorizontal: rs(14),
      borderRadius: rs(12),
      borderWidth: 1,
    },
    termChipText: {
      fontWeight: '800',
      fontSize: rs(14),
    },
    primaryButton: {
      marginTop: rs(18),
      backgroundColor: theme.accent,
      borderRadius: rs(14),
      paddingVertical: rs(14),
      alignItems: 'center',
    },
    primaryButtonText: {
      color: theme.background,
      fontWeight: '900',
      fontSize: rs(16),
      letterSpacing: 0.3,
    },
  });
};

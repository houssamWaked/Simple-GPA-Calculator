import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Theme, useTheme } from '../../src/context/ThemeContext';
import { ThemePicker } from '../../src/components/ThemePicker';
import { Term, useCourses } from '../../src/context/CourseContext';

const termOptions: Term[] = ['Fall', 'Spring', 'Summer'];

export default function SettingsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(() => createStyles(theme, uiScale), [theme, uiScale]);
  const {
    plan,
    planReady,
    initializePlan,
    updatePlan,
  } = useCourses();

  const [startYear, setStartYear] = useState(plan.startYear ? String(plan.startYear) : '');
  const [programYears, setProgramYears] = useState(
    plan.programYears ? String(plan.programYears) : '4'
  );
  const [startTerm, setStartTerm] = useState<Term>(plan.startTerm ?? 'Fall');
  useEffect(() => {
    setStartYear(plan.startYear ? String(plan.startYear) : '');
    setProgramYears(plan.programYears ? String(plan.programYears) : '4');
    setStartTerm(plan.startTerm ?? 'Fall');
  }, [plan.startYear, plan.startTerm, plan.programYears]);

  const onSavePlan = () => {
    const numericYear = parseInt(startYear, 10);
    const numericProgramYears = Math.max(1, parseInt(programYears, 10) || 1);
    if (!Number.isFinite(numericYear) || numericYear < 1900) {
      Alert.alert('Invalid start year', 'Please enter a valid year (e.g., 2024).');
      return;
    }

    if (planReady) {
      updatePlan(numericYear, startTerm, numericProgramYears);
    } else {
      initializePlan(numericYear, startTerm, numericProgramYears);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
      <View style={styles.card}>
        <Text style={styles.title}>Academic Plan</Text>
        <Text style={styles.subtle}>
          Set your start semester, program length, and pick the semester you are currently in.
        </Text>
        <View style={styles.divider} />

        <Text style={styles.fieldLabel}>Start Year</Text>
        <TextInput
          value={startYear}
          onChangeText={setStartYear}
          keyboardType="numeric"
          placeholder="e.g. 2024"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
        />

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Start Term</Text>
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

        <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Program Length (Years)</Text>
        <TextInput
          value={programYears}
          onChangeText={setProgramYears}
          keyboardType="numeric"
          placeholder="e.g. 4"
          placeholderTextColor={styles.placeholder.color}
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveButton} activeOpacity={0.9} onPress={onSavePlan}>
          <Text style={styles.saveButtonText}>
            {planReady ? 'Update Plan' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Theme</Text>
        <Text style={styles.subtle}>Pick the look you like best.</Text>
        <View style={styles.divider} />
        <ThemePicker />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
      marginVertical: rs(12),
    },
    fieldLabel: {
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
    semChip: {
      paddingVertical: rs(10),
      paddingHorizontal: rs(12),
      borderRadius: rs(12),
      borderWidth: 1,
    },
    semChipText: {
      fontWeight: '700',
      fontSize: rs(13),
    },
    helperText: {
      marginTop: rs(8),
      color: theme.subtle,
      fontSize: rs(13),
    },
    saveButton: {
      marginTop: rs(18),
      backgroundColor: theme.accent,
      borderRadius: rs(14),
      paddingVertical: rs(14),
      alignItems: 'center',
    },
    saveButtonText: {
      color: theme.background,
      fontWeight: '900',
      fontSize: rs(16),
      letterSpacing: 0.3,
    },
  });
};

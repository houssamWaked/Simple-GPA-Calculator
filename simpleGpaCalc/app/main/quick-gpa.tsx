import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { ScaleKey, scaleMeta } from '../../src/constants/gpa';
import { Theme, useTheme } from '../../src/context/ThemeContext';

const scales: ScaleKey[] = ['four', 'five', 'percentage'];

export default function QuickGpaScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);
  const [scale, setScale] = useState<ScaleKey>('four');
  const [currentGpa, setCurrentGpa] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');
  const [semesterGpa, setSemesterGpa] = useState('');
  const [semesterCredits, setSemesterCredits] = useState('');

  const result = useMemo(() => {
    if (![currentGpa, currentCredits, semesterGpa, semesterCredits].every((value) => value.trim().length > 0)) return null;
    const firstGpa = Number(currentGpa);
    const firstCredits = Number(currentCredits);
    const secondGpa = Number(semesterGpa);
    const secondCredits = Number(semesterCredits);
    if (![firstGpa, firstCredits, secondGpa, secondCredits].every(Number.isFinite)) return null;
    if (firstCredits < 0 || secondCredits < 0 || firstCredits + secondCredits === 0) return null;
    const max = scaleMeta[scale].max;
    if (firstGpa < 0 || secondGpa < 0 || firstGpa > max || secondGpa > max) return null;
    return {
      gpa: (firstGpa * firstCredits + secondGpa * secondCredits) / (firstCredits + secondCredits),
      credits: firstCredits + secondCredits,
    };
  }, [currentGpa, currentCredits, semesterGpa, semesterCredits, scale]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Quick GPA</Text>
          <Text style={styles.subtitle}>Combine your GPA so far with one new semester. This calculation is temporary and will not change saved courses or grades.</Text>
          <View style={styles.scaleRow}>
            {scales.map((item) => (
              <Text key={item} onPress={() => setScale(item)} style={[styles.scaleChip, scale === item && styles.scaleChipActive]}>{scaleMeta[item].label}</Text>
            ))}
          </View>
          <Text style={styles.sectionTitle}>GPA so far</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Current GPA</Text>
              <TextInput value={currentGpa} onChangeText={setCurrentGpa} keyboardType="decimal-pad" placeholder={`0 – ${scaleMeta[scale].max}`} placeholderTextColor={theme.placeholder} style={styles.input} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Credits completed</Text>
              <TextInput value={currentCredits} onChangeText={setCurrentCredits} keyboardType="decimal-pad" placeholder="e.g. 36" placeholderTextColor={theme.placeholder} style={styles.input} />
            </View>
          </View>
          <Text style={styles.sectionTitle}>New semester</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Semester GPA</Text>
              <TextInput value={semesterGpa} onChangeText={setSemesterGpa} keyboardType="decimal-pad" placeholder={`0 – ${scaleMeta[scale].max}`} placeholderTextColor={theme.placeholder} style={styles.input} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.label}>Semester credits</Text>
              <TextInput value={semesterCredits} onChangeText={setSemesterCredits} keyboardType="decimal-pad" placeholder="e.g. 15" placeholderTextColor={theme.placeholder} style={styles.input} />
            </View>
          </View>
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>NEW CUMULATIVE GPA</Text>
            <Text style={styles.resultValue}>{result ? result.gpa.toFixed(scale === 'percentage' ? 1 : 2) : '—'}</Text>
            <Text style={styles.resultHint}>{result ? `${result.credits.toFixed(1)} total credits` : 'Enter both GPA and credit totals to calculate'}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: Theme, width: number) => {
  const scale = Math.max(0.85, Math.min(1.1, width / 390));
  const rs = (value: number) => Math.round(value * scale);
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme.background },
    content: { paddingHorizontal: 2, paddingVertical: 8 },
    card: { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: rs(20), padding: rs(16) },
    title: { color: theme.text, fontSize: rs(25), fontWeight: '900' },
    subtitle: { color: theme.subtle, fontSize: rs(14), lineHeight: rs(20), marginTop: rs(5), marginBottom: rs(16) },
    scaleRow: { flexDirection: 'row', gap: rs(7), marginBottom: rs(20) },
    scaleChip: { flex: 1, overflow: 'hidden', textAlign: 'center', paddingVertical: rs(10), borderRadius: rs(11), color: theme.navText, backgroundColor: theme.segmentBg, fontSize: rs(12), fontWeight: '800' },
    scaleChipActive: { color: theme.accent, backgroundColor: theme.segmentActiveBg },
    sectionTitle: { color: theme.text, fontSize: rs(16), fontWeight: '900', marginBottom: rs(9), marginTop: rs(2) },
    inputRow: { flexDirection: 'row', gap: rs(10), marginBottom: rs(17) },
    inputBox: { flex: 1 },
    label: { color: theme.subtle, fontSize: rs(12), fontWeight: '800', marginBottom: rs(6) },
    input: { minHeight: rs(48), paddingHorizontal: rs(11), borderRadius: rs(11), borderWidth: 1, borderColor: theme.border, backgroundColor: theme.input, color: theme.text, fontSize: rs(16), fontWeight: '800' },
    resultCard: { marginTop: rs(2), borderRadius: rs(16), padding: rs(16), backgroundColor: theme.gpaPanelBg, borderWidth: 1, borderColor: theme.border },
    resultLabel: { color: theme.muted, fontSize: rs(11), letterSpacing: 0.8, fontWeight: '900' },
    resultValue: { color: theme.accent, fontSize: rs(38), fontWeight: '900', marginTop: rs(4) },
    resultHint: { color: theme.subtle, fontSize: rs(12), marginTop: rs(3) },
  });
};

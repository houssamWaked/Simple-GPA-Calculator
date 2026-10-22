import { Ionicons } from '@expo/vector-icons';
import { Slot, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme, useTheme } from '../../src/context/ThemeContext';
import { useCourses } from '../../src/context/CourseContext';
import { exportGradesCsv, importGradesCsv } from '../../src/utils/gradeCsv';

const routes = [
  { label: 'Semester GPA', path: '/main', icon: 'school-outline' as const },
  { label: 'Cumulative GPA', path: '/main/cumulative', icon: 'stats-chart-outline' as const },
  { label: 'Quick GPA', path: '/main/quick-gpa', icon: 'calculator-outline' as const },
  { label: 'Settings', path: '/main/settings', icon: 'settings-outline' as const },
];

export default function MainLayout() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme, width), [theme, width]);
  const {
    planReady,
    hydrated,
    semesters,
    currentSemester,
    setCurrentSemester,
    coursesBySemester,
    replaceSemesterCourses,
  } = useCourses();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [semesterPickerOpen, setSemesterPickerOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !planReady) router.replace('/onboarding');
  }, [hydrated, planReady]);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  const exportCsv = async () => {
    try {
      const csv = exportGradesCsv(semesters, coursesBySemester);
      setDrawerOpen(false);
      if (Platform.OS === 'web') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'gradepoint-grades.csv';
        link.click();
        URL.revokeObjectURL(link.href);
        return;
      }
      const uri = `${FileSystem.cacheDirectory}gradepoint-grades.csv`;
      await FileSystem.writeAsStringAsync(uri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Export grades' });
      } else {
        showMessage('Sharing unavailable', 'This device cannot share files right now.');
      }
    } catch (error) {
      showMessage('Export failed', error instanceof Error ? error.message : 'Could not export grades.');
    }
  };

  const importCsv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'text/plain'],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const contents = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const grouped = importGradesCsv(contents, semesters);
      const courseCount = Object.values(grouped).reduce((count, rows) => count + rows.length, 0);
      const semesterCount = Object.keys(grouped).length;
      const applyImport = () => {
        Object.entries(grouped).forEach(([semesterId, rows]) => {
          replaceSemesterCourses(semesterId, rows);
        });
        setDrawerOpen(false);
        showMessage('Import complete', `${courseCount} courses loaded into ${semesterCount} semesters.`);
      };
      const message = `${courseCount} courses in ${semesterCount} semesters will replace the courses in those semesters. Other semesters will be left as they are.`;
      if (Platform.OS === 'web') {
        if (window.confirm(message)) applyImport();
      } else {
        Alert.alert('Import grades?', message, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Import', onPress: applyImport },
        ]);
      }
    } catch (error) {
      showMessage('Import failed', error instanceof Error ? error.message : 'Could not read this CSV file.');
    }
  };

  return (
    <SafeAreaView style={{ flex:  1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => setDrawerOpen(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={24} color={theme.text} />
          </Pressable>
          <Text style={styles.brand}>GradePoint</Text>
          <View style={{ flex: 1 }} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setSemesterPickerOpen(true)}
          style={styles.semesterSelector}
        >
          <View>
            <Text style={styles.selectorCaption}>CURRENT SEMESTER</Text>
            <Text style={styles.selectorValue}>{currentSemester?.label ?? 'Choose semester'}</Text>
          </View>
          <Ionicons name="chevron-down" size={18} color={theme.accent} />
        </Pressable>

        <View style={{ flex: 1 }}><Slot /></View>
      </View>

      <Modal transparent visible={drawerOpen} animationType="fade" onRequestClose={() => setDrawerOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.scrim} onPress={() => setDrawerOpen(false)} />
          <SafeAreaView style={styles.drawer} edges={['top', 'bottom']}>
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerTitle}>GradePoint</Text>
                <Text style={styles.drawerSubtitle}>Your academic toolkit</Text>
              </View>
              <Pressable onPress={() => setDrawerOpen(false)} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.drawerContent}>
              <Text style={styles.groupLabel}>CALCULATE</Text>
              {routes.slice(0, 3).map((item) => (
                <Pressable key={item.path} style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push(item.path); }}>
                  <Ionicons name={item.icon} size={20} color={theme.accent} />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={17} color={theme.muted} />
                </Pressable>
              ))}
              <Text style={[styles.groupLabel, { marginTop: 20 }]}>YOUR DATA</Text>
              <Pressable style={styles.drawerItem} onPress={importCsv}>
                <Ionicons name="download-outline" size={20} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerItemText}>Import grades</Text>
                  <Text style={styles.itemHint}>Load a semester, course, grade, credits CSV</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={theme.muted} />
              </Pressable>
              <Pressable style={styles.drawerItem} onPress={exportCsv}>
                <Ionicons name="share-outline" size={20} color={theme.accent} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.drawerItemText}>Export grades</Text>
                  <Text style={styles.itemHint}>Save all semesters as a CSV table</Text>
                </View>
                <Ionicons name="chevron-forward" size={17} color={theme.muted} />
              </Pressable>
              <Text style={[styles.groupLabel, { marginTop: 20 }]}>PREFERENCES</Text>
              <Pressable style={styles.drawerItem} onPress={() => { setDrawerOpen(false); router.push('/main/settings'); }}>
                <Ionicons name="settings-outline" size={20} color={theme.accent} />
                <Text style={styles.drawerItemText}>Settings</Text>
                <Ionicons name="chevron-forward" size={17} color={theme.muted} />
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal transparent visible={semesterPickerOpen} animationType="fade" onRequestClose={() => setSemesterPickerOpen(false)}>
        <Pressable style={styles.pickerBackdrop} onPress={() => setSemesterPickerOpen(false)}>
          <Pressable style={styles.pickerCard} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.pickerTitle}>Current semester</Text>
            <ScrollView style={{ maxHeight: 380 }}>
              {semesters.map((semester) => {
                const active = semester.id === currentSemester?.id;
                return (
                  <Pressable key={semester.id} style={[styles.semesterOption, active && styles.semesterOptionActive]} onPress={() => { setCurrentSemester(semester.id); setSemesterPickerOpen(false); }}>
                    <Text style={[styles.semesterOptionText, active && { color: theme.accent }]}>{semester.label}</Text>
                    {active ? <Ionicons name="checkmark" size={18} color={theme.accent} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme, width: number) => StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 12, paddingTop: 6 },
  topBar: { height: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  brand: { color: theme.text, fontSize: 17, fontWeight: '900' },
  semesterSelector: { minHeight: 58, borderRadius: 15, paddingHorizontal: 14, marginTop: 6, marginBottom: 10, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selectorCaption: { color: theme.muted, fontSize: 10, letterSpacing: 0.8, fontWeight: '800' },
  selectorValue: { color: theme.text, fontSize: 16, fontWeight: '900', marginTop: 2 },
  modalRoot: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.48)' },
  scrim: { ...StyleSheet.absoluteFillObject },
  drawer: { width: Math.min(width * 0.84, 360), backgroundColor: theme.background, borderRightWidth: 1, borderColor: theme.border },
  drawerHeader: { paddingHorizontal: 20, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: theme.border },
  drawerTitle: { color: theme.text, fontSize: 22, fontWeight: '900' },
  drawerSubtitle: { color: theme.subtle, fontSize: 13, marginTop: 3 },
  closeButton: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.card },
  drawerContent: { paddingHorizontal: 14, paddingTop: 18, paddingBottom: 30 },
  groupLabel: { color: theme.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginHorizontal: 8, marginBottom: 8 },
  drawerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 13, marginBottom: 4, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  drawerItemText: { color: theme.text, fontSize: 15, fontWeight: '800', flex: 1 },
  itemHint: { color: theme.muted, fontSize: 11, marginTop: 3 },
  pickerBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerCard: { width: '100%', maxWidth: 380, padding: 16, borderRadius: 18, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
  pickerTitle: { color: theme.text, fontSize: 18, fontWeight: '900', marginBottom: 10 },
  semesterOption: { paddingHorizontal: 12, paddingVertical: 13, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  semesterOptionActive: { backgroundColor: theme.segmentActiveBg },
  semesterOptionText: { color: theme.text, fontSize: 15, fontWeight: '700' },
});

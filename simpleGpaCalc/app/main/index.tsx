import { useEffect, useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  Course,
  ScaleKey,
  formatGradeLabel,
  gradeOptions,
  scaleMeta,
  summarizeCourses,
} from '../../src/constants/gpa';
import { Theme, useTheme } from '../../src/context/ThemeContext';
import { useCourses } from '../../src/context/CourseContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const scaleChips: ScaleKey[] = ['four', 'five', 'percentage'];

const SegmentControl = ({
  value,
  onChange,
  styles,
}: {
  value: ScaleKey;
  onChange: (next: ScaleKey) => void;
  styles: ReturnType<typeof createStyles>;
}) => (
  <View style={styles.segmentContainer}>
    {scaleChips.map((scale) => (
      <TouchableOpacity
        key={scale}
        onPress={() => onChange(scale)}
        activeOpacity={0.9}
        style={[
          styles.segmentButton,
          value === scale && styles.segmentButtonActive,
        ]}
      >
        <Text
          style={[
            styles.segmentText,
            value === scale && styles.segmentTextActive,
          ]}
        >
          {scaleMeta[scale].label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

const CourseRow = ({
  course,
  onChange,
  onRemove,
  openId,
  setOpenId,
  styles,
  scale,
  canRemove,
}: {
  course: Course;
  onChange: (next: Course) => void;
  onRemove: (id: string) => void;
  openId: string | null;
  setOpenId: (value: string | null) => void;
  styles: ReturnType<typeof createStyles>;
  scale: ScaleKey;
  canRemove: boolean;
}) => {
  const showDropdown = openId === course.id;

  return (
    <SafeAreaView>
      <View style={styles.courseCard}>
        <Text style={styles.label}>Course Name</Text>
        <TextInput
          placeholder="e.g. History of Art"
          placeholderTextColor={styles.placeholder.color}
          style={styles.courseInput}
          value={course.name}
          onChangeText={(text) => onChange({ ...course, name: text })}
        />
        <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
          <Text style={styles.label}>Grade</Text>
          {scale === 'percentage' ? (
            <TextInput
              placeholder="0 - 100"
              placeholderTextColor={styles.placeholder.color}
              keyboardType="numeric"
              value={course.grade}
              onChangeText={(text) => onChange({ ...course, grade: text })}
              style={styles.select}
            />
          ) : (
            <>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setOpenId(showDropdown ? null : course.id)}
                style={styles.select}
              >
                <Text style={styles.selectText}>
                  {course.grade
                    ? formatGradeLabel(course.grade, scale)
                    : 'Select'}
                </Text>
                <Ionicons
                  name={showDropdown ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={styles.selectText.color as string}
                />
              </TouchableOpacity>
              {showDropdown ? (
                <View style={styles.dropdown}>
                  {gradeOptions.map((grade) => (
                    <TouchableOpacity
                      key={grade}
                      onPress={() => {
                        onChange({ ...course, grade });
                        setOpenId(null);
                      }}
                      style={styles.dropdownItem}
                    >
                      <Text style={styles.dropdownText}>
                        {formatGradeLabel(grade, scale)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </>
          )}
        </View>
          <View style={[styles.inputGroup, styles.creditGroup]}>
            <Text style={styles.label}>Credits</Text>
            <View style={styles.creditRow}>
              <TextInput
                placeholder="0"
                placeholderTextColor={styles.placeholder.color}
                keyboardType="numeric"
                value={course.credits}
                onChangeText={(text) => onChange({ ...course, credits: text })}
                style={styles.creditInput}
              />
              {canRemove ? (
                <TouchableOpacity
                  onPress={() => onRemove(course.id)}
                  style={styles.trashButton}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={styles.sectionMeta.color as string}
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const CourseList = ({
  courses,
  scale,
  styles,
  onRemoveCourse,
  onUpdateCourse,
  onAddCourse,
  onClearSemester,
  onDuplicateName,
}: {
  courses: Course[];
  scale: ScaleKey;
  styles: ReturnType<typeof createStyles>;
  onRemoveCourse: (id: string) => void;
  onUpdateCourse: (next: Course) => void;
  onAddCourse: () => void;
  onClearSemester: () => void;
  onDuplicateName: (next: Course) => void;
}) => {
  const [openId, setOpenId] = useState<string | null>(null);
  const confirmClear = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'This will remove all courses from this semester only.'
      );
      if (confirmed) onClearSemester();
      return;
    }
    Alert.alert(
      'Clear current semester?',
      'This will remove all courses from this semester only.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: onClearSemester },
      ],
      { cancelable: true }
    );
  };

  return (
    <View>
      {courses.map((course) => (
        <CourseRow
          key={course.id}
          course={course}
          onChange={(next) => {
            const normalized = next.name.trim().toLowerCase();
            const duplicate =
              normalized.length > 0 &&
              courses.some(
                (c) => c.id !== next.id && c.name.trim().toLowerCase() === normalized
              );
            if (duplicate) {
              onDuplicateName(next);
              return;
            }
            onUpdateCourse(next);
          }}
          onRemove={onRemoveCourse}
          openId={openId}
          setOpenId={setOpenId}
          styles={styles}
          scale={scale}
          canRemove={courses.length > 1}
        />
      ))}
      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.9}
        onPress={() => {
          setOpenId(null);
          onAddCourse();
        }}
      >
        <Ionicons
          name="add-circle-outline"
          size={18}
          color={styles.addButtonText.color as string}
        />
        <Text style={styles.addButtonText}>Add Another Course</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        activeOpacity={0.9}
        onPress={confirmClear}
      >
        <Text style={styles.clearButtonText}>Clear Semester</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function SemesterScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(
    () => createStyles(theme, uiScale, width),
    [theme, uiScale, width]
  );
  const {
    courses,
    addCourse,
    updateCourse,
    removeCourse,
    clearSemester,
    currentSemester,
    convertAllGrades,
    gradeScale,
  } = useCourses();
  const [scale, setScale] = useState<ScaleKey>(gradeScale);

  useEffect(() => {
    setScale(gradeScale);
  }, [gradeScale]);

  useEffect(() => {
    convertAllGrades(scale);
  }, [scale, convertAllGrades]);

  const summary = useMemo(
    () => summarizeCourses(courses, scale),
    [courses, scale]
  );

  const handleDuplicateName = (next: Course) => {
    const message =
      'You already have a course with this name in the semester. Are you retaking it or did you add it by mistake?';
    if (Platform.OS === 'web') {
      const keep = window.confirm(`${message}\n\nOK = Keep as retake\nCancel = Remove duplicate`);
      if (keep) {
        updateCourse(next);
      } else {
        updateCourse({ ...next, name: '' });
      }
      return;
    }
    Alert.alert('Duplicate course name', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove duplicate', style: 'destructive', onPress: () => updateCourse({ ...next, name: '' }) },
      { text: 'Keep as retake', onPress: () => updateCourse(next) },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Semester GPA</Text>
        </View>

        <View style={styles.gpaPanel}>
          <Text style={styles.subtleText}>Your GPA</Text>
          <Text style={styles.gpaValue}>{summary.displayGpa.toFixed(2)}</Text>
        </View>

        <SegmentControl value={scale} onChange={setScale} styles={styles} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Courses</Text>
          <Text style={styles.sectionMeta}>
            {currentSemester ? currentSemester.label : 'Select a semester'}
          </Text>
        </View>

        <CourseList
          courses={courses}
          scale={scale}
          styles={styles}
          onRemoveCourse={removeCourse}
          onUpdateCourse={updateCourse}
          onAddCourse={addCourse}
          onClearSemester={() => {
            clearSemester();
          }}
          onDuplicateName={handleDuplicateName}
        />
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme, uiScale: number, width: number) => {
  const rs = (n: number) => Math.round(n * uiScale);
  const creditWidth = Math.max(rs(120), Math.min(rs(170), width * 0.32));
  const gpaFont = Math.max(42, Math.min(64, rs(56)));

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    placeholder: {
      color: theme.placeholder,
    },
    content: {
      paddingHorizontal: Math.max(12, Math.min(18, rs(14))),
      paddingVertical: Math.max(12, rs(16)),
      gap: rs(10),
    },
    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: rs(24),
      padding: rs(18),
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: rs(6) },
      shadowRadius: rs(14),
      elevation: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: rs(10),
    },
    cardTitle: {
      color: theme.text,
      fontSize: rs(24),
      fontWeight: '800',
    },
    subtleText: {
      color: theme.subtle,
      fontSize: rs(13),
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: rs(6),
    },
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: theme.segmentBg,
      borderRadius: rs(16),
      borderWidth: 1,
      borderColor: theme.segmentBorder,
      overflow: 'hidden',
      marginTop: rs(12),
    },
    segmentButton: {
      flex: 1,
      paddingVertical: rs(14),
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme.segmentActiveBg,
    },
    segmentText: {
      color: theme.navText,
      fontSize: rs(14),
      fontWeight: '700',
    },
    segmentTextActive: {
      color: theme.navTextActive,
    },
    gpaPanel: {
      marginTop: rs(8),
      marginBottom: rs(12),
      alignItems: 'center',
      backgroundColor: theme.gpaPanelBg,
      borderRadius: rs(18),
      paddingVertical: rs(18),
      borderWidth: 1,
      borderColor: theme.segmentBorder,
    },
    gpaValue: {
      fontSize: gpaFont,
      color: theme.text,
      fontWeight: '900',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: rs(14),
      marginBottom: rs(10),
    },
    sectionTitle: {
      color: theme.text,
      fontSize: rs(20),
      fontWeight: '800',
    },
    sectionMeta: {
      color: theme.subtle,
      fontSize: rs(13),
    },
    label: {
      color: theme.subtle,
      fontSize: rs(12),
      marginBottom: rs(6),
      letterSpacing: 0.3,
      fontWeight: '700',
    },
    courseCard: {
      backgroundColor: theme.courseCardBg,
      borderRadius: rs(18),
      borderWidth: 1,
      borderColor: theme.border,
      padding: rs(14),
      marginBottom: rs(14),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: rs(10),
    },
    inputGroup: {
      flex: 1,
    },
    creditGroup: {
      width: creditWidth,
    },
    courseInput: {
      borderWidth: 0,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(12),
      paddingHorizontal: rs(14),
      paddingVertical: rs(12),
      fontSize: rs(16),
      fontWeight: '700',
    },
    select: {
      borderWidth: 0,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(12),
      paddingHorizontal: rs(14),
      paddingVertical: rs(14),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectText: {
      color: theme.text,
      fontSize: rs(16),
      fontWeight: '700',
    },
    dropdown: {
      marginTop: rs(6),
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
    },
    dropdownItem: {
      paddingHorizontal: rs(14),
      paddingVertical: rs(12),
      borderBottomColor: theme.divider,
      borderBottomWidth: 1,
    },
    dropdownText: {
      color: theme.text,
      fontSize: rs(15),
      fontWeight: '600',
    },
    creditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.input,
      borderRadius: rs(12),
      paddingLeft: rs(14),
      paddingRight: rs(6),
    },
    creditInput: {
      flex: 1,
      color: theme.text,
      fontSize: rs(16),
      fontWeight: '700',
      paddingVertical: rs(12),
    },
    trashButton: {
      height: rs(36),
      width: rs(36),
      borderRadius: rs(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.addBorder,
      borderRadius: rs(16),
      paddingVertical: rs(14),
      marginBottom: rs(14),
      borderStyle: 'dashed',
      backgroundColor: theme.addBg,
    },
    addButtonText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: rs(16),
      marginLeft: rs(8),
    },
    clearButton: {
      marginTop: rs(6),
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: rs(12),
      paddingVertical: rs(10),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.card,
    },
    clearButtonText: {
      color: theme.subtle,
      fontWeight: '700',
      fontSize: rs(14),
    },
  });
};

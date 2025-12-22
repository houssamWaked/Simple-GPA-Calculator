import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  Alert,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import {
  Course,
  ScaleKey,
  combineCumulative,
  formatGradeLabel,
  gradeOptions,
  scaleMeta,
} from '../../src/constants/gpa';
import { Theme, useTheme } from '../../src/context/ThemeContext';
import { useCourses } from '../../src/context/CourseContext';
import { useClearInterstitial } from '../../src/ads/useClearInterstitial';

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
    <View style={styles.courseCard}>
      <View style={styles.courseHeader}>
        <Text style={styles.courseLabel}>Course Name</Text>
        {canRemove ? (
          <TouchableOpacity
            onPress={() => onRemove(course.id)}
            style={styles.trashButton}
            activeOpacity={0.85}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={styles.mutedText.color as string}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      <TextInput
        placeholder="Course Name (Optional)"
        placeholderTextColor={styles.placeholder.color}
        style={styles.courseInput}
        value={course.name}
        onChangeText={(text) => onChange({ ...course, name: text })}
      />

      <View style={styles.courseDivider} />

      <View style={styles.inputRow}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
          <Text style={styles.fieldTitle}>Grade</Text>
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
                    : 'Select...'}
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
          <Text style={styles.fieldTitle}>Credits</Text>
          <TextInput
            placeholder="0"
            placeholderTextColor={styles.placeholder.color}
            keyboardType="numeric"
            value={course.credits}
            onChangeText={(text) => onChange({ ...course, credits: text })}
            style={styles.creditInput}
          />
        </View>
      </View>
    </View>
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
}: {
  courses: Course[];
  scale: ScaleKey;
  styles: ReturnType<typeof createStyles>;
  onRemoveCourse: (id: string) => void;
  onUpdateCourse: (next: Course) => void;
  onAddCourse: () => void;
  onClearSemester: () => void;
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
          onChange={onUpdateCourse}
          onRemove={onRemoveCourse}
          openId={openId}
          setOpenId={setOpenId}
          styles={styles}
          scale={scale}
          canRemove={courses.length > 1}
        />
      ))}
      <TouchableOpacity
        style={styles.addCard}
        activeOpacity={0.9}
        onPress={() => {
          setOpenId(null);
          onAddCourse();
        }}
      >
        <View style={styles.addIconCircle}>
          <Ionicons
            name="add"
            size={18}
            color={styles.addButtonText.color as string}
          />
        </View>
        <Text style={styles.addButtonText}>Add another course</Text>
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

export default function CumulativeScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const uiScale = Math.max(0.85, Math.min(1.2, width / 390));
  const styles = useMemo(
    () => createStyles(theme, uiScale, width),
    [theme, uiScale, width]
  );
  const { courses, addCourse, updateCourse, removeCourse, clearSemester } =
    useCourses();
  const { showInterstitialIfReady } = useClearInterstitial();
  const [scale, setScale] = useState<ScaleKey>('four');
  const [currentGpa, setCurrentGpa] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');

  const cumulativeSummary = useMemo(
    () => combineCumulative(currentGpa, currentCredits, courses, scale),
    [currentGpa, currentCredits, courses, scale]
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cumulative GPA</Text>
      </View>

      <SegmentControl value={scale} onChange={setScale} styles={styles} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="time-outline" size={18} color={theme.accent} />
          <Text style={styles.sectionLabel}>Past Performance</Text>
        </View>
        <View style={styles.fieldRow}>
          <View style={[styles.fieldBox, { marginRight: 12 }]}>
            <Text style={styles.fieldCaption}>Current GPA</Text>
            <TextInput
              placeholder="e.g. 3.45"
              placeholderTextColor={styles.placeholder.color}
              keyboardType="numeric"
              value={currentGpa}
              onChangeText={setCurrentGpa}
              style={styles.fieldInput}
            />
          </View>
          <View style={styles.fieldBox}>
            <Text style={styles.fieldCaption}>Credits Earned</Text>
            <TextInput
              placeholder="e.g. 60"
              placeholderTextColor={styles.placeholder.color}
              keyboardType="numeric"
              value={currentCredits}
              onChangeText={setCurrentCredits}
              style={styles.fieldInput}
            />
          </View>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <MaterialIcons name="school" size={18} color={theme.accent} />
          <Text style={styles.sectionLabel}>This Semester</Text>
        </View>

        <CourseList
          courses={courses}
          scale={scale}
          styles={styles}
          onRemoveCourse={removeCourse}
          onUpdateCourse={updateCourse}
          onAddCourse={addCourse}
          onClearSemester={() => {
            showInterstitialIfReady();
            clearSemester();
          }}
        />
      </View>

      <View style={styles.footerCard}>
        <View>
          <Text style={styles.footerLabel}>New Cumulative GPA</Text>
          <Text style={styles.footerValue}>
            {cumulativeSummary.gpa.toFixed(scale === 'percentage' ? 1 : 2)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: Theme, scale: number, width: number) => {
  const rs = (n: number) => Math.round(n * scale);
  const creditWidth = Math.max(rs(120), Math.min(rs(170), width * 0.32));

  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      paddingHorizontal: Math.max(12, Math.min(18, rs(14))),
      paddingVertical: Math.max(12, rs(16)),
      gap: rs(10),
    },
    placeholder: {
      color: theme.placeholder,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    title: {
      color: theme.text,
      fontSize: rs(22),
      fontWeight: '800',
    },
    segmentContainer: {
      flexDirection: 'row',
      backgroundColor: theme.segmentBg,
      borderRadius: rs(16),
      borderWidth: 1,
      borderColor: theme.segmentBorder,
      overflow: 'hidden',
    },
    segmentButton: {
      flex: 1,
      paddingVertical: rs(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    segmentButtonActive: {
      backgroundColor: theme.segmentActiveBg,
    },
    segmentText: {
      color: theme.navText,
      fontSize: rs(13),
      fontWeight: '700',
    },
    segmentTextActive: {
      color: theme.navTextActive,
    },
    sectionBlock: {
      marginTop: rs(6),
      gap: rs(8),
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(6),
    },
    sectionLabel: {
      color: theme.subtle,
      fontSize: rs(15),
      fontWeight: '800',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    fieldRow: {
      flexDirection: 'row',
      gap: rs(6),
    },
    fieldBox: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: rs(14),
      borderWidth: 1,
      borderColor: theme.border,
      padding: rs(12),
    },
    fieldCaption: {
      color: theme.subtle,
      fontWeight: '800',
      fontSize: rs(11),
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: rs(6),
    },
    fieldInput: {
      color: theme.text,
      fontSize: rs(18),
      fontWeight: '800',
      paddingVertical: rs(6),
    },
    courseCard: {
      backgroundColor: theme.courseCardBg,
      borderRadius: rs(16),
      borderWidth: 1,
      borderColor: theme.border,
      padding: rs(12),
      marginBottom: rs(12),
    },
    courseHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    courseLabel: {
      color: theme.subtle,
      fontSize: rs(12),
      fontWeight: '800',
    },
    mutedText: {
      color: theme.muted,
    },
    courseInput: {
      marginTop: rs(6),
      borderWidth: 0,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(12),
      paddingHorizontal: rs(12),
      paddingVertical: rs(11),
      fontSize: rs(18),
      fontWeight: '800',
    },
    courseDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: rs(10),
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(6),
    },
    inputGroup: {
      flex: 1,
    },
    creditGroup: {
      width: creditWidth,
    },
    fieldTitle: {
      color: theme.subtle,
      fontWeight: '800',
      fontSize: rs(12),
      marginBottom: rs(6),
    },
    select: {
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(12),
      paddingHorizontal: rs(12),
      paddingVertical: rs(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    selectText: {
      color: theme.text,
      fontSize: rs(15),
      fontWeight: '800',
    },
    dropdown: {
      marginTop: rs(8),
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
    },
    dropdownItem: {
      paddingHorizontal: rs(12),
      paddingVertical: rs(11),
      borderBottomColor: theme.divider,
      borderBottomWidth: 1,
    },
    dropdownText: {
      color: theme.text,
      fontSize: rs(14),
      fontWeight: '600',
    },
    creditInput: {
      borderWidth: 2,
      borderColor: theme.border,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(12),
      paddingHorizontal: rs(12),
      paddingVertical: rs(12),
      fontSize: rs(15),
      fontWeight: '800',
    },
    trashButton: {
      height: rs(28),
      width: rs(28),
      borderRadius: rs(10),
      alignItems: 'center',
      justifyContent: 'center',
    },
    addCard: {
      marginTop: rs(4),
      borderWidth: 2,
      borderColor: theme.addBorder,
      borderStyle: 'dashed',
      borderRadius: rs(16),
      paddingVertical: rs(12),
      paddingHorizontal: rs(12),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.addBg,
    },
    addIconCircle: {
      height: rs(30),
      width: rs(30),
      borderRadius: rs(15),
      backgroundColor: theme.segmentBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addButtonText: {
      color: theme.text,
      fontWeight: '800',
      fontSize: rs(14),
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
      fontSize: rs(13),
    },
    footerCard: {
      marginTop: rs(4),
      backgroundColor: theme.card,
      borderRadius: rs(16),
      borderWidth: 1,
      borderColor: theme.border,
      padding: rs(14),
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    footerLabel: {
      color: theme.muted,
      fontSize: rs(12),
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginBottom: rs(6),
    },
    footerValue: {
      fontSize: rs(32),
      fontWeight: '900',
      color: theme.text,
    },
  });
};

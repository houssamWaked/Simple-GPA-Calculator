import { useEffect, useMemo, useState } from 'react';
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
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { Switch } from 'react-native';

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
  const {
    courses,
    addCourse,
    addCourseWithData,
    markCourseRetaken,
    updateCourse,
    removeCourse,
    clearSemester,
    completedCourses,
    planReady,
    semesters,
    convertAllGrades,
    gradeScale,
    currentSemester,
  } = useCourses();
  const [scale, setScale] = useState<ScaleKey>(gradeScale);
  const [currentGpa, setCurrentGpa] = useState('');
  const [currentCredits, setCurrentCredits] = useState('');
  const [showBaseline, setShowBaseline] = useState(false);
  const [retakeGrades, setRetakeGrades] = useState<Record<string, string>>({});
  const [retakeQuery, setRetakeQuery] = useState('');
  const [selectedRetakes, setSelectedRetakes] = useState<string[]>([]);
  const [appliedRetakes, setAppliedRetakes] = useState<string[]>([]);

  useEffect(() => {
    setScale(gradeScale);
  }, [gradeScale]);

  useEffect(() => {
    convertAllGrades(scale);
  }, [scale, convertAllGrades]);

  const effectiveCompleted = useMemo(
    () => (showBaseline ? [] : completedCourses),
    [showBaseline, completedCourses]
  );

  const cumulativeSummary = useMemo(
    () =>
      combineCumulative(currentGpa, currentCredits, courses, scale, effectiveCompleted),
    [currentGpa, currentCredits, courses, scale, effectiveCompleted]
  );

  const hasBaseline = parseFloat(currentCredits) > 0;
  const hasCompleted = effectiveCompleted.length > 0;
  const hasCurrent = courses.some((c) => parseFloat(c.credits) > 0);
  const canShowCumulative = planReady && (hasBaseline || hasCompleted || hasCurrent);
  const normalizeName = (name: string) => name.trim().toLowerCase();

  const semesterMap = useMemo(
    () =>
      semesters.reduce<Record<string, string>>((acc, sem) => {
        acc[sem.id] = sem.label;
        return acc;
      }, {}),
    [semesters]
  );

  const semesterOrderMap = useMemo(
    () =>
      semesters.reduce<Record<string, number>>((acc, sem) => {
        acc[sem.id] = sem.order ?? 0;
        return acc;
      }, {}),
    [semesters]
  );

  const retakeOptions = useMemo(
    () =>
      Array.from(
        effectiveCompleted
          .filter((c) => parseFloat(c.credits) > 0)
          .reduce((map, course) => {
            const key = normalizeName(course.name || '');
            const order = semesterOrderMap[course.semesterId ?? ''] ?? -1;
            const existing = map.get(key);
            if (!existing || order > existing.order) {
              map.set(key, { course, order });
            }
            return map;
          }, new Map<string, { course: Course; order: number }>())
          .values()
      ).map(({ course }) => ({
        ...course,
        displayLabel: `${course.name || 'Course'} | ${
          semesterMap[course.semesterId ?? ''] || 'Past semester'
        } | ${course.credits || '0'} cr | ${course.grade || 'No grade'}${
          course.excludeFromCumulative ? ' | not in GPA' : ''
        }`,
      })),
    [effectiveCompleted, semesterMap, semesterOrderMap]
  );

  const filteredRetakeOptions = useMemo(() => {
    const term = retakeQuery.trim().toLowerCase();
    if (!term) return [];
    return retakeOptions.filter((opt) =>
      opt.name.trim().toLowerCase().includes(term)
    );
  }, [retakeOptions, retakeQuery]);

  const selectedRetakeOptions = useMemo(
    () =>
      retakeOptions.filter(
        (opt) => selectedRetakes.includes(opt.id)
      ),
    [retakeOptions, selectedRetakes]
  );

  const confirmAddRetake = (optId: string) => {
    const target = retakeOptions.find((o) => o.id === optId);
    if (!target) return;
    const newGrade = (retakeGrades[optId] || '').trim() || target.grade || '';
    const message = 'This course will be added to this semester. Are you sure?';
    const proceed = () => {
      if (currentSemester) {
        addCourseWithData({
          name: target.name,
          credits: target.credits,
          grade: newGrade,
          semesterId: currentSemester.id,
        });
        markCourseRetaken(target.name, currentSemester.id);
        setAppliedRetakes((prev) => (prev.includes(optId) ? prev : [...prev, optId]));
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(message)) proceed();
      return;
    }
    Alert.alert('Confirm retake', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Add to semester', style: 'destructive', onPress: proceed },
    ]);
  };

  const activeRetakes = useMemo(
    () =>
      selectedRetakeOptions
        .map((opt) => ({ ...opt, newGrade: (retakeGrades[opt.id] || '').trim() }))
        .filter((opt) => opt.newGrade.length),
    [selectedRetakeOptions, retakeGrades]
  );

  const canComputeRetake = activeRetakes.length > 0;

  const retakeSummary = useMemo(() => {
    if (!canComputeRetake) return null;
    const replacementMap = new Map(activeRetakes.map((r) => [r.id, r.newGrade]));
    const replaced = effectiveCompleted.map((c) =>
      replacementMap.has(c.id) ? { ...c, grade: replacementMap.get(c.id) || c.grade } : c
    );
    return combineCumulative(currentGpa, currentCredits, courses, scale, replaced);
  }, [
    canComputeRetake,
    activeRetakes,
    effectiveCompleted,
    currentGpa,
    currentCredits,
    courses,
    scale,
  ]);

  const retakeDelta = retakeSummary
    ? Number((retakeSummary.gpa - cumulativeSummary.gpa).toFixed(scale === 'percentage' ? 1 : 3))
    : 0;

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
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cumulative GPA</Text>
      </View>

      <SegmentControl value={scale} onChange={setScale} styles={styles} />

      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="time-outline" size={18} color={theme.accent} />
          <Text style={styles.sectionLabel}>Past Performance</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Use baseline</Text>
            <Switch value={showBaseline} onValueChange={(val) => {
              if (!val) {
                setCurrentGpa('');
                setCurrentCredits('');
              }
              setShowBaseline(val);
            }} />
          </View>
        </View>
        {showBaseline ? (
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
        ) : (
          <Text style={styles.helperText}>
            Toggle on to enter previous GPA and credits (optional).
          </Text>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="repeat-outline" size={18} color={theme.accent} />
          <Text style={styles.sectionLabel}>Retake Impact</Text>
        </View>

        {retakeOptions.length ? (
          <>
            <Text style={styles.helperCaption}>
              Enter new grades for any courses you plan to retake
            </Text>
            <TextInput
              value={retakeQuery}
              onChangeText={setRetakeQuery}
              placeholder="Search course name"
              placeholderTextColor={styles.placeholder.color}
              style={styles.searchInput}
            />
            {retakeQuery.trim().length === 0 ? (
              <Text style={styles.helperText}>Search to find a past course to retake.</Text>
            ) : (
              <View style={styles.searchResults}>
                {filteredRetakeOptions.map((opt) => {
                  const added = selectedRetakes.includes(opt.id);
                  return (
                    <View key={opt.id} style={styles.searchResultRow}>
                      <Text style={styles.searchResultLabel}>{opt.displayLabel}</Text>
                      <TouchableOpacity
                        disabled={added}
                        activeOpacity={0.85}
                        onPress={() =>
                          setSelectedRetakes((prev) =>
                            prev.includes(opt.id) ? prev : [...prev, opt.id]
                          )
                        }
                        style={[
                          styles.addResultButton,
                          added && { backgroundColor: theme.segmentBg, borderColor: theme.segmentBorder },
                        ]}
                      >
                        <Text
                          style={[
                            styles.addResultText,
                            added && { color: theme.subtle },
                          ]}
                        >
                          {added ? 'Added' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {filteredRetakeOptions.length === 0 ? (
                  <Text style={styles.helperText}>No matching courses.</Text>
                ) : null}
              </View>
            )}

              <View style={styles.retakeList}>
                {selectedRetakeOptions.length === 0 ? (
                  <Text style={styles.helperText}>
                    Added courses will appear here to enter the new grade.
                  </Text>
                ) : (
                selectedRetakeOptions.map((opt) => (
                    <View key={opt.id} style={styles.retakeRow}>
                  <View style={styles.retakeRowHeader}>
                    <Text style={styles.retakeRowLabel}>
                        {opt.displayLabel}
                        {opt.excludeFromCumulative || appliedRetakes.includes(opt.id)
                          ? ' (not in cumulative)'
                          : ''}
                      </Text>
                      <View style={styles.retakeActions}>
                        {appliedRetakes.includes(opt.id) ? (
                          <View style={styles.retakeAppliedTag}>
                            <Text style={styles.retakeAppliedText}>Applied</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            onPress={() => confirmAddRetake(opt.id)}
                            activeOpacity={0.85}
                            style={styles.retakeActionButton}
                          >
                            <Text style={styles.retakeActionText}>Retake</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => {
                            setSelectedRetakes((prev) => prev.filter((id) => id !== opt.id));
                            setRetakeGrades((prev) => {
                              const next = { ...prev };
                              delete next[opt.id];
                              return next;
                            });
                            setAppliedRetakes((prev) => prev.filter((id) => id !== opt.id));
                          }}
                          activeOpacity={0.8}
                          style={styles.retakeRemoveButton}
                        >
                          <Text style={styles.retakeRemoveText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TextInput
                      value={retakeGrades[opt.id] ?? ''}
                      onChangeText={(text) =>
                        setRetakeGrades((prev) => ({ ...prev, [opt.id]: text }))
                    }
                    placeholder="e.g. 80 or B+ (leave blank if not retaking)"
                    placeholderTextColor={styles.placeholder.color}
                    style={styles.retakeInput}
                  />
                </View>
                ))
              )}
            </View>

            {retakeSummary && canComputeRetake ? (
              <View style={styles.retakeResult}>
                <View style={styles.retakeResultRow}>
                  <Text style={styles.retakeLabel}>After retake</Text>
                  <Text style={styles.retakeValue}>
                    {retakeSummary.gpa.toFixed(scale === 'percentage' ? 1 : 2)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.retakeDelta,
                    { color: retakeDelta >= 0 ? theme.accent : theme.muted },
                  ]}
                >
                  {retakeDelta >= 0 ? '+' : ''}
                  {retakeDelta.toFixed(scale === 'percentage' ? 1 : 3)} change vs current plan
                </Text>
                <Text style={styles.retakeNote}>
                  Assumes the new grade replaces the old attempt using the same credits.
                </Text>
              </View>
            ) : (
              <Text style={styles.helperText}>
                Enter at least one new grade to see how retakes change your cumulative GPA.
              </Text>
            )}
          </>
        ) : (
          <Text style={styles.helperText}>
            Add courses in previous semesters to simulate how a retake changes your cumulative GPA.
          </Text>
        )}
      </View>

      <View style={styles.sectionBlock}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="school-outline" size={18} color={theme.accent} />
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
            clearSemester();
          }}
        />
      </View>

      <View style={styles.footerCard}>
        <View>
          <Text style={styles.footerLabel}>New Cumulative GPA</Text>
          {canShowCumulative ? (
            <Text style={styles.footerValue}>
              {cumulativeSummary.gpa.toFixed(scale === 'percentage' ? 1 : 2)}
            </Text>
          ) : (
            <Text style={styles.blockerText}>
              Add prior semesters or enter earned credits + GPA to see your cumulative.
            </Text>
          )}
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    helperCaption: {
      color: theme.subtle,
      fontSize: rs(12),
      fontWeight: '800',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    searchResults: {
      marginTop: rs(6),
      gap: rs(8),
    },
    searchResultRow: {
      borderRadius: rs(10),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      padding: rs(10),
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: rs(8),
    },
    searchResultLabel: {
      flex: 1,
      color: theme.text,
      fontWeight: '700',
      fontSize: rs(13),
      flexWrap: 'wrap',
    },
    addResultButton: {
      paddingHorizontal: rs(12),
      paddingVertical: rs(8),
      borderRadius: rs(8),
      borderWidth: 1,
      borderColor: theme.accent,
      backgroundColor: theme.accent,
    },
    addResultText: {
      color: theme.background,
      fontWeight: '800',
      fontSize: rs(13),
    },
    retakeActionButton: {
      paddingHorizontal: rs(10),
      paddingVertical: rs(6),
      borderRadius: rs(8),
      borderWidth: 1,
      borderColor: theme.accent,
      backgroundColor: theme.accent,
    },
    retakeActionText: {
      color: theme.background,
      fontWeight: '800',
      fontSize: rs(12),
    },
    retakeAppliedTag: {
      paddingHorizontal: rs(10),
      paddingVertical: rs(6),
      borderRadius: rs(8),
      borderWidth: 1,
      borderColor: theme.segmentBorder,
      backgroundColor: theme.segmentBg,
    },
    retakeAppliedText: {
      color: theme.subtle,
      fontWeight: '800',
      fontSize: rs(12),
    },
    helperText: {
      color: theme.subtle,
      fontSize: rs(13),
      marginTop: rs(6),
    },
    searchInput: {
      marginTop: rs(8),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(10),
      paddingHorizontal: rs(10),
      paddingVertical: rs(10),
      fontSize: rs(14),
      fontWeight: '700',
    },
    searchInput: {
      marginTop: rs(8),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(10),
      paddingHorizontal: rs(10),
      paddingVertical: rs(10),
      fontSize: rs(14),
      fontWeight: '700',
    },
    retakeList: {
      marginTop: rs(6),
      gap: rs(10),
    },
    retakeRow: {
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card,
      padding: rs(10),
      gap: rs(6),
    },
    retakeRowHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: rs(8),
    },
    retakeInput: {
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.input,
      color: theme.text,
      borderRadius: rs(10),
      paddingHorizontal: rs(10),
      paddingVertical: rs(10),
      fontSize: rs(14),
      fontWeight: '700',
    },
    retakeRemoveButton: {
      paddingHorizontal: rs(10),
      paddingVertical: rs(6),
      borderRadius: rs(8),
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.cardAlt,
    },
    retakeRemoveText: {
      color: theme.subtle,
      fontWeight: '800',
      fontSize: rs(12),
    },
    retakeActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(6),
      flexShrink: 0,
    },
    retakeRowLabel: {
      color: theme.text,
      fontWeight: '800',
      fontSize: rs(13),
      flex: 1,
      flexWrap: 'wrap',
    },
    retakeResult: {
      marginTop: rs(10),
      backgroundColor: theme.card,
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: theme.border,
      padding: rs(12),
      gap: rs(6),
    },
    retakeResultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    retakeLabel: {
      color: theme.subtle,
      fontWeight: '800',
      fontSize: rs(13),
    },
    retakeValue: {
      color: theme.text,
      fontWeight: '900',
      fontSize: rs(22),
    },
    retakeDelta: {
      fontWeight: '800',
      fontSize: rs(14),
    },
    retakeNote: {
      color: theme.muted,
      fontSize: rs(12),
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: rs(6),
    },
    toggleLabel: {
      color: theme.subtle,
      fontSize: rs(12),
      fontWeight: '800',
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
    blockerText: {
      color: theme.subtle,
      fontSize: rs(14),
      fontWeight: '700',
    },
  });
};

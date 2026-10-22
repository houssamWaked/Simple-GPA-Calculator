import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { Course, ScaleKey, convertGradeBetweenScales } from "../constants/gpa";

export type Term = "Fall" | "Spring" | "Summer";

export type Semester = {
  id: string;
  term: Term;
  year: number;
  label: string;
  order: number;
};

type Plan = {
  startYear: number | null;
  startTerm: Term | null;
  programYears: number;
  currentSemesterId: string | null;
};

type StoredState = {
  version: 2;
  plan: Plan;
  coursesBySemester: Record<string, Course[]>;
  gradeScale?: ScaleKey;
};

type CourseContextValue = {
  hydrated: boolean;
  planReady: boolean;
  plan: Plan;
  semesters: Semester[];
  currentSemester: Semester | null;
  courses: Course[];
  coursesBySemester: Record<string, Course[]>;
  completedCourses: Course[];
  gradeScale: ScaleKey;
  setCurrentSemester: (id: string) => void;
  initializePlan: (startYear: number, startTerm: Term, programYears: number) => void;
  updatePlan: (startYear: number, startTerm: Term, programYears: number) => void;
  addCourseWithData: (data: Partial<Course>) => void;
  markCourseRetaken: (courseName: string, currentSemesterId: string | null) => void;
  convertAllGrades: (nextScale: ScaleKey) => void;
  addCourse: (semesterId?: string) => void;
  updateCourse: (next: Course) => void;
  removeCourse: (id: string, semesterId?: string) => void;
  clearSemester: (semesterId?: string) => void;
  replaceSemesterCourses: (semesterId: string, courses: Partial<Course>[]) => void;
};

const STORAGE_KEY = "courses:v2";
const LEGACY_KEY = "courses:v1";
const termOrder: Term[] = ["Fall", "Spring", "Summer"];

const CourseContext = createContext<CourseContextValue>({
  hydrated: false,
  planReady: false,
  plan: { startYear: null, startTerm: null, programYears: 4, currentSemesterId: null },
  semesters: [],
  currentSemester: null,
  courses: [],
  coursesBySemester: {},
  completedCourses: [],
  gradeScale: "four",
  setCurrentSemester: () => {},
  initializePlan: () => {},
  updatePlan: () => {},
  addCourseWithData: () => {},
  markCourseRetaken: () => {},
  convertAllGrades: () => {},
  addCourse: () => {},
  updateCourse: () => {},
  removeCourse: () => {},
  clearSemester: () => {},
  replaceSemesterCourses: () => {},
});

const makeSemesterId = (year: number, term: Term) => `${year}-${term.toLowerCase()}`;

const blankCourse = (semesterId: string): Course => ({
  id: `c-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
  name: "",
  grade: "",
  credits: "",
  semesterId,
  excludeFromCumulative: false,
});

const ensureCourseSemester = (course: Course, semesterId: string): Course => ({
  ...course,
  semesterId: course.semesterId ?? semesterId,
});

  const normalizeCourses = (courses: Course[], semesterId: string) => {
    if (!courses || !courses.length) return [blankCourse(semesterId)];
    return courses.map((c) => ensureCourseSemester(c, semesterId));
  };

  const normalizeName = (name: string) => name.trim().toLowerCase();

  const generateSemesters = (startYear: number, startTerm: Term, programYears: number): Semester[] => {
    const semesters: Semester[] = [];
    const startIndex = termOrder.indexOf(startTerm);
    if (startIndex === -1) return semesters;

  let currentYear = startYear;
  let previousTerm: Term = startTerm;

  for (let i = 0; i < programYears * 3; i++) {
    const term = termOrder[(startIndex + i) % termOrder.length];
    if (i > 0 && previousTerm === "Fall" && term === "Spring") {
      currentYear += 1;
    }
    const id = makeSemesterId(currentYear, term);
    semesters.push({ id, term, year: currentYear, label: `${term} ${currentYear}`, order: i });
    previousTerm = term;
  }

  return semesters;
};

const defaultPlan = (): Plan => ({
  startYear: null,
  startTerm: null,
  programYears: 4,
  currentSemesterId: null,
});

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [plan, setPlan] = useState<Plan>(defaultPlan());
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [coursesBySemester, setCoursesBySemester] = useState<Record<string, Course[]>>({});
  const [hydrated, setHydrated] = useState(false);
  const [gradeScale, setGradeScale] = useState<ScaleKey>("four");

  const planReady =
    Boolean(plan.startYear) &&
    Boolean(plan.startTerm) &&
    Boolean(plan.currentSemesterId) &&
    semesters.length > 0;

  const persistState = async (
    nextPlan: Plan,
    nextSemesters: Semester[],
    nextCoursesBySemester: Record<string, Course[]>,
    nextGradeScale: ScaleKey = gradeScale,
  ) => {
    try {
      const payload: StoredState = {
        version: 2,
        plan: nextPlan,
        coursesBySemester: nextCoursesBySemester,
        gradeScale: nextGradeScale,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore persistence errors
    }
  };

  const load = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: StoredState = JSON.parse(saved);
        if (
          parsed?.plan?.startYear &&
          parsed?.plan?.startTerm &&
          parsed?.plan?.programYears &&
          parsed?.plan?.currentSemesterId
        ) {
          const nextSemesters = generateSemesters(
            parsed.plan.startYear,
            parsed.plan.startTerm as Term,
            parsed.plan.programYears,
          );
          const mapped: Record<string, Course[]> = {};
          nextSemesters.forEach((s) => {
            const incoming = parsed.coursesBySemester?.[s.id] ?? [];
            mapped[s.id] = normalizeCourses(incoming, s.id);
          });
          setPlan(parsed.plan);
          setSemesters(nextSemesters);
          setCoursesBySemester(mapped);
          if (parsed.gradeScale && (parsed.gradeScale === "four" || parsed.gradeScale === "five" || parsed.gradeScale === "percentage")) {
            setGradeScale(parsed.gradeScale);
          } else {
            setGradeScale("four");
          }
          return;
        }
      }

      const legacy = await AsyncStorage.getItem(LEGACY_KEY);
      if (legacy) {
        const legacyCourses: Course[] = JSON.parse(legacy);
        const year = new Date().getFullYear();
        const fallbackPlan: Plan = {
          startYear: year,
          startTerm: "Fall",
          programYears: 4,
          currentSemesterId: makeSemesterId(year, "Fall"),
        };
        const nextSemesters = generateSemesters(
          year,
          "Fall",
          fallbackPlan.programYears,
        );
        const mapped: Record<string, Course[]> = {};
        nextSemesters.forEach((s, idx) => {
          if (idx === 0) {
            mapped[s.id] = normalizeCourses(
              legacyCourses.map((c) => ({ ...c, semesterId: s.id })),
              s.id,
            );
          } else {
            mapped[s.id] = [blankCourse(s.id)];
          }
        });
        setPlan(fallbackPlan);
        setSemesters(nextSemesters);
        setCoursesBySemester(mapped);
        setGradeScale("four");
        await persistState(fallbackPlan, nextSemesters, mapped, "four");
        try {
          await AsyncStorage.removeItem(LEGACY_KEY);
        } catch {
          // ignore
        }
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!hydrated || !planReady) return;
    persistState(plan, semesters, coursesBySemester, gradeScale);
  }, [hydrated, planReady, plan, semesters, coursesBySemester, gradeScale]);

  const setCurrentSemester = useCallback((id: string) => {
    if (!id) return;
    setPlan((prev) => ({ ...prev, currentSemesterId: id }));
  }, []);

  const initializePlan = useCallback((startYear: number, startTerm: Term, programYears: number) => {
    const nextSemesters = generateSemesters(startYear, startTerm, programYears);
    const currentSemesterId = nextSemesters[0]?.id ?? null;
    const nextPlan: Plan = { startYear, startTerm, programYears, currentSemesterId };
    const mapped: Record<string, Course[]> = {};
    nextSemesters.forEach((s) => {
      mapped[s.id] = [blankCourse(s.id)];
    });

    setPlan(nextPlan);
    setSemesters(nextSemesters);
    setCoursesBySemester(mapped);
    setGradeScale("four");
    persistState(nextPlan, nextSemesters, mapped, "four");
  }, []);

  const updatePlan = useCallback((startYear: number, startTerm: Term, programYears: number) => {
    const nextSemesters = generateSemesters(startYear, startTerm, programYears);
    const currentSemesterId =
      nextSemesters.find((s) => s.id === plan.currentSemesterId)?.id ??
      nextSemesters[0]?.id ??
      null;

    const nextPlan: Plan = {
      startYear,
      startTerm,
      programYears,
      currentSemesterId,
    };

    const mapped: Record<string, Course[]> = {};
    nextSemesters.forEach((s) => {
      const existing = coursesBySemester[s.id] ?? [];
      mapped[s.id] = normalizeCourses(existing, s.id);
    });

    setPlan(nextPlan);
    setSemesters(nextSemesters);
    setCoursesBySemester(mapped);
    persistState(nextPlan, nextSemesters, mapped, gradeScale);
  }, [coursesBySemester, gradeScale, plan.currentSemesterId]);

  const convertAllGrades = useCallback((nextScale: ScaleKey) => {
    if (nextScale === gradeScale) return;
    setCoursesBySemester((prev) => {
      const updated: Record<string, Course[]> = {};
      Object.entries(prev).forEach(([semesterId, list]) => {
        updated[semesterId] = list.map((course) => ({
          ...course,
          grade: course.grade
            ? convertGradeBetweenScales(course.grade, gradeScale, nextScale)
            : "",
        }));
      });
      return updated;
    });
    setGradeScale(nextScale);
  }, [gradeScale]);

  const addCourse = (semesterId?: string) => {
    const target = semesterId ?? plan.currentSemesterId;
    if (!target) return;
    setCoursesBySemester((prev) => {
      const list = prev[target] ?? [blankCourse(target)];
      return { ...prev, [target]: [...list, blankCourse(target)] };
    });
  };

  const addCourseWithData = (data: Partial<Course>) => {
    const target = data.semesterId ?? plan.currentSemesterId;
    if (!target) return;
    const newCourse = { ...blankCourse(target), ...data, semesterId: target };
    setCoursesBySemester((prev) => {
      const list = prev[target] ?? [blankCourse(target)];
      return { ...prev, [target]: [...list, newCourse] };
    });
  };

  const updateCourse = (next: Course) => {
    const target = next.semesterId ?? plan.currentSemesterId;
    if (!target) return;
    setCoursesBySemester((prev) => {
      const list = prev[target] ?? [blankCourse(target)];
      const updated = list.map((c) => (c.id === next.id ? { ...next, semesterId: target } : c));
      return { ...prev, [target]: updated };
    });
  };

  const removeCourse = (id: string, semesterId?: string) => {
    const target = semesterId ?? plan.currentSemesterId;
    if (!target) return;
    setCoursesBySemester((prev) => {
      const list = prev[target] ?? [];
      const filtered = list.filter((c) => c.id !== id);
      return { ...prev, [target]: filtered.length ? filtered : [blankCourse(target)] };
    });
  };

  const clearSemester = (semesterId?: string) => {
    const target = semesterId ?? plan.currentSemesterId;
    if (!target) return;
    setCoursesBySemester((prev) => ({
      ...prev,
      [target]: [blankCourse(target)],
    }));
  };

  const replaceSemesterCourses = (semesterId: string, imported: Partial<Course>[]) => {
    if (!semesterId) return;
    const nextCourses = imported.length
      ? imported.map((course) => ({ ...blankCourse(semesterId), ...course, semesterId }))
      : [blankCourse(semesterId)];
    setCoursesBySemester((prev) => ({ ...prev, [semesterId]: nextCourses }));
  };

  const markCourseRetaken = (courseName: string, currentSemesterId: string | null) => {
    const key = normalizeName(courseName);
    if (!key) return;
    setCoursesBySemester((prev) => {
      const next: Record<string, Course[]> = {};
      Object.entries(prev).forEach(([semId, list]) => {
        next[semId] = list.map((course) => {
          const sameName = normalizeName(course.name) === key;
          const isCurrent = semId === currentSemesterId;
          if (sameName && !isCurrent) {
            return { ...course, excludeFromCumulative: true };
          }
          return course;
        });
      });
      return next;
    });
  };

  const currentSemester = plan.currentSemesterId
    ? semesters.find((s) => s.id === plan.currentSemesterId) ?? null
    : null;

  const courses = useMemo(() => {
    if (!plan.currentSemesterId) return [];
    return coursesBySemester[plan.currentSemesterId] ?? [blankCourse(plan.currentSemesterId)];
  }, [coursesBySemester, plan.currentSemesterId]);

  const completedCourses = useMemo(() => {
    const currentOrder =
      currentSemester?.order ??
      semesters.find((s) => s.id === plan.currentSemesterId)?.order ??
      Number.POSITIVE_INFINITY;

    const entries = Object.entries(coursesBySemester).filter(([id]) => {
      if (id === plan.currentSemesterId) return false;
      const semOrder = semesters.find((s) => s.id === id)?.order;
      if (semOrder === undefined || semOrder === null) return true;
      return semOrder <= currentOrder;
    });

    const flattened = entries.flatMap(([, list]) => list ?? []);
    return flattened.filter((c) => c.grade || c.credits || c.name);
  }, [coursesBySemester, plan.currentSemesterId, currentSemester?.order, semesters]);

  return (
    <CourseContext.Provider
      value={{
        hydrated,
        planReady,
        plan,
        semesters,
        currentSemester,
    courses,
        coursesBySemester,
    completedCourses,
    setCurrentSemester,
    initializePlan,
    updatePlan,
    markCourseRetaken,
    addCourseWithData,
    convertAllGrades,
    addCourse,
    updateCourse,
    removeCourse,
        clearSemester,
        replaceSemesterCourses,
        gradeScale,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";
import { Course } from "../constants/gpa";

const STORAGE_KEY = "courses:v1";
const CURRENT_SEMESTER = "current";

type CourseContextValue = {
  courses: Course[];
  addCourse: () => void;
  updateCourse: (next: Course) => void;
  removeCourse: (id: string) => void;
  clearSemester: (semesterId?: string) => void;
};

const CourseContext = createContext<CourseContextValue>({
  courses: [],
  addCourse: () => {},
  updateCourse: () => {},
  removeCourse: () => {},
  clearSemester: () => {},
});

const blankCourse = (): Course => ({
  id: `c-${Date.now()}`,
  name: "",
  grade: "",
  credits: "",
  semesterId: CURRENT_SEMESTER,
});

export const CourseProvider = ({ children }: { children: React.ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([blankCourse()]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed: Course[] = JSON.parse(saved);
          setCourses(parsed.length ? parsed : [blankCourse()]);
        }
      } catch {
        // ignore read errors; fall back to defaults
      } finally {
        setHydrated(true);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(courses)).catch(() => {
      // silent fail; no blocking UI
    });
  }, [courses, hydrated]);

  const addCourse = () => setCourses((prev) => [...prev, blankCourse()]);

  const updateCourse = (next: Course) =>
    setCourses((prev) => prev.map((c) => (c.id === next.id ? next : c)));

  const removeCourse = (id: string) =>
    setCourses((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      return filtered.length ? filtered : [blankCourse()];
    });

  const clearSemester = (semesterId: string = CURRENT_SEMESTER) =>
    setCourses((prev) => {
      const kept = prev.filter((c) => (c.semesterId ?? CURRENT_SEMESTER) !== semesterId);
      return kept.length ? kept : [blankCourse()];
    });

  return (
    <CourseContext.Provider
      value={{ courses, addCourse, updateCourse, removeCourse, clearSemester }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => useContext(CourseContext);

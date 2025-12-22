export type ScaleKey = "four" | "five" | "percentage";
export type Grade =
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D"
  | "F";

export type Course = {
  id: string;
  name: string;
  grade: string;
  credits: string;
  semesterId?: string;
};

export const gradeOptions: Grade[] = [
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D",
  "F",
];

export const gradePoints: Record<Exclude<ScaleKey, "percentage">, Record<Grade, number>> = {
  four: {
    A: 4,
    "A-": 3.7,
    "B+": 3.3,
    B: 3,
    "B-": 2.7,
    "C+": 2.3,
    C: 2,
    "C-": 1.7,
    D: 1,
    F: 0,
  },
  five: {
    A: 5,
    "A-": 4.7,
    "B+": 4.3,
    B: 4,
    "B-": 3.7,
    "C+": 3.3,
    C: 3,
    "C-": 2.7,
    D: 2,
    F: 0,
  },
};

export const scaleMeta: Record<ScaleKey, { label: string; max: number }> = {
  four: { label: "4.0 Scale", max: 4 },
  five: { label: "5.0 Scale", max: 5 },
  percentage: { label: "Percentage", max: 100 },
};

export type Summary = {
  displayGpa: number;
  credits: number;
  baseGpa: number;
};

export const formatGradeLabel = (grade: string, scale: ScaleKey) => {
  if (scale === "percentage") return grade;
  const value = gradePoints[scale as Exclude<ScaleKey, "percentage">][grade as Grade];
  if (value === undefined) return grade;
  return `${grade} (${value.toFixed(1)})`;
};

export const summarizeCourses = (courses: Course[], scale: ScaleKey): Summary => {
  const pointScale = scale === "five" ? "five" : "four";
  const points = gradePoints[pointScale as Exclude<ScaleKey, "percentage">];
  const max = scaleMeta[scale].max;
  let credits = 0;
  let quality = 0;

  courses.forEach((course) => {
    const creditValue = Math.max(0, parseFloat(course.credits));
    if (!Number.isFinite(creditValue) || creditValue <= 0) return;

    const numericGrade = parseFloat(course.grade);
    if (scale === "percentage") {
      if (Number.isFinite(numericGrade)) {
        const pct = Math.min(100, Math.max(0, numericGrade));
        credits += creditValue;
        quality += pct * creditValue;
        return;
      }
      const letterValue = points[course.grade as Grade];
      if (letterValue !== undefined) {
        const pctFromLetter = (letterValue / scaleMeta[pointScale].max) * 100;
        credits += creditValue;
        quality += pctFromLetter * creditValue;
        return;
      }
    } else {
      if (Number.isFinite(numericGrade)) {
        const scaled = (Math.min(100, Math.max(0, numericGrade)) / 100) * max;
        credits += creditValue;
        quality += scaled * creditValue;
        return;
      }
      const gradeValue = points[course.grade as Grade];
      if (gradeValue !== undefined) {
        credits += creditValue;
        quality += gradeValue * creditValue;
        return;
      }
    }
  });

  const baseGpa = credits ? quality / credits : 0;
  const display =
    scale === "percentage"
      ? baseGpa
      : baseGpa;

  return {
    baseGpa,
    credits: Number(credits.toFixed(1)),
    displayGpa: Number(display.toFixed(scale === "percentage" ? 1 : 2)),
  };
};

export const combineCumulative = (
  currentGpa: string,
  currentCredits: string,
  courses: Course[],
  scale: ScaleKey,
) => {
  const prevGpa = parseFloat(currentGpa) || 0;
  const prevCredits = parseFloat(currentCredits) || 0;
  const semester = summarizeCourses(courses, scale);
  const max = scaleMeta[scale].max;
  const normalizedPrev =
    scale === "percentage"
      ? Math.min(100, Math.max(0, prevGpa))
      : Math.min(max, Math.max(0, prevGpa));

  const totalCredits = prevCredits + semester.credits;

  const combinedBase = totalCredits
    ? (normalizedPrev * prevCredits + semester.baseGpa * semester.credits) / totalCredits
    : semester.baseGpa;

  const display =
    scale === "percentage"
      ? combinedBase
      : combinedBase;

  return {
    totalCredits: Number(totalCredits.toFixed(1)),
    gpa: Number(display.toFixed(scale === "percentage" ? 1 : 2)),
  };
};

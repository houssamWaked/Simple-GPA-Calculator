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
  excludeFromCumulative?: boolean;
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

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const parseNumeric = (value: string) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const closestLetter = (
  value: number,
  scale: Exclude<ScaleKey, "percentage">,
): Grade => {
  const entries = Object.entries(gradePoints[scale]) as [Grade, number][];
  let best: Grade = "F";
  let bestDiff = Number.POSITIVE_INFINITY;

  entries.forEach(([letter, point]) => {
    const diff = Math.abs(value - point);
    if (diff < bestDiff || (diff === bestDiff && point > gradePoints[scale][best])) {
      bestDiff = diff;
      best = letter;
    }
  });

  return best;
};

const letterToPercent = (grade: string, sourceScale: ScaleKey): number | null => {
  const pointScale = sourceScale === "five" ? "five" : "four";
  const letterValue = gradePoints[pointScale as Exclude<ScaleKey, "percentage">][
    grade as Grade
  ];
  if (letterValue === undefined) return null;
  const pct = (letterValue / scaleMeta[pointScale].max) * 100;
  return clamp(pct, 0, 100);
};

const gradeToPercent = (grade: string, sourceScale: ScaleKey): number | null => {
  const numeric = parseNumeric(grade);
  if (numeric !== null) {
    if (sourceScale === "percentage") return clamp(numeric, 0, 100);
    const pct = (numeric / scaleMeta[sourceScale].max) * 100;
    return clamp(pct, 0, 100);
  }
  return letterToPercent(grade, sourceScale);
};

const isLetter = (grade: string) => gradeOptions.includes(grade as Grade);

export const convertGradeBetweenScales = (
  grade: string,
  fromScale: ScaleKey,
  toScale: ScaleKey,
): string => {
  if (!grade || fromScale === toScale) return grade;
  if (isLetter(grade)) {
    if (toScale !== "percentage") return grade;
    const percentFromLetter = gradeToPercent(grade, fromScale);
    return percentFromLetter === null
      ? grade
      : Number(percentFromLetter.toFixed(1)).toString();
  }

  const percent = gradeToPercent(grade, fromScale);
  if (percent === null) return grade;

  if (toScale === "percentage") {
    return Number(percent.toFixed(1)).toString();
  }

  const target = (percent / 100) * scaleMeta[toScale].max;
  return Number(target.toFixed(2)).toString();
};

export const formatGradeLabel = (grade: string, scale: ScaleKey) => {
  if (!grade) return "Select";

  const numeric = parseNumeric(grade);
  if (scale === "percentage") {
    if (numeric !== null) return clamp(numeric, 0, 100).toFixed(1);
    return grade;
  }

  const pointScale = scale === "five" ? "five" : "four";
  const value = gradePoints[pointScale as Exclude<ScaleKey, "percentage">][grade as Grade];

  if (value !== undefined) {
    return `${grade} (${value.toFixed(1)})`;
  }

  if (numeric !== null) {
    const clamped = clamp(numeric, 0, scaleMeta[scale].max);
    const letter = closestLetter(clamped, pointScale as Exclude<ScaleKey, "percentage">);
    return `${clamped.toFixed(2)} (${letter})`;
  }

  return grade;
};

export const summarizeCourses = (courses: Course[], scale: ScaleKey): Summary => {
  const pointScale = scale === "five" ? "five" : "four";
  const points = gradePoints[pointScale as Exclude<ScaleKey, "percentage">];
  const max = scaleMeta[scale].max;
  let credits = 0;
  let quality = 0;

  courses.forEach((course) => {
    if (course.excludeFromCumulative) return;
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
        const clamped = clamp(numericGrade, 0, 100);
        const scaled = clamped > max ? (clamped / 100) * max : clamp(clamped, 0, max);
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
  currentCourses: Course[],
  scale: ScaleKey,
  completedCourses: Course[] = [],
) => {
  const baselineGpa = parseFloat(currentGpa) || 0;
  const baselineCredits = parseFloat(currentCredits) || 0;
  const max = scaleMeta[scale].max;
  const normalizedBaseline =
    scale === "percentage"
      ? Math.min(100, Math.max(0, baselineGpa))
      : Math.min(max, Math.max(0, baselineGpa));

  const prior = summarizeCourses(completedCourses, scale);
  const semester = summarizeCourses(currentCourses, scale);

  const totalCredits = baselineCredits + prior.credits + semester.credits;
  const combinedBase = totalCredits
    ? (normalizedBaseline * baselineCredits +
        prior.baseGpa * prior.credits +
        semester.baseGpa * semester.credits) /
      totalCredits
    : 0;

  const display = scale === "percentage" ? combinedBase : combinedBase;

  return {
    totalCredits: Number(totalCredits.toFixed(1)),
    gpa: Number(display.toFixed(scale === "percentage" ? 1 : 2)),
  };
};

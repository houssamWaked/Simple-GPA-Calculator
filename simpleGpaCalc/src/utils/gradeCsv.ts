import { Course } from '../constants/gpa';
import { Semester } from '../context/CourseContext';

export const GRADE_CSV_HEADER = ['semester', 'course', 'grade', 'credits'] as const;

const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;

export const exportGradesCsv = (
  semesters: Semester[],
  coursesBySemester: Record<string, Course[]>,
) => {
  const rows = [GRADE_CSV_HEADER.map(escapeCsv).join(',')];
  semesters.forEach((semester) => {
    (coursesBySemester[semester.id] ?? []).forEach((course) => {
      if (!course.name && !course.grade && !course.credits) return;
      rows.push(
        [semester.label, course.name, course.grade, course.credits]
          .map((value) => escapeCsv(value ?? ''))
          .join(','),
      );
    });
  });
  return `\uFEFF${rows.join('\r\n')}\r\n`;
};

const parseRow = (line: string, lineNumber: number): string[] => {
  const values: string[] = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        value += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === ',' && !quoted) {
      values.push(value);
      value = '';
    } else {
      value += char;
    }
  }
  if (quoted) throw new Error(`Unclosed quote on row ${lineNumber}.`);
  values.push(value);
  return values;
};

export const importGradesCsv = (contents: string, semesters: Semester[]) => {
  const lines = contents.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line) => line.trim());
  if (!lines.length) throw new Error('The selected CSV file is empty.');

  const header = parseRow(lines[0], 1).map((value) => value.trim().toLowerCase());
  if (header.length !== GRADE_CSV_HEADER.length ||
      !GRADE_CSV_HEADER.every((column, index) => header[index] === column)) {
    throw new Error('CSV header must be: semester,course,grade,credits');
  }

  const semesterByLabel = new Map(
    semesters.flatMap((semester) => [
      [semester.label.trim().toLowerCase(), semester.id] as const,
      [semester.id.trim().toLowerCase(), semester.id] as const,
    ]),
  );
  const grouped: Record<string, Omit<Course, 'id' | 'semesterId'>[]> = {};
  lines.slice(1).forEach((line, index) => {
    const lineNumber = index + 2;
    const values = parseRow(line, lineNumber);
    if (values.length !== 4) throw new Error(`Row ${lineNumber} must have four columns.`);
    const [semesterName, name, grade, credits] = values.map((value) => value.trim());
    const semesterId = semesterByLabel.get(semesterName.toLowerCase());
    if (!semesterId) throw new Error(`Unknown semester on row ${lineNumber}: ${semesterName}`);
    if (credits && (!Number.isFinite(Number(credits)) || Number(credits) < 0)) {
      throw new Error(`Credits must be a non-negative number on row ${lineNumber}.`);
    }
    (grouped[semesterId] ??= []).push({ name, grade, credits });
  });
  if (!Object.keys(grouped).length) throw new Error('No course rows were found in the CSV file.');
  return grouped;
};

export const GRADE_CSV_TEMPLATE = `${GRADE_CSV_HEADER.join(',')}\r\nFall 2024,History of Art,A,3\r\nSpring 2025,Statistics,B+,4\r\n`;

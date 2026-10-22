# GradePoint

GradePoint is a cross-platform GPA calculator built with Expo, React Native, and TypeScript. It tracks grades by academic semester and calculates semester and cumulative GPA on 4.0, 5.0, or percentage scales.

## Features

- Create an academic plan with a start term, start year, and program length. The app generates Fall, Spring, and Summer semesters.
- Enter courses, grades, and credits and view a credit-weighted semester GPA.
- View cumulative GPA from saved semester courses or combine saved courses with a manually entered GPA and credit baseline.
- Use the **Quick GPA** calculator to combine a GPA and credit total so far with one new semester. Quick GPA inputs are temporary and are not saved.
- Switch the current semester from the dropdown at the top of the app.
- Import and export grades as CSV from the navigation drawer.
- Choose from light, dark, and accent colour themes.

Course and academic plan data are stored locally on the device with AsyncStorage.

## Run locally

The Expo app is in `simpleGpaCalc/`.

```sh
cd simpleGpaCalc
npm ci
npx expo start
```

Use the Expo CLI prompts to open the app in Expo Go, an Android emulator, or an iOS simulator. Native modules such as file picking and sharing may require a development build for a full native workflow.

## Import and export grades

Use the drawer’s **Export grades** action to share a CSV containing course rows from all semesters. To import, prepare a CSV with this exact header and one course per row:

```csv
semester,course,grade,credits
Fall 2024,History of Art,A,3
Spring 2025,Statistics,B+,4
```

The semester value must match one of the semesters in the academic plan (for example, `Fall 2024`). Course names may contain commas or quotation marks when properly quoted as CSV. Credits must be non-negative numbers. Grades can be letter grades or numeric values accepted by the selected scale.

Import validates the file before applying it. It replaces course data only for semesters represented in the CSV; other semesters are left unchanged. The app asks for confirmation before applying the import.

## Android release build

The `production` EAS profile in `simpleGpaCalc/eas.json` builds an Android App Bundle (`.aab`):

```sh
cd simpleGpaCalc
npx eas-cli build --platform android --profile production
```

EAS uses the Android keystore configured for the project. Keep signing credentials in EAS or another secure credential store; do not commit keystores or passwords. Increment `expo.android.versionCode` in `app.json` for each Play Store upload, and update `expo.version` when appropriate.

## Project structure

```text
simpleGpaCalc/
  app/                 Expo Router screens and navigation
  src/constants/gpa.ts GPA scales, grade conversion, and summary calculations
  src/context/         Theme and academic-plan/course state
  src/utils/           CSV import/export helpers
```

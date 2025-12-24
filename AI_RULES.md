# AI Rules for IELTSMate Application

This document outlines the core technologies used in the IELTSMate application and provides clear guidelines for using specific libraries and frameworks. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

The IELTSMate application is built using a modern web development stack, focusing on performance, developer experience, and a rich user interface.

*   **React**: A JavaScript library for building user interfaces.
*   **TypeScript**: A typed superset of JavaScript that compiles to plain JavaScript, enhancing code quality and developer productivity.
*   **Vite**: A fast build tool that provides an instant development server and optimized builds.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs.
*   **shadcn/ui**: A collection of re-usable components built with Radix UI and Tailwind CSS, providing a consistent and accessible UI.
*   **React Router**: A standard library for routing in React applications, managing navigation and URL synchronization.
*   **Supabase**: An open-source Firebase alternative providing a PostgreSQL database, authentication, and storage.
*   **TanStack Query (React Query)**: A powerful library for managing server state, including data fetching, caching, and synchronization.
*   **Zod**: A TypeScript-first schema declaration and validation library.
*   **Sonner**: A modern toast component for displaying notifications.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.

## Library Usage Rules

To maintain consistency and leverage the strengths of our tech stack, please follow these guidelines when developing new features or modifying existing ones:

1.  **UI Components**:
    *   **Always use `shadcn/ui` components** for all user interface elements (buttons, inputs, dialogs, selects, etc.).
    *   If a required component is not available in `shadcn/ui` or needs significant customization, **create a new component** in `src/components/` and style it using Tailwind CSS. **Do NOT modify files within `src/components/ui/`**.

2.  **Styling**:
    *   **Exclusively use Tailwind CSS** for all styling. Apply utility classes directly to elements.
    *   Avoid writing custom CSS in separate `.css` or `.module.css` files unless absolutely necessary for global styles or complex animations not easily achievable with Tailwind.
    *   Use the `cn` utility function from `src/lib/utils.ts` for conditionally applying and merging Tailwind classes.

3.  **Routing**:
    *   Use `react-router-dom` for all client-side navigation.
    *   Define main application routes in `src/App.tsx`.
    *   Use `Link` components for navigation and `useNavigate` hook for programmatic navigation.

4.  **State Management (Server State)**:
    *   For fetching, caching, and updating server data, **use `@tanstack/react-query`**. This includes data from Supabase.
    *   Avoid manual `useState` for data that originates from or needs to be synchronized with the backend.

5.  **Authentication & Database**:
    *   All authentication (sign-in, sign-up, sign-out) and database interactions (CRUD operations) **must use the Supabase client** (`@supabase/supabase-js`) as configured in `src/integrations/supabase/client.ts`.

6.  **Form Handling & Validation**:
    *   Use `react-hook-form` for managing form state and submissions.
    *   For schema-based validation, **use `zod`** in conjunction with `@hookform/resolvers`.

7.  **Notifications**:
    *   For displaying temporary, non-blocking messages to the user (e.g., success, error, info messages), **use `sonner`**. The `Toaster` component is already set up in `src/App.tsx`.

8.  **Icons**:
    *   All icons used in the application **must come from `lucide-react`**.

9.  **Date Handling**:
    *   If date manipulation or formatting is required, use `date-fns` as it is already included in the project.

10. **Component Structure**:
    *   Create a new file for every new component or hook, no matter how small.
    *   New components should be placed in `src/components/` or `src/pages/` as appropriate.
    *   Aim for small, focused components (ideally 100 lines of code or less).

---

# Remaining Implementation Tasks

## 1. Scrollable Test Header Rows (All Test Modules)
**Current Issue:** The header/control rows (timer, zoom, audio player) are fixed/sticky and don't scroll with content.
**Required Change:** Remove `sticky` or `fixed` positioning from test control bars so the entire test interface scrolls together.
**Files to modify:**
- `src/pages/ReadingTest.tsx`
- `src/pages/ListeningTest.tsx`
- `src/pages/WritingTest.tsx`
- `src/pages/SpeakingTest.tsx`

Look for `sticky top-0` or similar classes and remove them to make content scrollable.

---

## 2. TABLE_SELECTION Question Type (Complete Implementation)

### 2.1 Admin Panel UI (`src/components/admin/QuestionGroupEditor.tsx`)
**Required:** Add admin UI for TABLE_SELECTION question type with:
- Field to enter column options (e.g., A, B, C, D, E) - comma separated or individual inputs
- For each question:
  - Question number input
  - Question text input
  - Dropdown to select correct answer from the column options entered above

### 2.2 Student Portal (`src/components/reading/ReadingQuestions.tsx`)
**Required:** Add rendering logic for TABLE_SELECTION:
```tsx
case 'TABLE_SELECTION':
  return (
    <TableSelection
      questions={group.questions.map(q => ({
        question_number: q.question_number,
        question_text: q.question_text
      }))}
      options={group.options || ['A', 'B', 'C', 'D', 'E']} // Options from admin
      answers={answers}
      onAnswerChange={onAnswerChange}
      fontSize={fontSize}
    />
  );
```

**Component already created:** `src/components/reading/questions/TableSelection.tsx`
- Displays table with options as column headers
- Questions as rows
- Clickable cells to select answer
- Shows checkmark for selected answer

---

## 3. Auto-Submit for Writing & Speaking Tests

### 3.1 Writing Test (`src/pages/WritingTest.tsx`)
**Required:**
- Import `SubmitConfirmDialog` from `@/components/common/SubmitConfirmDialog`
- Add state: `showSubmitDialog`, `isAutoSubmitting`, `autoSubmitCountdown`
- Add `useEffect` to watch timer - when time reaches 0:
  - Set `isAutoSubmitting = true`
  - Start 5-second countdown
  - Auto-submit after countdown
- Replace browser `confirm()` with `SubmitConfirmDialog` component
- If time remaining: show dialog asking for consent
- If no time remaining: auto-submit immediately without consent

### 3.2 Speaking Test (`src/pages/SpeakingTest.tsx`)
**Required:** Same implementation as Writing Test above.

**Reference Implementation:** See `src/pages/ReadingTest.tsx` lines ~180-220 for the pattern.

---

## 4. Speaking Test State Preservation for Guest Users

**Current Status:** Reading, Listening, and Writing tests save state to localStorage before redirecting to login.

**Required for Speaking Test (`src/pages/SpeakingTest.tsx`):**
- Use `useTestStatePreservation` hook
- Before submission, check if user is authenticated
- If not authenticated:
  - Save recording data (audio blobs/URLs) to localStorage
  - Save current part, answers, timer state
  - Redirect to `/auth?returnTo=/speaking-test/{testId}&pendingSubmission=true`
- After login, restore state and allow submission

**Note:** Audio blob storage in localStorage may have size limitations. Consider:
- Converting to base64 (but check size)
- Or showing message that recordings will need to be re-done after login
- Or require login before starting speaking test

---

## 5. Reading Test UI Redesign (Match IELTS Screenshots)

**Reference Screenshots:** User uploaded screenshots showing exact IELTS interface.

### 5.1 Bottom Navigation Bar Redesign
**Current:** Basic question number buttons
**Required:** Match IELTS style with:
- Part 1 | Part 2 | Part 3 labels/tabs at bottom
- Question numbers organized under each part
- Visual grouping of questions by part
- Current question highlighted
- Answered questions marked differently
- Review-marked questions with flag icon

### 5.2 Review Button Styling
**Current:** Basic button on left side
**Required:** Match IELTS screenshot style:
- Positioned as shown in screenshots
- Checkbox-style or flag-style marking
- Visual indicator on question numbers that are marked for review

**Files to modify:**
- `src/components/reading/ReadingNavigation.tsx` - Complete redesign
- `src/pages/ReadingTest.tsx` - Layout adjustments

---

## 6. Passage Subtitle Display

**Admin field already added:** `src/components/admin/PassageEditor.tsx` has subtitle input.

**Required:** Display subtitle in student view:
- `src/components/reading/ReadingPassage.tsx` - Show subtitle below title if exists
- Style: Smaller font, muted color, italic or different weight

---

## 7. Score Ranking Display Fix (Verify)

**File:** `src/pages/TestResults.tsx`
**Status:** Implementation was added but needs verification.
**Check:** After completing a test, the user's score should appear in the ranking immediately, not show "No scores yet".

---

## 8. Build Errors (tsconfig)

**Current Errors:**
```
tsconfig.json(35,5): error TS6306: Referenced project '/dev-server/tsconfig.node.json' must have setting "composite": true.
tsconfig.json(35,5): error TS6310: Referenced project '/dev-server/tsconfig.node.json' may not disable emit.
```

**Note:** These files are read-only (`tsconfig.json`, `tsconfig.node.json`). These errors exist in the base project configuration and do not affect runtime functionality. The application works despite these TypeScript project reference warnings.

---

## Quick Reference: File Locations

| Feature | Primary Files |
|---------|--------------|
| Reading Test | `src/pages/ReadingTest.tsx`, `src/components/reading/` |
| Listening Test | `src/pages/ListeningTest.tsx`, `src/components/listening/` |
| Writing Test | `src/pages/WritingTest.tsx`, `src/components/writing/` |
| Speaking Test | `src/pages/SpeakingTest.tsx`, `src/components/speaking/` |
| Admin Panel | `src/pages/admin/`, `src/components/admin/` |
| Question Types | `src/components/reading/questions/`, `src/components/listening/questions/` |
| Common Components | `src/components/common/` |
| State Preservation | `src/hooks/useTestStatePreservation.tsx` |
| Submit Dialog | `src/components/common/SubmitConfirmDialog.tsx` |

---

## Design System Notes

- Use semantic tokens from `src/index.css` and `tailwind.config.ts`
- All colors must be HSL format
- Never use direct colors like `text-white`, `bg-black`
- Use design system variables: `text-foreground`, `bg-background`, `text-primary`, etc.
- Check dark/light mode compatibility for all UI changes
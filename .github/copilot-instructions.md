# GitHub Copilot Custom Instructions

This file provides custom instructions for using GitHub Copilot in this repository. These guidelines help contributors and Copilot itself generate code that matches project standards and expectations.

## 1. Project Overview

This is a **Currency Converter** application built with Next.js, TypeScript, and Tailwind CSS. It enables real-time currency conversion between 10 popular currencies (USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, MXN) with features including conversion history tracking, URL parameter persistence, and graceful error handling with automatic API fallbacks.

## 2. Coding Standards

- Use TypeScript for all new code with strict mode enabled.
- Follow the existing folder structure:
  - `components/` - React functional components (exported from `index.ts`)
  - `hooks/` - Custom React hooks for state and side effects (exported from `index.ts`)
  - `utils/` - Pure utility functions and helpers
  - `types/` - TypeScript type definitions (centralized in `index.ts`)
  - `app/api/` - Next.js API routes
- Use functional components with React hooks (no class components).
- Prefer Tailwind CSS for styling; use utility classes for responsive design.
- Write clear JSDoc comments for public functions and exported components.
- Use meaningful variable and function names that clearly indicate purpose.

## 3. Architecture Patterns

### State Management & Hooks

- Use custom hooks (e.g., `useConverter`) to manage complex state and side effects.
- Hooks should encapsulate state initialization, updates, and side effects.
- Use `useCallback` to memoize event handlers and prevent unnecessary re-renders.
- Leverage Next.js `useRouter` and `useSearchParams` for URL-based state persistence.
- Always check for `typeof window !== 'undefined'` in utility functions that access localStorage.

### Component Architecture

- Components receive state and handlers as props (lifted state pattern).
- Keep components focused on a single responsibility.
- Export components from `components/index.ts` for cleaner imports.
- Use TypeScript interfaces for component props (e.g., `ConverterFormProps`).
- Compose smaller components into larger ones (e.g., `ConverterForm` composes `AmountInput`, `CurrencySelect`, `SwapButton`).

### Data Flow

- State flows down via props; events flow up via callbacks.
- Exchange rates are fetched at the root level and passed down as props.
- Conversion history is managed via `useConverter` hook and persisted to localStorage.
- API calls use `/app/api/` routes for secure data fetching.

## 4. Testing Guidelines

- All new features and bug fixes must include unit tests.
- Use **Jest** and **React Testing Library** for component and hook testing.
- Place test files next to their source files (e.g., `Component.test.tsx`).
- Test patterns:
  - Always create `defaultProps` or `mockData` at the top of test files.
  - Use `beforeEach(() => jest.clearAllMocks())` to reset mocks between tests.
  - Test user interactions with `userEvent` (not `fireEvent`).
  - Verify behavior, not implementation details (avoid testing internal state directly).
  - Use descriptive test names: `'should render all form elements'` instead of `'renders'`.
- Mock external dependencies (e.g., API calls, Next.js Router) consistently.
- Aim for >80% code coverage on new code.

## 5. Session & State Management

- **Conversion State**: Managed via `useConverter` hook; includes amount, currencies, result, validation error, and history.
- **URL Persistence**: Use `URLSearchParams` to persist amount, from, and to currencies in the URL query string.
- **Logging**:
  - Use `console.error()` for error cases (e.g., API failures, storage access issues).
  - Use `console.warn()` for non-critical issues.
  - Log API fallback events to track when primary sources fail.
  - Include relevant context (e.g., API source, error message) in logs.
- **localStorage**: Store conversion history under the key `'currency_converter_history'` with max 10 items.
- **Session Data**: No session data required; state resets on page refresh unless restored from URL/localStorage.

## 6. Error Handling

- Always use the `<ErrorMessage />` component for displaying user-facing errors.
- Log detailed error messages to the browser console for debugging.
- Implement graceful API fallbacks:
  - Try exchangerate.host → exchangerate-api.com → open.er-api.com
  - Display a user-friendly message if all APIs fail.
- Validate user input before processing (use `validateAmount()` utility).
- Handle localStorage access errors gracefully (wrap in try/catch).
- Never expose technical error details to the user.

## 7. Critical Gotchas

- **SSR Safety**: Always check `typeof window !== 'undefined'` before accessing browser APIs (localStorage, document).
- **React Hook Rules**: Don't call hooks conditionally; always call them at the component/hook level.
- **Async State**: Exchange rates are fetched asynchronously; initialize UI to handle `null` rates before data arrives.
- **URL Updates**: Use `router.push(..., { scroll: false })` to prevent unwanted scroll when updating URL.
- **Validation**: Always validate amount input before conversion; empty or negative values should be rejected with clear messages.
- **History Limits**: Enforce max 10 items in conversion history; oldest items are removed when exceeded.
- **Type Safety**: Ensure all API responses match the `ExchangeRates` type; handle unexpected response shapes gracefully.
- **Re-render Optimization**: Memoize callbacks with `useCallback` to avoid child component re-renders.

## 8. Documentation

- Update `README.md` and relevant docs in the `docs/` folder for any major changes.
- Document public functions and components with JSDoc comments.
- Include examples in JSDoc for complex utility functions.

## 9. Copilot Prompts & Suggestions

- Prefer concise, context-aware prompts that reference existing patterns.
- Request code that matches the project's style and conventions.
- Review Copilot suggestions for accuracy and security before merging.
- Use specific examples from the codebase when guiding Copilot (e.g., "follow the pattern used in `useConverter`").

---

Feel free to expand or modify these instructions to better fit your team's workflow and standards.

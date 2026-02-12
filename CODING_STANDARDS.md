# Coding Standards

This document outlines the coding standards and best practices for the EVID project (DiveCloud React).

## 1. Core Philosophy

- **Consistency**: The codebase should look like it was written by a single person.
- **Readability**: Code is read much more often than it is written. Optimize for clarity over cleverness.
- **Reliability**: Strict typing and comprehensive testing ensure the application works as expected.

## 2. TypeScript Guidelines

We use **TypeScript** in Strict Mode (`"strict": true` in `tsconfig.json`).

- **No `any`**: Avoid using the `any` type. Use `unknown` if the type is truly not known, or create a specific interface.
- **Interfaces vs Types**: Use `interface` for defining object shapes (props, state, data models) and `type` for unions, intersections, or primitives.
- **Explicit Returns**: Explicitly type the return values of functions, especially exported ones, to prevent accidental API changes.

```typescript
// Good
interface UserProps {
  name: string;
  isActive: boolean;
}

const UserCard = ({ name, isActive }: UserProps): JSX.Element => {
  return <div>{name}</div>;
};
```

## 3. React Best Practices

- **Functional Components**: Use functional components with Hooks. Avoid Class components.
- **Hooks Rules**: Follow the [Rules of Hooks](https://reactjs.org/docs/hooks-rules.html).
  - Only call Hooks at the top level.
  - Only call Hooks from React functions.
- **Component Structure**:
  - One component per file (mostly).
  - Component files should be named in `PascalCase` (e.g., `UserProfile.tsx`).
  - Helper functions related to the component should be kept in the same file or a utils file if shared.
- **Props**: Destructure props in the function signature.

## 4. State Management

- **Local State**: Use `useState` for simple, local component state.
- **Complex State**: Use `useReducer` for complex local state logic.
- **Global State**: (Specify if using Context API, Redux, etc. - currently Context API is implied for lighter apps unless Redux is added).

## 5. CSS & Styling

- **CSS Modules / Styled Components**: (Adjust based on project preference, currently standard CSS imports are seen).
- **Naming**: Use meaningful class names. Avoid generic names like `.box` or `.wrapper` without context.

## 6. Testing

- **Tooling**: We use Jest and React Testing Library (`@testing-library/react`).
- **Philosophy**: Test behavior, not implementation details.
- **File Naming**: Test files should be named `*.test.tsx` or `*.test.ts` and co-located with the component/logic they test.

```typescript
// Example test
test('renders user name', () => {
  render(<UserCard name="Alice" isActive={true} />);
  expect(screen.getByText(/Alice/i)).toBeInTheDocument();
});
```

## 7. Linting & Formatting

- **ESLint**: We extend `react-app` configuration and integrate `prettier`.
- **Prettier**: Code formatting is enforced by Prettier. An `.prettierrc` file is provided.
- **Zero Warnings**: The project enforces a zero-warning policy in CI and pre-commit hooks.
- **Formatting Rules** (enforced by Prettier):
  - Indentation: 2 spaces.
  - Semicolons: Yes.
  - Quotes: Single quotes preferred for JS/TS, Double quotes for JSX.
  - Trailing Commas: ES5 (objects, arrays, etc.)
  - Arrow Parens: Always.

## 8. Git & Version Control

- **Commit Messages**: Write clear, descriptive commit messages.
  - Format: `type(scope): subject` (optional but recommended).
  - Example: `feat(auth): add login validation logic`
- **Branches**: Use feature branches. Do not commit directly to `main`.
- **Hooks**:
  - `pre-commit`: Runs linter on staged files.
  - `pre-push`: Runs full project lint.

## 9. File Organization

```
src/
  components/       # Reusable UI components
  hooks/           # Custom React hooks
  pages/           # Page-level components (routes)
  services/        # API calls and external services
  utils/           # Helper functions
  types/           # Shared TypeScript interfaces
  assets/          # Images, fonts, etc.
```


Generated with Gemini 3 Pro
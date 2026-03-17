# Repository Guidelines

This document provides essential information for contributors to the **new-collections** repository.

## Project Structure

The project is an Angular-based browser extension.

- `src/`: Main source code.
  - `src/app/`: Angular application logic, including components, directives, pipes, and services.
  - `src/assets/`: Static assets like fonts and icons.
  - `src/background.ts`: Background service script.
  - `src/environments/`: Environment-specific configurations.
- `e2e/`: End-to-end test specifications.
- `dist/`: Compiled production builds.
- `mocks/`: Test mocks and utilities.

## Build, Test, and Development Commands

Use `yarn` for managing dependencies and running scripts.

**Build Commands**
- `yarn build:dev`: Build the application for development.
- `yarn build:service`: Build the background service using `esbuild`.
- `yarn build`: Build the application for production.

**Testing & Linting**
- `yarn test`: Run Angular unit tests using `ng test`.
- `yarn e2e`: Run end-to-end tests using `vitest`.
- `yarn lint`: Run ESLint for TypeScript/HTML and `stylelint` for SCSS.
- `yarn fmt`: Automatically format changed files using `prettier`.

## Coding Style & Naming Conventions

- **Language**: TypeScript for logic, HTML for templates, and SCSS for styling.
- **Linting**: We use `eslint` and `stylelint` to enforce code quality.
- **Component Selectors**: Use the `nc` prefix in kebab-case (e.g., `nc-list-item`).
- **Directives**: Use camelCase for attribute selectors (e.g., `[recentTabs]`).
- **Formatting**: Follow the project's Prettier configuration.

## Testing Guidelines

- **Unit Testing**: Use Angular's testing utilities. Test files follow the `.spec.ts` naming convention.
- **E2E Testing**: Use `vitest` for end-to-end testing. Test files are located in the `e2e/` directory.
- **Coverage**: Ensure significant logic coverage, especially in services and utilities.

## Commit & Pull Request Guidelines

- **Commits**: Use clear, descriptive commit messages.
- **Pull Requests**:
  - Provide a clear description of the changes.
  - Ensure all tests pass before submitting.
  - Link any relevant issues in the PR description.

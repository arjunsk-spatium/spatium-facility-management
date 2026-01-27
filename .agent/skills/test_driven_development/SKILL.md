---
name: Test Driven Development
description: Enforces creating and updating tests for every feature change or addition.
---

# Test Driven Development Skill

## Context
This skill ensures that code quality is maintained by enforcing a strict testing discipline.
Whenever a component or feature is created or modified, the corresponding tests MUST be created or updated.

## Trigger
- Creating a new component or page
- Adding a new feature to an existing component
- Fixing a bug
- Refactoring code

## Workflow

### 1. Environment Check
Before proceeding, ensure the workspace has a testing harness (Vitest).
- Check `package.json` for `vitest`.
- If missing, ask the user to install it or run: `npm install -D vitest @nuxt/test-utils @vue/test-utils happy-dom`

### 2. Strategy: New Features / Components
1.  **Scaffold Test First**: Before or immediately after creating `[Component].vue`, create `[Component].spec.ts` in the same directory.
2.  **Define Expectations**: Write tests for:
    -   Mounting the component.
    -   Default props and state.
    -   Key interactions (clicks, inputs).
    -   Emitted events.
3.  **Run & Verify**: Run `npx vitest run path/to/feature.spec.ts`.

### 3. Strategy: Modifying Existing Features
1.  **Locate Test**: Find the existing `.spec.ts` file.
    -   If none exists, CREATE IT immediately describing the current behavior.
2.  **Update Test Case**: Add a test case for the *new* requirement or the bug fix.
    -   E.g., if adding a "delete" button, add `it('emits delete event when clicked')`.
3.  **Implement Change**: Modify the code to pass the new test case.
4.  **Regression Check**: Run the test file to ensure previous features didn't break.

## Rules
- **No Orphan Code**: No logic should exist without a verifying test.
- **Fail First**: It is good practice to see the test fail before implementing the logic (Red-Green-Refactor).
- **Mocking**: Use `vi.mock()` for external API calls. Do not make real network requests.

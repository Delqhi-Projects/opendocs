## E2E Test Files

| File                         | Description             | Tests        |
| ---------------------------- | ----------------------- | ------------ |
| `app.spec.ts`                | Core application tests  | 14 tests     |
| `keyboard-shortcuts.spec.ts` | Keyboard shortcut tests | 2 tests      |
| `command-palette.spec.ts`    | Command palette tests   | 2 tests      |
| `visual-audit.spec.ts`       | Screenshot generation   | 11 scenarios |

**Total: 29 functional tests + 55 visual audit screenshots**

## Running Tests

```bash
# Run all E2E tests
npx playwright test tests/e2e

# Run specific test file
npx playwright test tests/e2e/app.spec.ts

# Run with UI mode
npx playwright test --ui

# Run in headed mode (see browser)
npx playwright test --headed
```

## CI/CD Pipeline

Tests run automatically on GitHub Actions for:

- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

See `.github/workflows/ci.yml` for configuration.

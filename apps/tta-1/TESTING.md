# PRASHIKSHAN Testing Guide

## Test Suite Overview

This project includes comprehensive tests for all features:
- **Unit Tests**: Individual component and function testing
- **Integration Tests**: API endpoint testing
- **Test Data**: Various CSV scenarios

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Workflow Test (End-to-End)
```bash
npm run test:workflow
```

## Test Files

### Unit Tests

#### `tests/unit/csv-parser.test.ts`
Tests CSV parsing and validation:
- ✅ Valid CSV with all required columns
- ✅ CSV with optional columns
- ✅ Missing required columns (should fail)
- ✅ Invalid score values (should fail)
- ✅ Invalid max_score values (should fail)
- ✅ Empty rows handling
- ✅ Large CSV files (100+ rows)
- ✅ File type validation
- ✅ File size validation (max 10MB)

#### `tests/unit/agent-a.test.ts`
Tests Agent A (Insight Analyst):
- ✅ Class average calculation
- ✅ Weakest topic identification
- ✅ At-risk student detection (< 50%)
- ✅ Item tag generation
- ✅ Memory updates creation
- ✅ Handling data without topic tags
- ✅ Percentage below threshold calculation

#### `tests/unit/validation.test.ts`
Tests validation scoring:
- ✅ High score for well-covered lessons
- ✅ Low score for poorly covered lessons
- ✅ Penalty for short content
- ✅ Reward for examples and practice
- ✅ Detailed breakdown (5 dimensions)
- ✅ Pass/fail threshold (80/100)

## Test Data Files

Located in `public/test-data/`:

### Valid CSV Files

**`test-valid-minimal.csv`**
- Only required columns
- 3 students, 1 question
- Use: Basic parsing test

**`test-valid-full.csv`**
- All columns (including optional)
- 2 students, 3 questions, 2 topics
- Use: Full feature test

**`test-perfect-scores.csv`**
- All students scoring 100%
- Use: Edge case testing
- Expected: No at-risk students

**`test-single-student.csv`**
- Only 1 student
- Use: Minimum viable data
- Expected: Should work normally

### Invalid CSV Files

**`test-invalid-missing-columns.csv`**
- Missing `question_id` column
- Expected: Validation error

**`test-invalid-bad-scores.csv`**
- Non-numeric score values
- Expected: Data validation error

### Special Scenario Files

**`test-all-failing.csv`**
- All students < 20% average
- Use: At-risk detection
- Expected: All students flagged

**`sample.csv`** (main test file)
- 15 rows, 5 students, 2 topics
- Realistic classroom data
- Expected: Identifies negative_integers as weak

## Test Coverage Goals

- **CSV Parser**: 100% coverage
- **Agent A**: 95%+ coverage
- **Validation**: 100% coverage
- **API Routes**: 80%+ coverage
- **UI Components**: 70%+ coverage

## Writing New Tests

### Example Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from '@/lib/my-module';

describe('My Module', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

### Example Component Test
```typescript
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

it('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## CI/CD Integration

Tests run automatically on:
- Every commit (via GitHub Actions)
- Pull requests
- Before deployment

## Troubleshooting

### Tests Failing?
1. Check if dependencies are installed: `npm install`
2. Ensure `.env.local` has required variables
3. Run `npm run db:push` to sync database

### Slow Tests?
- Use `--run` flag to skip watch mode
- Run specific test files: `npm test csv-parser`

### Coverage Not Showing?
- Install coverage reporter: `npm install -D @vitest/coverage-v8`
- Run: `npm run test:coverage`

## Best Practices

1. **Test Naming**: Use descriptive names (`should calculate average correctly`)
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mock External APIs**: Don't call real Gemini API in tests
4. **Test Edge Cases**: Empty data, large data, invalid data
5. **Keep Tests Fast**: Unit tests should run in milliseconds

## Next Steps

- [ ] Add API integration tests
- [ ] Add UI component tests
- [ ] Add E2E tests with Playwright
- [ ] Set up CI/CD pipeline
- [ ] Add performance benchmarks

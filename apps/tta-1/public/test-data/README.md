# Test CSV Files for TTA-1

This directory contains various CSV files for testing different scenarios.

## Files

### 1. `sample.csv` (Main Test File)
Standard test file with 15 rows, 5 students, 2 topics (negative_integers, linear_eqns).
- **Use case**: Normal workflow testing
- **Expected**: Should identify negative_integers as weak topic

### 2. `test-valid-minimal.csv`
Minimal valid CSV with only required columns.
- **Use case**: Testing basic parsing
- **Expected**: Should parse successfully

### 3. `test-valid-full.csv`
CSV with all optional columns included.
- **Use case**: Testing full feature support
- **Expected**: Should parse all fields correctly

### 4. `test-invalid-missing-columns.csv`
Missing required column (question_id).
- **Use case**: Testing validation
- **Expected**: Should fail with error about missing column

### 5. `test-invalid-bad-scores.csv`
Contains non-numeric scores.
- **Use case**: Testing data validation
- **Expected**: Should fail with invalid score error

### 6. `test-large-class.csv`
100 students, multiple topics.
- **Use case**: Performance testing
- **Expected**: Should handle large datasets

### 7. `test-all-failing.csv`
All students scoring below 50%.
- **Use case**: Testing at-risk detection
- **Expected**: Should identify all students as at-risk

### 8. `test-perfect-scores.csv`
All students with 100% scores.
- **Use case**: Testing edge cases
- **Expected**: No at-risk students, high class average

### 9. `test-single-student.csv`
Only one student's data.
- **Use case**: Testing minimum viable data
- **Expected**: Should work with single student

### 10. `test-empty.csv`
Empty CSV (only headers).
- **Use case**: Testing edge case
- **Expected**: Should fail gracefully

import { describe, it, expect } from 'vitest';
import { parseCSV, validateCSVFile } from '@/lib/utils/csv-parser';

describe('CSV Parser', () => {
    describe('parseCSV', () => {
        it('should parse valid CSV with all required columns', () => {
            const csvContent = `student_id,question_id,score,max_score,topic_tag
1,q1,4,5,algebra
2,q1,3,5,algebra`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.data).toHaveLength(2);
            expect(result.data[0]).toEqual({
                student_id: '1',
                question_id: 'q1',
                score: 4,
                max_score: 5,
                topic_tag: 'algebra',
                student_name: undefined,
                timestamp: undefined,
                item_text: undefined,
            });
        });

        it('should handle CSV with optional columns', () => {
            const csvContent = `student_id,student_name,question_id,topic_tag,score,max_score,timestamp
1,Alice,q1,algebra,4,5,2025-11-20
2,Bob,q1,algebra,3,5,2025-11-20`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(true);
            expect(result.data[0].student_name).toBe('Alice');
            expect(result.data[0].timestamp).toBe('2025-11-20');
        });

        it('should fail when required columns are missing', () => {
            const csvContent = `student_id,score,max_score
1,4,5`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(false);
            expect(result.errors).toContain('Missing required column: question_id');
        });

        it('should validate score is a number', () => {
            const csvContent = `student_id,question_id,score,max_score
1,q1,invalid,5`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Invalid score'))).toBe(true);
        });

        it('should validate max_score is a positive number', () => {
            const csvContent = `student_id,question_id,score,max_score
1,q1,4,0`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(false);
            expect(result.errors.some(e => e.includes('Invalid max_score'))).toBe(true);
        });

        it('should skip empty rows', () => {
            const csvContent = `student_id,question_id,score,max_score
1,q1,4,5

2,q2,3,5`;

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(true);
            expect(result.data).toHaveLength(2);
        });

        it('should handle large CSV files', () => {
            const rows = ['student_id,question_id,score,max_score'];
            for (let i = 1; i <= 100; i++) {
                rows.push(`${i},q${i},${Math.floor(Math.random() * 5)},5`);
            }
            const csvContent = rows.join('\n');

            const result = parseCSV(csvContent);

            expect(result.valid).toBe(true);
            expect(result.data).toHaveLength(100);
        });
    });

    describe('validateCSVFile', () => {
        it('should accept .csv files', () => {
            const file = new File([''], 'test.csv', { type: 'text/csv' });
            const error = validateCSVFile(file);
            expect(error).toBeNull();
        });

        it('should reject non-CSV files', () => {
            const file = new File([''], 'test.txt', { type: 'text/plain' });
            const error = validateCSVFile(file);
            expect(error).toBe('File must be a CSV file');
        });

        it('should reject files larger than 10MB', () => {
            const largeContent = 'a'.repeat(11 * 1024 * 1024);
            const file = new File([largeContent], 'large.csv', { type: 'text/csv' });
            const error = validateCSVFile(file);
            expect(error).toBe('File size must be less than 10MB');
        });
    });
});

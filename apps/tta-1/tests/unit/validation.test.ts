import { describe, it, expect } from 'vitest';
import { computeValidationScore } from '@/lib/utils/validation';
import type { AuditReport } from '@/types/agent';

describe('Validation Scoring', () => {
    it('should give high score for well-covered lesson', () => {
        const auditReport: AuditReport = {
            covered: true,
            coverage_score: 0.9,
            missing_objectives: [],
            suggested_changes: [],
            evidence: [],
        };

        const draftText = `
This is a comprehensive lesson with examples and practice problems.

Example 1: Solve x + 5 = 10
Practice: Try solving x + 3 = 7
    `.trim();

        const result = computeValidationScore(auditReport, draftText);

        expect(result.score).toBeGreaterThanOrEqual(80);
        expect(result.passed).toBe(true);
    });

    it('should give low score for poorly covered lesson', () => {
        const auditReport: AuditReport = {
            covered: false,
            coverage_score: 0.3,
            missing_objectives: ['word_problems', 'visual_aids'],
            suggested_changes: ['Add examples', 'Add practice'],
            evidence: [],
        };

        const draftText = 'x = 5';

        const result = computeValidationScore(auditReport, draftText);

        expect(result.score).toBeLessThan(60);
        expect(result.passed).toBe(false);
    });

    it('should penalize very short content', () => {
        const auditReport: AuditReport = {
            covered: true,
            coverage_score: 1.0,
            missing_objectives: [],
            suggested_changes: [],
            evidence: [],
        };

        const shortDraft = 'x = 5';

        const result = computeValidationScore(auditReport, shortDraft);

        expect(result.breakdown.targeting).toBeLessThan(20);
        expect(result.breakdown.readability).toBeLessThan(15);
    });

    it('should reward content with examples and practice', () => {
        const auditReport: AuditReport = {
            covered: true,
            coverage_score: 0.8,
            missing_objectives: [],
            suggested_changes: [],
            evidence: [],
        };

        const goodDraft = `
Example: Solve x + 5 = 10
Problem: Try x + 3 = 7
Practice exercises below
    `;

        const result = computeValidationScore(auditReport, goodDraft);

        expect(result.breakdown.assessment).toBe(15);
    });

    it('should provide detailed breakdown', () => {
        const auditReport: AuditReport = {
            covered: true,
            coverage_score: 0.7,
            missing_objectives: [],
            suggested_changes: [],
            evidence: [],
        };

        const draft = 'Example problem: x + 5 = 10\nPractice: solve it';

        const result = computeValidationScore(auditReport, draft);

        expect(result.breakdown).toHaveProperty('standards');
        expect(result.breakdown).toHaveProperty('targeting');
        expect(result.breakdown).toHaveProperty('readability');
        expect(result.breakdown).toHaveProperty('assessment');
        expect(result.breakdown).toHaveProperty('safety');

        const total = Object.values(result.breakdown).reduce((sum, val) => sum + val, 0);
        expect(total).toBe(result.score);
    });
});

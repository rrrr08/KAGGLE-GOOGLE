import { describe, it, expect } from 'vitest';
import { AgentA } from '@/lib/agents/agent-a';
import type { CSVRow } from '@/types/student';

describe('Agent A - Insight Analyst', () => {
    const agent = new AgentA();

    const sampleData: CSVRow[] = [
        { student_id: '1', question_id: 'q1', topic_tag: 'algebra', score: 4, max_score: 5 },
        { student_id: '1', question_id: 'q2', topic_tag: 'algebra', score: 3, max_score: 5 },
        { student_id: '1', question_id: 'q3', topic_tag: 'geometry', score: 5, max_score: 5 },
        { student_id: '2', question_id: 'q1', topic_tag: 'algebra', score: 2, max_score: 5 },
        { student_id: '2', question_id: 'q2', topic_tag: 'algebra', score: 1, max_score: 5 },
        { student_id: '2', question_id: 'q3', topic_tag: 'geometry', score: 2, max_score: 5 },
        { student_id: '3', question_id: 'q1', topic_tag: 'algebra', score: 5, max_score: 5 },
        { student_id: '3', question_id: 'q2', topic_tag: 'algebra', score: 5, max_score: 5 },
        { student_id: '3', question_id: 'q3', topic_tag: 'geometry', score: 5, max_score: 5 },
    ];

    it('should calculate correct class average', () => {
        const result = agent.analyze(sampleData, '7A');

        // Average: (4+3+5+2+1+2+5+5+5) / 9 = 32/9 * 100/5 = 71.11%
        expect(result.class_average).toBeGreaterThan(70);
        expect(result.class_average).toBeLessThan(72);
    });

    it('should identify weakest topics', () => {
        const result = agent.analyze(sampleData, '7A');

        expect(result.weakest_topics).toHaveLength(2);
        expect(result.weakest_topics[0].topic).toBe('algebra');
        expect(result.weakest_topics[0].avg).toBeLessThan(result.weakest_topics[1].avg);
    });

    it('should identify at-risk students (avg < 50%)', () => {
        const result = agent.analyze(sampleData, '7A');

        // Student 2 has avg: (2+1+2)/3 * 100/5 = 33.33%
        expect(result.at_risk_students).toContain('2');
        expect(result.at_risk_students).not.toContain('3'); // Student 3 has 100%
    });

    it('should generate item tags', () => {
        const result = agent.analyze(sampleData, '7A');

        expect(result.item_tags).toHaveLength(3); // q1, q2, q3
        expect(result.item_tags.some(tag => tag.question_id === 'q1')).toBe(true);
    });

    it('should create memory updates for weakest topic', () => {
        const result = agent.analyze(sampleData, '7A');

        expect(result.memory_updates).toHaveLength(1);
        expect(result.memory_updates[0].type).toBe('class_weakness');
        expect(result.memory_updates[0].value).toBe('algebra');
    });

    it('should handle data without topic tags', () => {
        const dataWithoutTopics: CSVRow[] = [
            { student_id: '1', question_id: 'q1', score: 4, max_score: 5 },
            { student_id: '2', question_id: 'q1', score: 3, max_score: 5 },
        ];

        const result = agent.analyze(dataWithoutTopics, '7A');

        expect(result.weakest_topics).toHaveLength(0);
        expect(result.item_tags).toHaveLength(0);
        expect(result.class_average).toBeGreaterThan(0);
    });

    it('should calculate percentage below threshold correctly', () => {
        const result = agent.analyze(sampleData, '7A');

        const algebraTopic = result.weakest_topics.find(t => t.topic === 'algebra');
        expect(algebraTopic).toBeDefined();
        expect(algebraTopic!.pct_below).toBeGreaterThan(0);
    });
});

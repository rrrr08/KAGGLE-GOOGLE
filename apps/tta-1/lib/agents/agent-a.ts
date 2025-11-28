import type { AgentAOutput, WeakTopic, ItemTag, MemoryUpdate } from "@/types/agent";
import type { CSVRow } from "@/types/student";

export class AgentA {
    /**
     * Analyzes student CSV data to identify class trends and at-risk students
     */
    analyze(csvData: CSVRow[], classId: string): AgentAOutput {
        const runId = crypto.randomUUID();

        // Calculate percentage scores for each row
        const dataWithPct = csvData.map((row) => ({
            ...row,
            pct_score: (row.score / row.max_score) * 100,
        }));

        // 1. Compute Class Average
        const classAvg =
            dataWithPct.reduce((sum, row) => sum + row.pct_score, 0) / dataWithPct.length;

        // 2. Analyze Topics (if topic_tag exists)
        const weakestTopics: WeakTopic[] = [];
        const itemTags: ItemTag[] = [];

        // Group by topic
        const topicGroups = new Map<string, typeof dataWithPct>();
        for (const row of dataWithPct) {
            if (row.topic_tag) {
                if (!topicGroups.has(row.topic_tag)) {
                    topicGroups.set(row.topic_tag, []);
                }
                topicGroups.get(row.topic_tag)!.push(row);
            }
        }

        // Calculate topic statistics
        for (const [topic, rows] of topicGroups.entries()) {
            const topicAvg = rows.reduce((sum, r) => sum + r.pct_score, 0) / rows.length;

            // Group by student to get their average for this topic
            const studentTopicAvgs = new Map<string, number>();
            for (const row of rows) {
                if (!studentTopicAvgs.has(row.student_id)) {
                    const studentRows = rows.filter((r) => r.student_id === row.student_id);
                    const avg =
                        studentRows.reduce((sum, r) => sum + r.pct_score, 0) / studentRows.length;
                    studentTopicAvgs.set(row.student_id, avg);
                }
            }

            // Calculate percentage below 60%
            const belowThreshold = Array.from(studentTopicAvgs.values()).filter(
                (avg) => avg < 60
            ).length;
            const pctBelow = belowThreshold / studentTopicAvgs.size;

            weakestTopics.push({
                topic,
                avg: topicAvg,
                pct_below: pctBelow,
            });

            // Collect unique question-topic pairs
            const uniqueQuestions = new Set(rows.map((r) => r.question_id));
            for (const qid of uniqueQuestions) {
                itemTags.push({ question_id: qid, topic });
            }
        }

        // Sort topics by average score (weakest first)
        weakestTopics.sort((a, b) => a.avg - b.avg);

        // 3. Identify At-Risk Students (overall average < 50%)
        const studentAvgs = new Map<string, number>();
        for (const row of dataWithPct) {
            if (!studentAvgs.has(row.student_id)) {
                const studentRows = dataWithPct.filter((r) => r.student_id === row.student_id);
                const avg =
                    studentRows.reduce((sum, r) => sum + r.pct_score, 0) / studentRows.length;
                studentAvgs.set(row.student_id, avg);
            }
        }

        const atRiskStudents = Array.from(studentAvgs.entries())
            .filter(([_, avg]) => avg < 50)
            .map(([id]) => id);

        // 4. Memory Updates
        const memoryUpdates: MemoryUpdate[] = [];
        if (weakestTopics.length > 0) {
            memoryUpdates.push({
                type: "class_weakness",
                value: weakestTopics[0].topic,
            });
        }

        return {
            run_id: runId,
            class_average: classAvg,
            weakest_topics: weakestTopics,
            at_risk_students: atRiskStudents,
            item_tags: itemTags,
            memory_updates: memoryUpdates,
        };
    }
}

import type { AuditReport, AgentAOutput } from "@/types/agent";
import { generateJSON } from "@/lib/ai/gemini";
import { buildAuditorPrompt } from "@/lib/ai/prompts";

export class AgentB {
    /**
     * Audits a lesson draft against curriculum standards using Gemini AI
     */
    async audit(
        draftText: string,
        agentAOutput: AgentAOutput,
        classId: string
    ): Promise<AuditReport> {
        // For MVP, we'll use a mock standard. In production, this would search a standards database
        const weakTopic = agentAOutput.weakest_topics[0]?.topic || "general math";

        // Mock standard text (in production, fetch from database based on grade/topic)
        const standardText = `Standard 7.EE.B.4: Use variables to represent quantities in a real-world or mathematical problem, and construct simple equations and inequalities to solve problems by reasoning about the quantities.
    
Objectives:
- Solve word problems leading to equations of the form px + q = r and p(x + q) = r
- Solve word problems leading to inequalities of the form px + q > r or px + q < r
- Graph the solution set of the inequality and interpret it in the context of the problem
- Use appropriate mathematical vocabulary and notation`;

        try {
            const prompt = buildAuditorPrompt(draftText, standardText, weakTopic);
            const auditResult = await generateJSON<AuditReport>(prompt);

            return auditResult;
        } catch (error) {
            console.error("Agent B audit error:", error);

            // Fallback to mock audit if AI fails
            return this.mockAudit(draftText, weakTopic);
        }
    }

    /**
     * Mock audit for fallback or testing
     */
    private mockAudit(draftText: string, weakTopic: string): AuditReport {
        let coverageScore = 0.4;
        const missingObjectives: string[] = ["word_problem_contexts", "interpreting_coefficients"];
        const suggestions: string[] = [
            "Add 3 word problems using financial context",
            "Include number-line visualization",
        ];

        // Simple heuristic checks
        if (draftText.toLowerCase().includes("financial") || draftText.toLowerCase().includes("money")) {
            coverageScore += 0.3;
            const idx = missingObjectives.indexOf("word_problem_contexts");
            if (idx > -1) missingObjectives.splice(idx, 1);
        }

        if (draftText.toLowerCase().includes("number-line") || draftText.toLowerCase().includes("number line")) {
            coverageScore += 0.2;
            const idx = missingObjectives.indexOf("interpreting_coefficients");
            if (idx > -1) missingObjectives.splice(idx, 1);
        }

        const covered = coverageScore >= 0.8;

        return {
            standard_id: "7.EE.B.4",
            standard_text: "Solve word problems leading to equations of the form px + q = r.",
            covered,
            coverage_score: Math.min(coverageScore, 1.0),
            missing_objectives: missingObjectives,
            suggested_changes: covered ? [] : suggestions,
            evidence: [
                {
                    source: "https://example.org/ccss/7ee",
                    excerpt: "Standard requires word problem contexts and variable interpretation",
                },
            ],
        };
    }
}

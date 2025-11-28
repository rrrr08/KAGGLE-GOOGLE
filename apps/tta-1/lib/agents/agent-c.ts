import type { LessonDraft, AuditReport, AgentAOutput } from "@/types/agent";
import { generateJSON } from "@/lib/ai/gemini";
import { buildArchitectPrompt } from "@/lib/ai/prompts";

export class AgentC {
    /**
     * Rewrites lesson content based on audit feedback using Gemini AI
     */
    async rewrite(
        currentDraft: string,
        auditReport: AuditReport,
        agentAOutput: AgentAOutput
    ): Promise<LessonDraft> {
        const weakTopic = agentAOutput.weakest_topics[0]?.topic;

        try {
            const prompt = buildArchitectPrompt(currentDraft, auditReport, weakTopic);
            const lessonDraft = await generateJSON<LessonDraft>(prompt);

            return lessonDraft;
        } catch (error) {
            console.error("Agent C rewrite error:", error);

            // Fallback to mock rewrite if AI fails
            return this.mockRewrite(currentDraft, auditReport);
        }
    }

    /**
     * Mock rewrite for fallback or testing
     */
    private mockRewrite(currentDraft: string, auditReport: AuditReport): LessonDraft {
        let newDraftText = currentDraft + "\n\n--- REVISED CONTENT ---\n\n";

        // "Fix" the draft based on suggestions
        for (const suggestion of auditReport.suggested_changes) {
            if (suggestion.toLowerCase().includes("financial")) {
                newDraftText += `
**Word Problem Example (Financial Context):**
Sarah has $50 in her savings account. She plans to save $5 per week. How many weeks will it take her to have $100?

Solution: Let x = number of weeks
Equation: 50 + 5x = 100
Solving: 5x = 50, so x = 10 weeks
\n`;
            } else if (suggestion.toLowerCase().includes("number-line")) {
                newDraftText += `
**Visualization on a Number Line:**
When solving -3x = 9, we can visualize the solution:
[---(-5)---(-4)---(-3)---(-2)---(-1)---(0)---(1)---(2)---(3)---]
The solution x = -3 is marked on the number line.
\n`;
            } else {
                newDraftText += `\nAddressing: ${suggestion}\n`;
            }
        }

        const draftId = `plan_v_${Date.now()}`;

        return {
            draft_id: draftId,
            draft_text: newDraftText,
            variants: [
                {
                    level: "easy",
                    text: "Simplified version: Start with basic one-step equations like x + 5 = 10",
                },
                {
                    level: "medium",
                    text: "Standard version: Two-step equations like 2x + 3 = 11",
                },
                {
                    level: "hard",
                    text: "Advanced version: Multi-step with distribution like 3(x + 2) = 15",
                },
            ],
            tags: ["revised", "v2", "word-problems"],
            assessment_items: [
                {
                    q: "If John has $20 and saves $3 per day, write an equation for when he'll have $50",
                    answer: "20 + 3x = 50, where x is the number of days",
                },
                {
                    q: "Solve: 2x + 7 = 15",
                    answer: "x = 4",
                },
                {
                    q: "Graph the solution to x > 3 on a number line",
                    answer: "Open circle at 3, arrow pointing right",
                },
            ],
        };
    }
}

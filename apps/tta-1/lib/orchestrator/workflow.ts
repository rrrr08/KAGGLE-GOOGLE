import { AgentA } from "@/lib/agents/agent-a";
import { AgentB } from "@/lib/agents/agent-b";
import { AgentC } from "@/lib/agents/agent-c";
import { computeValidationScore } from "@/lib/utils/validation";
import type { CSVRow } from "@/types/student";
import type { WorkflowResult, IterationHistory } from "@/types/agent";

export class Orchestrator {
    private agentA: AgentA;
    private agentB: AgentB;
    private agentC: AgentC;

    constructor() {
        this.agentA = new AgentA();
        this.agentB = new AgentB();
        this.agentC = new AgentC();
    }

    /**
     * Runs the complete TTA-1 workflow
     */
    async runWorkflow(
        csvData: CSVRow[],
        initialLessonText: string,
        classId: string,
        teacherId: string
    ): Promise<WorkflowResult> {
        const runId = crypto.randomUUID();
        console.log(`Starting run ${runId} for class ${classId}`);

        // Step 1: Analyze Data (Agent A)
        console.log("Running Agent A...");
        const agentAOutput = this.agentA.analyze(csvData, classId);

        // TODO: Write to Memory (Class Trends) here

        let draftText = initialLessonText;
        const maxIterations = process.env.MAX_ITERATIONS ? parseInt(process.env.MAX_ITERATIONS) : 5;
        let iteration = 0;
        let validationResult = null;

        const history: IterationHistory[] = [];

        while (iteration < maxIterations) {
            iteration++;
            console.log(`Iteration ${iteration}...`);

            // Step 2: Audit (Agent B)
            const auditReport = await this.agentB.audit(draftText, agentAOutput, classId);

            // Step 3: Validate
            validationResult = computeValidationScore(auditReport, draftText);
            console.log(`Validation Score: ${validationResult.score}`);

            history.push({
                iter: iteration,
                score: validationResult.score,
                draft_snippet: draftText.substring(0, 100) + "...",
            });

            if (validationResult.passed) {
                console.log("Validation passed!");
                break;
            }

            // Step 4: Rewrite (Agent C) if not passed
            if (iteration < maxIterations) {
                console.log("Rewriting...");
                const lessonDraft = await this.agentC.rewrite(draftText, auditReport, agentAOutput);
                draftText = lessonDraft.draft_text;
            }
        }

        return {
            run_id: runId,
            final_score: validationResult?.score || 0,
            final_draft: draftText,
            agent_a_summary: agentAOutput,
            history,
            passed: validationResult?.passed || false,
        };
    }
}

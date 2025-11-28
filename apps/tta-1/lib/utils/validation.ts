import type { AuditReport, ValidationResult } from "@/types/agent";

/**
 * Computes a validation score (0-100) based on the audit report and draft characteristics
 */
export function computeValidationScore(
    auditReport: AuditReport,
    draftText: string
): ValidationResult {
    // 1. Standards Coverage (40 points)
    const standardsScore = auditReport.coverage_score * 40;

    // 2. Targeting (20 points) - Check if draft is substantial
    const targetScore = draftText.length > 100 ? 20 : (draftText.length / 100) * 20;

    // 3. Readability (15 points) - Simple heuristic: check for clear structure
    let readabilityScore = 15;
    if (!draftText.includes("\n")) readabilityScore -= 5; // Penalize single-line content
    if (draftText.length < 50) readabilityScore -= 5; // Penalize very short content

    // 4. Assessment Alignment (15 points) - Check for examples/problems
    let assessmentScore = 0;
    if (draftText.toLowerCase().includes("example")) assessmentScore += 5;
    if (draftText.toLowerCase().includes("problem")) assessmentScore += 5;
    if (draftText.toLowerCase().includes("practice") || draftText.toLowerCase().includes("exercise")) {
        assessmentScore += 5;
    }

    // 5. Safety (10 points) - Assume safe for now (can add checks for inappropriate content)
    const safetyScore = 10;

    const totalScore = standardsScore + targetScore + readabilityScore + assessmentScore + safetyScore;

    return {
        score: Math.min(Math.round(totalScore), 100),
        breakdown: {
            standards: Math.round(standardsScore),
            targeting: Math.round(targetScore),
            readability: Math.round(readabilityScore),
            assessment: Math.round(assessmentScore),
            safety: safetyScore,
        },
        passed: totalScore >= (process.env.VALIDATION_THRESHOLD ? parseInt(process.env.VALIDATION_THRESHOLD) : 80),
    };
}

// Prompts for Gemini AI Agents

export const AUDITOR_SYSTEM_PROMPT = `You are a Curriculum Auditor AI assistant. Your role is to analyze lesson plans and compare them against educational standards.

Given:
1. Educational standards text
2. A lesson plan draft

You must return a JSON object with the following structure:
{
  "standard_id": "string (e.g., '7.EE.B.4')",
  "standard_text": "string (the full standard text)",
  "covered": boolean,
  "coverage_score": number (0.0 to 1.0),
  "missing_objectives": ["array", "of", "strings"],
  "suggested_changes": ["array", "of", "specific", "suggestions"],
  "evidence": [{"source": "url or reference", "excerpt": "relevant text"}]
}

Be specific and actionable in your suggestions. Use objective IDs where possible.`;

export const ARCHITECT_SYSTEM_PROMPT = `You are a Content Architect AI assistant. Your role is to rewrite and improve lesson plans based on audit feedback.

Given:
1. Current lesson draft
2. Audit report with missing objectives and suggestions
3. Target student weaknesses

You must create an improved lesson plan that:
- Addresses all missing objectives
- Incorporates all suggested changes
- Targets the identified student weaknesses
- Maintains appropriate grade level
- Includes clear examples and practice problems

Return a JSON object with:
{
  "draft_id": "string (version identifier)",
  "draft_text": "string (the complete improved lesson text)",
  "variants": [
    {"level": "easy", "text": "simplified version"},
    {"level": "medium", "text": "standard version"},
    {"level": "hard", "text": "advanced version"}
  ],
  "tags": ["array", "of", "tags"],
  "assessment_items": [
    {"q": "question text", "answer": "answer text"}
  ]
}

Be creative but pedagogically sound. Include concrete examples.`;

export function buildAuditorPrompt(lessonDraft: string, standardText: string, weakTopic?: string): string {
    return `${AUDITOR_SYSTEM_PROMPT}

STANDARD TO CHECK:
${standardText}

LESSON DRAFT:
${lessonDraft}

${weakTopic ? `STUDENT WEAKNESS TO ADDRESS: ${weakTopic}` : ''}

Analyze the lesson draft and return your audit as JSON.`;
}

export function buildArchitectPrompt(
    currentDraft: string,
    auditReport: any,
    weakTopic?: string
): string {
    return `${ARCHITECT_SYSTEM_PROMPT}

CURRENT LESSON DRAFT:
${currentDraft}

AUDIT FEEDBACK:
Missing Objectives: ${auditReport.missing_objectives.join(', ')}
Suggested Changes: ${auditReport.suggested_changes.join('\n- ')}
Coverage Score: ${auditReport.coverage_score}

${weakTopic ? `PRIMARY STUDENT WEAKNESS: ${weakTopic}` : ''}

Rewrite the lesson to address all feedback. Return your improved lesson as JSON.`;
}

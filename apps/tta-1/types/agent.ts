// Agent Type Definitions

export interface ItemTag {
  question_id: string;
  topic: string;
}

export interface WeakTopic {
  topic: string;
  avg: number;
  pct_below: number;
}

export interface MemoryUpdate {
  type: string;
  value: any;
}

export interface AgentAOutput {
  run_id: string;
  class_average: number;
  weakest_topics: WeakTopic[];
  at_risk_students: string[];
  item_tags: ItemTag[];
  memory_updates: MemoryUpdate[];
}

export interface Evidence {
  source: string;
  excerpt: string;
}

export interface AuditReport {
  standard_id?: string;
  standard_text?: string;
  covered: boolean;
  coverage_score: number; // 0.0 to 1.0
  missing_objectives: string[];
  suggested_changes: string[];
  evidence: Evidence[];
}

export interface AssessmentItem {
  q: string;
  answer: string;
}

export interface Variant {
  level: string; // easy, med, hard
  text: string;
}

export interface LessonDraft {
  draft_id: string;
  draft_text: string;
  variants: Variant[];
  tags: string[];
  assessment_items: AssessmentItem[];
}

export interface ValidationResult {
  score: number;
  breakdown: {
    standards: number;
    targeting: number;
    readability: number;
    assessment: number;
    safety: number;
  };
  passed: boolean;
}

export interface IterationHistory {
  iter: number;
  score: number;
  draft_snippet: string;
}

export interface WorkflowResult {
  run_id: string;
  final_score: number;
  final_draft: string;
  agent_a_summary: AgentAOutput;
  history: IterationHistory[];
  passed: boolean;
}

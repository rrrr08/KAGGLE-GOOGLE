// Student and Class Type Definitions

export interface ScoreHistory {
    score_history: number[];
    last_assessed: string; // ISO date string
}

export interface StudentSkills {
    [topic: string]: ScoreHistory;
}

export interface Intervention {
    type: string;
    date: string; // ISO date string
    result?: {
        pre: number;
        post: number;
    };
}

export interface StudentProfile {
    student_id: string;
    name?: string;
    class_id: string;
    hashed_id?: string;
    skills: StudentSkills;
    notes: string[];
    interventions: Intervention[];
}

export interface TopicTrend {
    avg: number;
    delta_4w?: number;
}

export interface ClassTrend {
    class_id: string;
    snapshot_date: string; // ISO date string
    class_weaknesses: string[];
    trend_summary: {
        [topic: string]: TopicTrend;
    };
    versions: string[];
}

export interface CSVRow {
    student_id: string;
    student_name?: string;
    question_id: string;
    topic_tag?: string;
    score: number;
    max_score: number;
    timestamp?: string;
    item_text?: string;
}

import Papa from "papaparse";
import type { CSVRow } from "@/types/student";

export interface CSVParseResult {
    data: CSVRow[];
    errors: string[];
    valid: boolean;
}

/**
 * Parses CSV file content and validates the structure
 */
export function parseCSV(fileContent: string): CSVParseResult {
    const errors: string[] = [];

    const result = Papa.parse<any>(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
    });

    if (result.errors.length > 0) {
        errors.push(...result.errors.map((e) => e.message));
    }

    // Validate required columns
    const requiredColumns = ["student_id", "question_id", "score", "max_score"];
    const headers = result.meta.fields || [];

    for (const col of requiredColumns) {
        if (!headers.includes(col)) {
            errors.push(`Missing required column: ${col}`);
        }
    }

    if (errors.length > 0) {
        return { data: [], errors, valid: false };
    }

    // Transform and validate data
    const csvData: CSVRow[] = [];

    for (let i = 0; i < result.data.length; i++) {
        const row = result.data[i];

        // Skip empty rows
        if (!row.student_id && !row.question_id) continue;

        // Validate row data
        if (!row.student_id) {
            errors.push(`Row ${i + 1}: Missing student_id`);
            continue;
        }
        if (!row.question_id) {
            errors.push(`Row ${i + 1}: Missing question_id`);
            continue;
        }
        if (typeof row.score !== "number") {
            errors.push(`Row ${i + 1}: Invalid score (must be a number)`);
            continue;
        }
        if (typeof row.max_score !== "number" || row.max_score <= 0) {
            errors.push(`Row ${i + 1}: Invalid max_score (must be a positive number)`);
            continue;
        }

        csvData.push({
            student_id: String(row.student_id),
            student_name: row.student_name ? String(row.student_name) : undefined,
            question_id: String(row.question_id),
            topic_tag: row.topic_tag ? String(row.topic_tag) : undefined,
            score: row.score,
            max_score: row.max_score,
            timestamp: row.timestamp ? String(row.timestamp) : undefined,
            item_text: row.item_text ? String(row.item_text) : undefined,
        });
    }

    return {
        data: csvData,
        errors,
        valid: errors.length === 0 && csvData.length > 0,
    };
}

/**
 * Validates CSV file before parsing
 */
export function validateCSVFile(file: File): string | null {
    // Check file type
    if (!file.name.endsWith(".csv")) {
        return "File must be a CSV file";
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
        return "File size must be less than 10MB";
    }

    return null;
}

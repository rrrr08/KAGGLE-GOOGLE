import { NextRequest, NextResponse } from "next/server";
import { Orchestrator } from "@/lib/orchestrator/workflow";
import { parseCSV } from "@/lib/utils/csv-parser";
import { prisma } from "@/lib/db/client";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const file = formData.get("file") as File;
        const classId = formData.get("class_id") as string;
        const teacherId = formData.get("teacher_id") as string;
        const initialLesson = formData.get("initial_lesson") as string;

        // Validate inputs
        // Validate inputs
        console.log("Analysis Run Inputs:", {
            fileName: file?.name,
            fileSize: file?.size,
            classId,
            teacherId,
            initialLessonLength: initialLesson?.length
        });

        if (!file) {
            console.log("Error: No file provided");
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }
        if (!classId) {
            console.log("Error: class_id is required");
            return NextResponse.json({ error: "class_id is required" }, { status: 400 });
        }
        if (!teacherId) {
            console.log("Error: teacher_id is required");
            return NextResponse.json({ error: "teacher_id is required" }, { status: 400 });
        }
        if (!initialLesson) {
            console.log("Error: initial_lesson is required");
            return NextResponse.json({ error: "initial_lesson is required" }, { status: 400 });
        }

        // Read file content
        const fileContent = await file.text();

        // Parse CSV
        const parseResult = parseCSV(fileContent);

        if (!parseResult.valid) {
            console.log("CSV Validation Errors:", parseResult.errors);
            return NextResponse.json(
                { error: "Invalid CSV file", details: parseResult.errors },
                { status: 400 }
            );
        }

        // Run the workflow
        const orchestrator = new Orchestrator();
        const result = await orchestrator.runWorkflow(
            parseResult.data,
            initialLesson,
            classId,
            teacherId
        );

        // Save result to database
        await prisma.analysisRun.create({
            data: {
                runId: result.run_id,
                classId: classId,
                teacherId: teacherId,
                initialLesson: initialLesson,
                finalDraft: result.final_draft,
                agentAOutputJson: JSON.stringify(result.agent_a_summary),
                historyJson: JSON.stringify(result.history),
                finalScore: result.final_score,
                passed: result.passed,
                iterations: result.history.length,
            },
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error("Analysis run error:", error);
        return NextResponse.json(
            { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

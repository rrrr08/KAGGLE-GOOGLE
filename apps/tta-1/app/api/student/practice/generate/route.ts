import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";
import { generatePracticeMaterial } from "@/lib/ai/practice-generator";
import { z } from "zod";

const generateSchema = z.object({
    studentId: z.string(),
    topic: z.string(),
    difficulty: z.enum(["easy", "medium", "hard"]),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        const body = await request.json();
        const data = generateSchema.parse(body);

        // Get student profile to verify ownership and get class info
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: data.studentId },
            include: {
                student: {
                    include: {
                        class: true,
                    },
                },
            },
        });

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Verify ownership
        if (studentProfile.userId !== user.userId) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 403 }
            );
        }

        // Get student's weakness context for this topic
        const skills = JSON.parse(studentProfile.student.skillsJson || "{}");
        const topicSkill = skills[data.topic];
        const weaknessContext = topicSkill
            ? `Student's current average score: ${topicSkill.avg || 0}%. Common mistakes: ${topicSkill.notes || "None recorded"}`
            : undefined;

        // Generate practice material using AI
        const content = await generatePracticeMaterial(
            data.topic,
            data.difficulty,
            weaknessContext
        );

        // Save to database
        const material = await prisma.practiceMaterial.create({
            data: {
                title: content.title,
                topic: data.topic,
                difficulty: data.difficulty,
                contentMarkdown: `# ${content.title}\n\n${content.introduction}\n\n## Key Concepts\n\n${content.keyConceptsMarkdown}\n\n## Examples\n\n${content.examples.map((ex, i) => `### Example ${i + 1}\n\n${ex}`).join("\n\n")}`,
                exercisesJson: JSON.stringify(content.exercises),
                classId: studentProfile.student.classId,
                generatedById: user.userId,
            },
        });

        return NextResponse.json({
            materialId: material.id,
            title: content.title,
            contentMarkdown: material.contentMarkdown,
            exercises: content.exercises,
        });
    } catch (error: any) {
        console.error("Practice generation error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to generate practice material" },
            { status: 500 }
        );
    }
}

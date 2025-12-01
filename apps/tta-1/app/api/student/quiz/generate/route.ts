import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";
import { generateQuiz } from "@/lib/ai/quiz-generator";
import { z } from "zod";

const generateSchema = z.object({
    topic: z.string(),
    numQuestions: z.number().min(3).max(20).default(5),
    difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        const body = await request.json();
        const data = generateSchema.parse(body);

        // Get student profile using authenticated user's ID
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.userId },
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

        // Get student's weakness context for this topic
        const skills = JSON.parse(studentProfile.student.skillsJson || "{}");
        const topicSkill = skills[data.topic];
        const weaknessContext = topicSkill
            ? `Student's current average score: ${topicSkill.avg || 0}%. Focus on areas where the student struggles.`
            : undefined;

        // Generate quiz using AI
        const quizContent = await generateQuiz(
            data.topic,
            data.numQuestions,
            data.difficulty,
            weaknessContext
        );

        // Save to database
        const quiz = await prisma.quiz.create({
            data: {
                title: quizContent.title,
                topic: data.topic,
                difficulty: data.difficulty,
                questionsJson: JSON.stringify(quizContent.questions),
                classId: studentProfile.student.classId,
                createdById: user.userId,
            },
        });

        // Return quiz without answers (for taking the quiz)
        const questionsWithoutAnswers = quizContent.questions.map((q) => ({
            id: q.id,
            question: q.question,
            options: q.options,
        }));

        return NextResponse.json({
            quizId: quiz.id,
            title: quizContent.title,
            topic: data.topic,
            questions: questionsWithoutAnswers,
        });
    } catch (error: any) {
        console.error("Quiz generation error:", error);

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
            { error: "Failed to generate quiz" },
            { status: 500 }
        );
    }
}

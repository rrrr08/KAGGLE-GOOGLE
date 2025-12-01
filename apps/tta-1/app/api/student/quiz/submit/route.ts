import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";
import { z } from "zod";

const submitSchema = z.object({
    quizId: z.string(),
    studentId: z.string(),
    answers: z.array(
        z.object({
            questionId: z.string(),
            answer: z.number().min(0).max(3),
        })
    ),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        const body = await request.json();
        const data = submitSchema.parse(body);

        // Get student profile to verify ownership
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { id: data.studentId },
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

        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: data.quizId },
        });

        if (!quiz) {
            return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
        }

        // Parse questions and grade answers
        const questions = JSON.parse(quiz.questionsJson);
        let score = 0;
        const maxScore = questions.length;
        const feedback = [];

        for (const question of questions) {
            const studentAnswer = data.answers.find((a) => a.questionId === question.id);
            const isCorrect = studentAnswer
                ? studentAnswer.answer === question.correctAnswer
                : false;

            if (isCorrect) {
                score++;
            }

            feedback.push({
                questionId: question.id,
                question: question.question,
                studentAnswer: studentAnswer?.answer ?? -1,
                correctAnswer: question.correctAnswer,
                correct: isCorrect,
                explanation: question.explanation,
            });
        }

        // Save quiz attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId: data.quizId,
                studentId: data.studentId,
                answersJson: JSON.stringify(data.answers),
                score,
                maxScore,
                completedAt: new Date(),
            },
        });

        const percentage = (score / maxScore) * 100;

        // Update student skills tracking for "Areas of Improvement"
        const student = await prisma.student.findUnique({
            where: { id: studentProfile.studentId },
        });

        if (student) {
            const skills = JSON.parse(student.skillsJson || "{}");
            const topic = quiz.topic;

            // Update or create skill entry for this topic
            if (!skills[topic]) {
                skills[topic] = {
                    avg: percentage,
                    attempts: 1,
                    scores: [percentage],
                };
            } else {
                skills[topic].attempts += 1;
                skills[topic].scores = skills[topic].scores || [];
                skills[topic].scores.push(percentage);

                // Calculate new average
                const totalScore = skills[topic].scores.reduce((sum: number, s: number) => sum + s, 0);
                skills[topic].avg = totalScore / skills[topic].scores.length;
            }

            // Update student record
            await prisma.student.update({
                where: { id: studentProfile.studentId },
                data: {
                    skillsJson: JSON.stringify(skills),
                },
            });
        }

        return NextResponse.json({
            attemptId: attempt.id,
            score,
            maxScore,
            percentage,
            feedback,
        });
    } catch (error: any) {
        console.error("Quiz submission error:", error);

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
            { error: "Failed to submit quiz" },
            { status: 500 }
        );
    }
}

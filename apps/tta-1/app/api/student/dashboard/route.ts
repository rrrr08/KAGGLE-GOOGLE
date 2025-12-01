import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        // Get student profile with related data
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.userId },
            include: {
                student: {
                    include: {
                        class: {
                            include: {
                                teacher: {
                                    select: { name: true, email: true },
                                },
                            },
                        },
                    },
                },
                quizAttempts: {
                    include: {
                        quiz: true,
                    },
                    orderBy: {
                        completedAt: "desc",
                    },
                    take: 5,
                },
                assignments: {
                    where: {
                        completed: false,
                    },
                    include: {
                        material: true,
                    },
                    orderBy: {
                        dueDate: "asc",
                    },
                    take: 5,
                },
            },
        });

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Verify the authenticated user owns this profile
        if (studentProfile.userId !== user.userId) {
            return NextResponse.json(
                { error: "Unauthorized access to this profile" },
                { status: 403 }
            );
        }

        // Parse student skills to identify weak topics
        const skills = JSON.parse(studentProfile.student.skillsJson || "{}");
        const weakTopics = Object.entries(skills)
            .map(([topic, data]: [string, any]) => ({
                topic,
                avgScore: data.avg || 0,
                attempts: data.attempts || 0,
            }))
            .filter((t) => t.avgScore < 70)
            .sort((a, b) => a.avgScore - b.avgScore)
            .slice(0, 5);

        // Get practice materials for weak topics
        const suggestedPractice = await prisma.practiceMaterial.findMany({
            where: {
                classId: studentProfile.student.classId,
                topic: {
                    in: weakTopics.map((t) => t.topic),
                },
            },
            select: {
                id: true,
                title: true,
                topic: true,
                difficulty: true,
            },
            take: 5,
        });

        // Format recent quiz attempts
        const recentQuizzes = studentProfile.quizAttempts.map((attempt) => ({
            title: attempt.quiz.title,
            score: attempt.score,
            maxScore: attempt.maxScore,
            percentage: (attempt.score / attempt.maxScore) * 100,
            date: attempt.completedAt?.toISOString() || attempt.startedAt.toISOString(),
        }));

        // Format assignments
        const upcomingAssignments = studentProfile.assignments.map((assignment) => ({
            id: assignment.id,
            title: assignment.title,
            description: assignment.description,
            dueDate: assignment.dueDate?.toISOString(),
            materialTitle: assignment.material?.title,
        }));

        return NextResponse.json({
            student: {
                name: studentProfile.student.name,
                grade: studentProfile.grade,
                classId: studentProfile.student.classId,
                className: studentProfile.student.class.name,
                teacherName: studentProfile.student.class.teacher.name,
            },
            recommendations: {
                weakTopics,
                suggestedPractice,
            },
            recentProgress: {
                quizzes: recentQuizzes,
                assignments: upcomingAssignments,
            },
            upcomingAssignments,
        });
    } catch (error: any) {
        console.error("Dashboard error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

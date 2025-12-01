import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        const { searchParams } = new URL(request.url);
        // const studentId = searchParams.get("studentId");
        const timeRange = searchParams.get("timeRange") || "30d";



        // Get student profile to verify ownership
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.userId },
            include: {
                student: true,
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

        // Calculate date range
        const days = parseInt(timeRange.replace("d", ""));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Get quiz attempts in time range
        const quizAttempts = await prisma.quizAttempt.findMany({
            where: {
                studentId: studentProfile.id,
                completedAt: {
                    gte: startDate,
                },
            },
            include: {
                quiz: true,
            },
            orderBy: {
                completedAt: "asc",
            },
        });

        // Calculate overall progress
        const totalAttempts = quizAttempts.length;
        const averageScore =
            totalAttempts > 0
                ? quizAttempts.reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) /
                totalAttempts
                : 0;

        // Calculate improvement rate (compare first half vs second half)
        let improvementRate = 0;
        if (totalAttempts >= 4) {
            const midPoint = Math.floor(totalAttempts / 2);
            const firstHalfAvg =
                quizAttempts
                    .slice(0, midPoint)
                    .reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) / midPoint;
            const secondHalfAvg =
                quizAttempts
                    .slice(midPoint)
                    .reduce((sum, a) => sum + (a.score / a.maxScore) * 100, 0) /
                (totalAttempts - midPoint);
            improvementRate = secondHalfAvg - firstHalfAvg;
        }

        // Group by topic for topic breakdown
        const topicMap = new Map<string, { scores: number[]; dates: Date[] }>();
        for (const attempt of quizAttempts) {
            const topic = attempt.quiz.topic;
            if (!topicMap.has(topic)) {
                topicMap.set(topic, { scores: [], dates: [] });
            }
            const data = topicMap.get(topic)!;
            data.scores.push((attempt.score / attempt.maxScore) * 100);
            data.dates.push(attempt.completedAt || attempt.startedAt);
        }

        // Calculate topic breakdown with trends
        const topicBreakdown = Array.from(topicMap.entries()).map(
            ([topic, data]) => {
                const currentScore = data.scores[data.scores.length - 1];
                const previousScore =
                    data.scores.length > 1
                        ? data.scores.reduce((sum, s) => sum + s, 0) / (data.scores.length - 1)
                        : currentScore;

                let trend: "improving" | "stable" | "declining" = "stable";
                const diff = currentScore - previousScore;
                if (diff > 5) trend = "improving";
                else if (diff < -5) trend = "declining";

                return {
                    topic,
                    currentScore,
                    previousScore,
                    trend,
                    attempts: data.scores.length,
                };
            }
        );

        // Identify topics that improved and need work
        const topicsImproved = topicBreakdown
            .filter((t) => t.trend === "improving")
            .map((t) => t.topic);
        const topicsNeedWork = topicBreakdown
            .filter((t) => t.currentScore < 70)
            .map((t) => t.topic);

        // Create time series data (group by date)
        const dateMap = new Map<string, { scores: number[]; count: number }>();
        for (const attempt of quizAttempts) {
            const date = (attempt.completedAt || attempt.startedAt)
                .toISOString()
                .split("T")[0];
            if (!dateMap.has(date)) {
                dateMap.set(date, { scores: [], count: 0 });
            }
            const data = dateMap.get(date)!;
            data.scores.push((attempt.score / attempt.maxScore) * 100);
            data.count++;
        }

        const timeSeriesData = Array.from(dateMap.entries())
            .map(([date, data]) => ({
                date,
                avgScore: data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length,
                quizzesTaken: data.count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        return NextResponse.json({
            overallProgress: {
                averageScore: Math.round(averageScore * 10) / 10,
                improvementRate: Math.round(improvementRate * 10) / 10,
                topicsImproved,
                topicsNeedWork,
                totalQuizzesTaken: totalAttempts,
            },
            timeSeriesData,
            topicBreakdown: topicBreakdown.sort((a, b) => b.currentScore - a.currentScore),
        });
    } catch (error: any) {
        console.error("Progress tracking error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

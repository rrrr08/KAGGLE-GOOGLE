"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ProgressData {
    overallProgress: {
        averageScore: number;
        improvementRate: number;
        topicsImproved: string[];
        topicsNeedWork: string[];
        totalQuizzesTaken: number;
    };
    timeSeriesData: Array<{
        date: string;
        avgScore: number;
        quizzesTaken: number;
    }>;
    topicBreakdown: Array<{
        topic: string;
        currentScore: number;
        previousScore: number;
        trend: "improving" | "stable" | "declining";
        attempts: number;
    }>;
}

export default function ProgressPage() {
    const router = useRouter();
    const [data, setData] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("30d");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            router.push("/auth");
            return;
        }
        fetchProgressData();
    }, [timeRange]);

    const fetchProgressData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                `/api/student/progress?timeRange=${timeRange}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch progress data");
            }

            const progressData = await response.json();
            setData(progressData);
        } catch (error) {
            console.error("Progress error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your progress...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Failed to load progress data</p>
            </div>
        );
    }

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "improving":
                return <TrendingUp className="h-4 w-4 text-green-500" />;
            case "declining":
                return <TrendingDown className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto max-w-7xl py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/student/dashboard")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Progress</h1>
                        <p className="text-muted-foreground">Track your learning journey</p>
                    </div>
                    <div className="flex gap-2">
                        {["7d", "30d", "90d"].map((range) => (
                            <Button
                                key={range}
                                variant={timeRange === range ? "default" : "outline"}
                                size="sm"
                                onClick={() => setTimeRange(range)}
                            >
                                {range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "90 Days"}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Overall Stats */}
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Average Score</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{data.overallProgress.averageScore}%</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Improvement Rate</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <div className="text-3xl font-bold">
                                    {data.overallProgress.improvementRate > 0 ? "+" : ""}
                                    {data.overallProgress.improvementRate}%
                                </div>
                                {data.overallProgress.improvementRate > 0 ? (
                                    <TrendingUp className="h-6 w-6 text-green-500" />
                                ) : data.overallProgress.improvementRate < 0 ? (
                                    <TrendingDown className="h-6 w-6 text-red-500" />
                                ) : (
                                    <Minus className="h-6 w-6 text-gray-500" />
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Topics Improved</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {data.overallProgress.topicsImproved.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardDescription>Quizzes Taken</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">
                                {data.overallProgress.totalQuizzesTaken}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Score Trend Chart */}
                {data.timeSeriesData.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Score Trend Over Time</CardTitle>
                            <CardDescription>Your average quiz scores</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.timeSeriesData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    />
                                    <YAxis domain={[0, 100]} />
                                    <Tooltip
                                        labelFormatter={(date) => new Date(date).toLocaleDateString()}
                                        formatter={(value: number) => [`${value.toFixed(1)}%`, "Score"]}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="avgScore"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={2}
                                        name="Average Score"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                )}

                {/* Topic Breakdown */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Topic Performance</CardTitle>
                        <CardDescription>How you're doing in each topic</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.topicBreakdown.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={data.topicBreakdown}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="topic" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                        <Legend />
                                        <Bar dataKey="currentScore" fill="hsl(var(--primary))" name="Current Score" />
                                        <Bar dataKey="previousScore" fill="hsl(var(--muted))" name="Previous Score" />
                                    </BarChart>
                                </ResponsiveContainer>

                                <div className="mt-6 space-y-3">
                                    {data.topicBreakdown.map((topic) => (
                                        <div
                                            key={topic.topic}
                                            className="flex items-center justify-between p-4 rounded-lg border"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getTrendIcon(topic.trend)}
                                                <div>
                                                    <p className="font-medium">{topic.topic}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {topic.attempts} attempt{topic.attempts !== 1 ? "s" : ""}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold">{Math.round(topic.currentScore)}%</p>
                                                <Badge variant={topic.trend === "improving" ? "default" : topic.trend === "declining" ? "destructive" : "secondary"}>
                                                    {topic.trend}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p className="text-center text-muted-foreground py-8">
                                No quiz data available yet. Take some quizzes to see your performance!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

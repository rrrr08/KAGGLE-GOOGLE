"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
    BookOpen,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    Sparkles,
    LogOut,
    BarChart3,
} from "lucide-react";

interface DashboardData {
    student: {
        name: string;
        grade: string;
        className: string;
        teacherName: string;
    };
    recommendations: {
        weakTopics: Array<{ topic: string; avgScore: number; attempts: number }>;
        suggestedPractice: Array<{ id: string; title: string; topic: string; difficulty: string }>;
    };
    recentProgress: {
        quizzes: Array<{ title: string; score: number; maxScore: number; percentage: number; date: string }>;
        assignments: Array<{ id: string; title: string; description: string; dueDate?: string }>;
    };
    upcomingAssignments: Array<{ id: string; title: string; dueDate?: string }>;
}

export default function StudentDashboard() {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            router.push("/auth");
            return;
        }

        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/student/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 403) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                router.push("/auth");
                return;
            }

            if (!response.ok) {
                throw new Error("Failed to fetch dashboard data");
            }

            const dashboardData = await response.json();
            setData(dashboardData);
        } catch (error) {
            console.error("Dashboard error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth");
    };

    const handleGeneratePractice = async (topic: string) => {
        router.push(`/student/practice/new?topic=${encodeURIComponent(topic)}`);
    };

    const handleGenerateQuiz = async (topic: string) => {
        router.push(`/student/quiz/new?topic=${encodeURIComponent(topic)}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-muted-foreground">Failed to load dashboard</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Background */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">Student Portal</h1>
                                <p className="text-xs text-muted-foreground">{data.student.className}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm" onClick={() => router.push("/student/progress")}>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                My Progress
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {/* Welcome Section */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">Welcome back, {data.student.name}! 👋</h2>
                        <p className="text-muted-foreground">
                            Teacher: {data.student.teacherName} • Grade: {data.student.grade || "Not specified"}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => router.push("/student/assignments")} size="lg" variant="outline" className="hidden sm:flex">
                            <BookOpen className="mr-2 h-4 w-4" />
                            My Assignments
                        </Button>
                        <Button onClick={() => router.push("/student/quiz/new")} size="lg" className="hidden sm:flex">
                            <Sparkles className="mr-2 h-4 w-4" />
                            Start New Quiz
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Weak Topics Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5 text-orange-500" />
                                Areas to Improve
                            </CardTitle>
                            <CardDescription>
                                Topics where you can focus your practice
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {data.recommendations.weakTopics.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Great job! No weak areas identified yet.
                                </p>
                            ) : (
                                data.recommendations.weakTopics.map((topic) => (
                                    <div key={topic.topic} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium">{topic.topic}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {topic.attempts} attempt{topic.attempts !== 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium">{Math.round(topic.avgScore)}%</span>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleGeneratePractice(topic.topic)}
                                                    >
                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                        Practice
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleGenerateQuiz(topic.topic)}
                                                    >
                                                        Take Quiz
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Progress value={topic.avgScore} className="h-2" />
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Quizzes Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-green-500" />
                                Recent Quizzes
                            </CardTitle>
                            <CardDescription>Your latest quiz scores</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {data.recentProgress.quizzes.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No quizzes taken yet. Start practicing!
                                </p>
                            ) : (
                                data.recentProgress.quizzes.map((quiz, idx) => (
                                    <div key={idx} className="flex items-center justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{quiz.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(quiz.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={quiz.percentage >= 70 ? "default" : "destructive"}
                                            className="ml-2"
                                        >
                                            {Math.round(quiz.percentage)}%
                                        </Badge>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Upcoming Assignments Card */}
                    <Card className="md:col-span-2 lg:col-span-3">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-blue-500" />
                                Upcoming Assignments
                            </CardTitle>
                            <CardDescription>Tasks assigned by your teacher</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {data.upcomingAssignments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No upcoming assignments. You're all caught up!
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {data.upcomingAssignments.map((assignment) => (
                                        <div
                                            key={assignment.id}
                                            className="flex items-center justify-between p-4 rounded-lg border bg-card"
                                        >
                                            <div>
                                                <p className="font-medium">{assignment.title}</p>
                                                {assignment.dueDate && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <Button size="sm" onClick={() => router.push("/student/assignments")}>View Assignment</Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Suggested Practice Materials */}
                    {data.recommendations.suggestedPractice.length > 0 && (
                        <Card className="md:col-span-2 lg:col-span-3">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-purple-500" />
                                    Recommended Practice
                                </CardTitle>
                                <CardDescription>
                                    AI-generated materials tailored to your needs
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {data.recommendations.suggestedPractice.map((material) => (
                                        <div
                                            key={material.id}
                                            className="p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                                            onClick={() => router.push(`/student/practice/${material.id}`)}
                                        >
                                            <p className="font-medium mb-1">{material.title}</p>
                                            <p className="text-sm text-muted-foreground mb-2">{material.topic}</p>
                                            <Badge variant="outline">{material.difficulty}</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

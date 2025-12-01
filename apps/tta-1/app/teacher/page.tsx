"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultsViewer } from "@/components/dashboard/ResultsViewer";
import { ClassManagement } from "@/components/teacher/ClassManagement";
import { AssignmentManager } from "@/components/teacher/AssignmentManager";
import { Button } from "@/components/ui/button";
import { BookOpen, Sparkles, LogOut } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import type { WorkflowResult } from "@/types/agent";

export default function TeacherPage() {
    const router = useRouter();
    const [result, setResult] = useState<WorkflowResult | null>(null);
    const [user, setUser] = useState<any>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            router.push("/auth");
            return;
        }

        const userData = JSON.parse(userStr);
        if (userData.role !== "TEACHER" && userData.role !== "ADMIN") {
            router.push("/auth");
            return;
        }

        setUser(userData);
    }, [router]);

    const handleAnalysisComplete = (data: WorkflowResult) => {
        setResult(data);
    };

    const handleReset = () => {
        setResult(null);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Ambient Background Gradients */}
            <div className="fixed inset-0 -z-10 h-full w-full bg-background">
                <div className="absolute top-0 z-[-2] h-screen w-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                <div className="absolute bottom-0 left-0 z-[-2] h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute bottom-0 right-0 z-[-2] h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px]" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight">TTA-1</h1>
                                <p className="text-xs font-medium text-muted-foreground">Teacher's Assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-muted-foreground">
                                Welcome, <span className="font-medium text-foreground">{user.name}</span>
                            </p>
                            <ModeToggle />
                            <Button variant="ghost" size="sm" onClick={handleLogout}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="mx-auto max-w-4xl space-y-8 mb-12">
                    <ClassManagement onClassCreated={() => setRefreshTrigger(prev => prev + 1)} />
                    <AssignmentManager refreshTrigger={refreshTrigger} />
                </div>

                {!result ? (
                    <div className="mx-auto max-w-4xl space-y-12">
                        {/* Hero Section */}
                        <div className="relative text-center">
                            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-5xl font-bold tracking-tight text-transparent sm:text-6xl">
                                AI-Powered Lesson <br /> Enhancement
                            </h2>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                                Upload your student performance data and let our advanced AI agents analyze trends, identify weaknesses, and automatically rewrite your lesson plans to target specific learning gaps.
                            </p>
                        </div>

                        {/* Form Container */}
                        <div className="relative rounded-2xl border border-border/50 bg-card/50 p-1 shadow-2xl backdrop-blur-sm ring-1 ring-white/10 dark:ring-black/10">
                            <div className="rounded-xl bg-card p-6 shadow-sm sm:p-10">
                                <AnalysisForm onAnalysisComplete={handleAnalysisComplete} teacherId={user.id} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mx-auto max-w-7xl space-y-8">
                        <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight">Analysis Results</h2>
                                <p className="text-muted-foreground">AI-generated insights and improvements</p>
                            </div>
                            <Button onClick={handleReset} variant="outline" size="lg" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                Start New Analysis
                            </Button>
                        </div>
                        <ResultsViewer result={result} />
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-border/40 bg-background/50 py-8 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Powered by <span className="font-semibold text-foreground">Google Gemini AI</span> • Built with Next.js & TypeScript
                    </p>
                </div>
            </footer>
        </div>
    );
}

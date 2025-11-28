"use client";

import { useState } from "react";
import { CSVUploader } from "@/components/upload/CSVUploader";
import { ResultsViewer } from "@/components/dashboard/ResultsViewer";
import { LessonContentInput } from "@/components/lesson/LessonContentInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, BookOpen } from "lucide-react";
import type { WorkflowResult } from "@/types/agent";

export default function HomePage() {
    const [file, setFile] = useState<File | null>(null);
    const [classId, setClassId] = useState("7A");
    const [teacherId, setTeacherId] = useState("T1");
    const [initialLesson, setInitialLesson] = useState(
        "Today we will learn about solving equations.\n\nAn equation is a mathematical statement that two expressions are equal.\n\nExample: x + 5 = 10\n\nTo solve, subtract 5 from both sides: x = 5"
    );
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<WorkflowResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!file) {
            setError("Please upload a CSV file");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("class_id", classId);
            formData.append("teacher_id", teacherId);
            formData.append("initial_lesson", initialLesson);

            const response = await fetch("/api/analysis/run", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setResult(null);
        setError(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
            {/* Header */}
            <header className="border-b bg-white/50 backdrop-blur-sm dark:bg-gray-900/50">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 p-2">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">TTA-1</h1>
                            <p className="text-sm text-muted-foreground">The Teacher's Teacher Assistant</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {!result ? (
                    <div className="mx-auto max-w-4xl space-y-6">
                        {/* Hero Section */}
                        <div className="text-center">
                            <h2 className="text-4xl font-bold tracking-tight">
                                AI-Powered Lesson Enhancement
                            </h2>
                            <p className="mt-3 text-lg text-muted-foreground">
                                Upload student data and let AI improve your teaching materials automatically
                            </p>
                        </div>

                        {/* Upload Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Step 1: Upload Student Data</CardTitle>
                                <CardDescription>
                                    CSV file with student performance data
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <CSVUploader
                                    onFileSelect={setFile}
                                    selectedFile={file}
                                    onClear={() => setFile(null)}
                                />
                            </CardContent>
                        </Card>

                        {/* Class Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Step 2: Class Information</CardTitle>
                                <CardDescription>Identify your class and teacher ID</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Class ID</label>
                                        <input
                                            type="text"
                                            value={classId}
                                            onChange={(e) => setClassId(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="e.g., 7A"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium">Teacher ID</label>
                                        <input
                                            type="text"
                                            value={teacherId}
                                            onChange={(e) => setTeacherId(e.target.value)}
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                            placeholder="e.g., T1"
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Lesson Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Step 3: Initial Lesson Content</CardTitle>
                                <CardDescription>
                                    Provide your lesson in any format: type it, upload a file, or fetch from URL
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LessonContentInput
                                    value={initialLesson}
                                    onChange={setInitialLesson}
                                />
                            </CardContent>
                        </Card>

                        {/* Error Display */}
                        {error && (
                            <Card className="border-red-500 bg-red-50 dark:bg-red-950">
                                <CardContent className="p-4">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Analyze Button */}
                        <Button
                            onClick={handleAnalyze}
                            disabled={loading || !file}
                            size="lg"
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing & Improving Lesson...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-5 w-5" />
                                    Analyze & Improve Lesson
                                </>
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="mx-auto max-w-6xl space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold">Analysis Results</h2>
                            <Button onClick={handleReset} variant="outline">
                                Start New Analysis
                            </Button>
                        </div>
                        <ResultsViewer result={result} />
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-12 border-t py-6 text-center text-sm text-muted-foreground">
                <p>Powered by Google Gemini AI • Built with Next.js & TypeScript</p>
            </footer>
        </div>
    );
}

"use client";

import { useState } from "react";
import { AnalysisForm } from "@/components/analysis-form";
import { ResultsViewer } from "@/components/dashboard/ResultsViewer";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import type { WorkflowResult } from "@/types/agent";

export default function HomePage() {
    const [result, setResult] = useState<WorkflowResult | null>(null);

    const handleAnalysisComplete = (data: WorkflowResult) => {
        setResult(data);
    };

    const handleReset = () => {
        setResult(null);
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
                            <h2 className="text-4xl font-bold tracking-tight">AI-Powered Lesson Enhancement</h2>
                            <p className="mt-3 text-lg text-muted-foreground">
                                Upload student data and let AI improve your teaching materials automatically
                            </p>
                        </div>

                        <AnalysisForm onAnalysisComplete={handleAnalysisComplete} />
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

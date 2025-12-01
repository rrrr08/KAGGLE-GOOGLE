"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, CheckCircle2, Lightbulb } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Exercise {
    question: string;
    hint: string;
    answer: string;
    explanation: string;
}

interface PracticeMaterial {
    materialId: string;
    title: string;
    contentMarkdown: string;
    exercises: Exercise[];
}

function PracticePageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [material, setMaterial] = useState<PracticeMaterial | null>(null);
    const [showHints, setShowHints] = useState<Record<number, boolean>>({});
    const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (topic) {
            generatePractice();
        }
    }, [topic]);

    const generatePractice = async () => {
        setGenerating(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = localStorage.getItem("token");

            const response = await fetch("/api/student/practice/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    studentId: user.studentId,
                    topic,
                    difficulty: "medium",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate practice material");
            }

            const data = await response.json();
            setMaterial(data);
        } catch (error) {
            console.error("Practice generation error:", error);
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const toggleHint = (index: number) => {
        setShowHints({ ...showHints, [index]: !showHints[index] });
    };

    const toggleAnswer = (index: number) => {
        setShowAnswers({ ...showAnswers, [index]: !showAnswers[index] });
    };

    if (generating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">Generating personalized practice material...</p>
                    <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    if (!material) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Failed to load practice material</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto max-w-4xl py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/student/dashboard")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                {/* Content Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="text-2xl">{material.title}</CardTitle>
                        <CardDescription>AI-generated practice material</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                            <ReactMarkdown>{material.contentMarkdown}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>

                {/* Exercises Section */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Practice Exercises</h2>
                    <p className="text-muted-foreground">
                        Try solving these problems on your own. Use hints if you get stuck!
                    </p>

                    {material.exercises.map((exercise, idx) => (
                        <Card key={idx}>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                                        {idx + 1}
                                    </span>
                                    Exercise {idx + 1}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-base font-medium mb-2">Question:</p>
                                    <p className="text-muted-foreground">{exercise.question}</p>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleHint(idx)}
                                    >
                                        <Lightbulb className="h-4 w-4 mr-2" />
                                        {showHints[idx] ? "Hide Hint" : "Show Hint"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleAnswer(idx)}
                                    >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        {showAnswers[idx] ? "Hide Answer" : "Show Answer"}
                                    </Button>
                                </div>

                                {showHints[idx] && (
                                    <Alert>
                                        <Lightbulb className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Hint:</strong> {exercise.hint}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                {showAnswers[idx] && (
                                    <div className="space-y-3">
                                        <Alert>
                                            <CheckCircle2 className="h-4 w-4" />
                                            <AlertDescription>
                                                <strong>Answer:</strong> {exercise.answer}
                                            </AlertDescription>
                                        </Alert>
                                        <Alert>
                                            <AlertDescription>
                                                <strong>Explanation:</strong> {exercise.explanation}
                                            </AlertDescription>
                                        </Alert>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 flex gap-4">
                    <Button onClick={() => router.push("/student/dashboard")} className="flex-1">
                        Back to Dashboard
                    </Button>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="outline"
                        className="flex-1"
                    >
                        Generate New Material
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function PracticePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <PracticePageContent />
        </Suspense>
    );
}

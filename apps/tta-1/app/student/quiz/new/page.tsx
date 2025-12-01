"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";

interface Question {
    id: string;
    question: string;
    options: string[];
}

interface QuizData {
    quizId: string;
    title: string;
    topic: string;
    questions: Question[];
}

interface FeedbackItem {
    questionId: string;
    question: string;
    studentAnswer: number;
    correctAnswer: number;
    correct: boolean;
    explanation: string;
}

function QuizPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic");

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [quiz, setQuiz] = useState<QuizData | null>(null);
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
    const [score, setScore] = useState({ score: 0, maxScore: 0, percentage: 0 });

    const [manualTopic, setManualTopic] = useState("");

    useEffect(() => {
        if (topic) {
            generateQuiz(topic);
        } else {
            setLoading(false);
        }
    }, [topic]);

    const generateQuiz = async (topicToUse: string) => {
        setGenerating(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = localStorage.getItem("token");

            const response = await fetch("/api/student/quiz/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    topic: topicToUse,
                    numQuestions: 5,
                    difficulty: "medium",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to generate quiz");
            }

            const data = await response.json();
            setQuiz(data);
        } catch (error) {
            console.error("Quiz generation error:", error);
        } finally {
            setGenerating(false);
            setLoading(false);
        }
    };

    const handleManualStart = () => {
        if (manualTopic.trim()) {
            generateQuiz(manualTopic);
        }
    };

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        setAnswers({ ...answers, [questionId]: answerIndex });
    };

    const handleSubmit = async () => {
        if (!quiz) return;

        setLoading(true);
        try {
            const user = JSON.parse(localStorage.getItem("user") || "{}");
            const token = localStorage.getItem("token");

            const answersArray = quiz.questions.map((q) => ({
                questionId: q.id,
                answer: answers[q.id] ?? -1,
            }));

            const response = await fetch("/api/student/quiz/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    quizId: quiz.quizId,
                    studentId: user.studentId,
                    answers: answersArray,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit quiz");
            }

            const result = await response.json();
            setScore(result);
            setFeedback(result.feedback);
            setSubmitted(true);
        } catch (error) {
            console.error("Quiz submission error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (generating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg font-medium">Generating your personalized quiz...</p>
                    <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
                </div>
            </div>
        );
    }

    if (!quiz && !topic) {
        return (
            <div className="min-h-screen bg-background p-4 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Start a New Quiz</CardTitle>
                        <CardDescription>Enter a topic to generate a personalized quiz</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="topic">Topic</Label>
                            <div className="flex gap-2">
                                <input
                                    id="topic"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="e.g. Algebra, Photosynthesis, World War II"
                                    value={manualTopic}
                                    onChange={(e) => setManualTopic(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleManualStart()}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => router.push("/student/dashboard")}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleManualStart}
                                disabled={!manualTopic.trim()}
                            >
                                Start Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Failed to load quiz</p>
            </div>
        );
    }

    if (submitted) {
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

                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="text-2xl">Quiz Results</CardTitle>
                            <CardDescription>{quiz.title}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="text-6xl font-bold mb-4">
                                    {Math.round(score.percentage)}%
                                </div>
                                <p className="text-xl text-muted-foreground mb-2">
                                    {score.score} out of {score.maxScore} correct
                                </p>
                                <Badge
                                    variant={score.percentage >= 70 ? "default" : "destructive"}
                                    className="text-lg px-4 py-1"
                                >
                                    {score.percentage >= 70 ? "Passed" : "Keep Practicing"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Review Your Answers</h3>
                        {feedback.map((item, idx) => (
                            <Card key={item.questionId}>
                                <CardHeader>
                                    <div className="flex items-start gap-3">
                                        {item.correct ? (
                                            <CheckCircle2 className="h-6 w-6 text-green-500 mt-1" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-red-500 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">Question {idx + 1}</CardTitle>
                                            <p className="text-sm text-muted-foreground mt-2">{item.question}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <p className="text-sm font-medium mb-1">Your Answer:</p>
                                        <p
                                            className={`text-sm ${item.correct ? "text-green-600" : "text-red-600"
                                                }`}
                                        >
                                            {item.studentAnswer >= 0
                                                ? String.fromCharCode(65 + item.studentAnswer)
                                                : "Not answered"}
                                        </p>
                                    </div>
                                    {!item.correct && (
                                        <div>
                                            <p className="text-sm font-medium mb-1">Correct Answer:</p>
                                            <p className="text-sm text-green-600">
                                                {String.fromCharCode(65 + item.correctAnswer)}
                                            </p>
                                        </div>
                                    )}
                                    <Alert>
                                        <AlertDescription>{item.explanation}</AlertDescription>
                                    </Alert>
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
                            Take Another Quiz
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const currentQ = quiz.questions[currentQuestion];
    const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
    const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

    return (
        <div className="min-h-screen bg-background p-4">
            <div className="container mx-auto max-w-3xl py-8">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/student/dashboard")}
                    className="mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Button>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <CardTitle>{quiz.title}</CardTitle>
                                <CardDescription>Topic: {quiz.topic}</CardDescription>
                            </div>
                            <Badge variant="outline">
                                {currentQuestion + 1} / {quiz.questions.length}
                            </Badge>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-4">
                                Question {currentQuestion + 1}
                            </h3>
                            <p className="text-base mb-6">{currentQ.question}</p>

                            <RadioGroup
                                value={answers[currentQ.id]?.toString()}
                                onValueChange={(value) =>
                                    handleAnswerSelect(currentQ.id, parseInt(value))
                                }
                            >
                                {currentQ.options.map((option, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent cursor-pointer"
                                    >
                                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                                        <Label
                                            htmlFor={`option-${idx}`}
                                            className="flex-1 cursor-pointer"
                                        >
                                            <span className="font-medium mr-2">
                                                {String.fromCharCode(65 + idx)}.
                                            </span>
                                            {option}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                                disabled={currentQuestion === 0}
                                className="flex-1"
                            >
                                Previous
                            </Button>
                            {currentQuestion < quiz.questions.length - 1 ? (
                                <Button
                                    onClick={() =>
                                        setCurrentQuestion(Math.min(quiz.questions.length - 1, currentQuestion + 1))
                                    }
                                    className="flex-1"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!allAnswered || loading}
                                    className="flex-1"
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Quiz
                                </Button>
                            )}
                        </div>

                        {!allAnswered && currentQuestion === quiz.questions.length - 1 && (
                            <Alert>
                                <AlertDescription>
                                    Please answer all questions before submitting.
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function QuizPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <QuizPageContent />
        </Suspense>
    );
}

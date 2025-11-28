"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Users, Target } from "lucide-react";
import type { WorkflowResult } from "@/types/agent";

interface ResultsViewerProps {
    result: WorkflowResult;
}

export function ResultsViewer({ result }: ResultsViewerProps) {
    const { final_score, passed, agent_a_summary, history, final_draft } = result;

    return (
        <div className="space-y-6">
            {/* Status Banner */}
            <Card className={passed ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {passed ? (
                            <CheckCircle2 className="h-12 w-12 text-green-600" />
                        ) : (
                            <XCircle className="h-12 w-12 text-yellow-600" />
                        )}
                        <div>
                            <h3 className="text-2xl font-bold">
                                {passed ? "Lesson Approved!" : "Needs Improvement"}
                            </h3>
                            <p className="text-muted-foreground">
                                Final Score: <span className="font-semibold">{final_score}/100</span> • {history.length} iterations
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Class Analysis */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Class Analysis
                    </CardTitle>
                    <CardDescription>Insights from student performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Class Average</p>
                            <p className="text-2xl font-bold">{agent_a_summary.class_average.toFixed(1)}%</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">At-Risk Students</p>
                            <p className="text-2xl font-bold text-red-600">{agent_a_summary.at_risk_students.length}</p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <p className="text-sm text-muted-foreground">Topics Analyzed</p>
                            <p className="text-2xl font-bold">{agent_a_summary.weakest_topics.length}</p>
                        </div>
                    </div>

                    {/* Weakest Topics */}
                    <div>
                        <h4 className="mb-3 font-semibold">Weakest Topics</h4>
                        <div className="space-y-2">
                            {agent_a_summary.weakest_topics.slice(0, 3).map((topic, idx) => (
                                <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="flex items-center gap-3">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        <span className="font-medium">{topic.topic}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">{topic.avg.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">
                                            {(topic.pct_below * 100).toFixed(0)}% below threshold
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Iteration History */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Improvement Progress
                    </CardTitle>
                    <CardDescription>How the lesson evolved through iterations</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {history.map((h) => (
                            <div key={h.iter} className="flex items-center gap-4 rounded-lg border p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                                    {h.iter}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">Iteration {h.iter}</p>
                                    <p className="text-sm text-muted-foreground">{h.draft_snippet}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold">{h.score}</p>
                                    <p className="text-xs text-muted-foreground">score</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Final Lesson */}
            <Card>
                <CardHeader>
                    <CardTitle>Final Improved Lesson</CardTitle>
                    <CardDescription>AI-enhanced content ready for classroom use</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg bg-muted p-6">
                        <pre className="whitespace-pre-wrap font-sans text-sm">{final_draft}</pre>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

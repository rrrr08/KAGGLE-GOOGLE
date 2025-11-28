"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analysisFormSchema, type AnalysisFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVUploader } from "@/components/upload/CSVUploader";
import { LessonContentInput } from "@/components/lesson/LessonContentInput";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowResult } from "@/types/agent";

interface AnalysisFormProps {
    onAnalysisComplete: (result: WorkflowResult) => void;
}

export function AnalysisForm({ onAnalysisComplete }: AnalysisFormProps) {
    const [loading, setLoading] = useState(false);

    const form = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisFormSchema),
        defaultValues: {
            classId: "7A",
            teacherId: "T1",
            initialLesson:
                "Today we will learn about solving equations.\n\nAn equation is a mathematical statement that two expressions are equal.\n\nExample: x + 5 = 10\n\nTo solve, subtract 5 from both sides: x = 5",
        },
    });

    const onSubmit = async (data: AnalysisFormValues) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("file", data.file);
            formData.append("class_id", data.classId);
            formData.append("teacher_id", data.teacherId);
            formData.append("initial_lesson", data.initialLesson);

            const response = await fetch("/api/analysis/run", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Analysis failed");
            }

            const result = await response.json();
            onAnalysisComplete(result);
            toast.success("Lesson analysis complete!");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Upload */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 1: Upload Student Data</CardTitle>
                    <CardDescription>CSV file with student performance data</CardDescription>
                </CardHeader>
                <CardContent>
                    <CSVUploader
                        onFileSelect={(file) => form.setValue("file", file, { shouldValidate: true })}
                        selectedFile={form.watch("file")}
                        onClear={() => form.setValue("file", undefined as any, { shouldValidate: true })}
                    />
                    {form.formState.errors.file && (
                        <p className="mt-2 text-sm text-red-500">{form.formState.errors.file.message}</p>
                    )}
                </CardContent>
            </Card>

            {/* Step 2: Class Info */}
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
                                {...form.register("classId")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g., 7A"
                            />
                            {form.formState.errors.classId && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.classId.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Teacher ID</label>
                            <input
                                {...form.register("teacherId")}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                placeholder="e.g., T1"
                            />
                            {form.formState.errors.teacherId && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.teacherId.message}</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Step 3: Lesson Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Step 3: Initial Lesson Content</CardTitle>
                    <CardDescription>
                        Provide your lesson in any format: type it, upload a file, or fetch from URL
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <LessonContentInput
                        value={form.watch("initialLesson")}
                        onChange={(val) => form.setValue("initialLesson", val, { shouldValidate: true })}
                    />
                    {form.formState.errors.initialLesson && (
                        <p className="mt-2 text-sm text-red-500">
                            {form.formState.errors.initialLesson.message}
                        </p>
                    )}
                </CardContent>
            </Card>

            <Button type="submit" disabled={loading} size="lg" className="w-full">
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
        </form>
    );
}

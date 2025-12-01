"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { analysisFormSchema, type AnalysisFormValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CSVUploader } from "@/components/upload/CSVUploader";
import { LessonContentInput } from "@/components/lesson/LessonContentInput";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowResult } from "@/types/agent";

interface ClassData {
    id: string;
    name: string;
}

interface AnalysisFormProps {
    onAnalysisComplete: (result: WorkflowResult) => void;
    teacherId: string;
}

export function AnalysisForm({ onAnalysisComplete, teacherId }: AnalysisFormProps) {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState<ClassData[]>([]);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch("/api/teacher/classes", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (response.ok) {
                    const data = await response.json();
                    setClasses(data.classes);
                }
            } catch (error) {
                console.error("Failed to fetch classes:", error);
            }
        };
        fetchClasses();
    }, []);

    const form = useForm<AnalysisFormValues>({
        resolver: zodResolver(analysisFormSchema),
        defaultValues: {
            classId: "",
            teacherId: teacherId,
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
                const errorMessage = errorData.details
                    ? `${errorData.error}: ${errorData.details.join(", ")}`
                    : errorData.error || "Analysis failed";
                throw new Error(errorMessage);
            }

            const result = await response.json();
            onAnalysisComplete(result);
            toast.success("Lesson analysis complete!");
        } catch (error) {
            console.error("Analysis error:", error);
            toast.error(error instanceof Error ? error.message : "An error occurred", {
                duration: 5000, // Show for longer if there are details
            });
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
                            <label className="mb-2 block text-sm font-medium">Class</label>
                            <Select
                                onValueChange={(value) => form.setValue("classId", value, { shouldValidate: true })}
                                value={form.watch("classId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.classId && (
                                <p className="mt-1 text-sm text-red-500">{form.formState.errors.classId.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Teacher ID</label>
                            <input
                                {...form.register("teacherId")}
                                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                readOnly
                            />
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

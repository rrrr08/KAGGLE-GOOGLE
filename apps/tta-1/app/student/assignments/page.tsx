"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, CheckCircle2, Clock, FileText, Upload, X } from "lucide-react";

interface Assignment {
    id: string;
    title: string;
    description: string;
    dueDate: string | null;
    completed: boolean;
    completedAt: string | null;
    submissionText: string | null;
    attachmentUrl: string | null;
    class: {
        name: string;
    };
}

export default function StudentAssignmentsPage() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submissionDialog, setSubmissionDialog] = useState<{
        open: boolean;
        assignmentId: string | null;
        assignmentTitle: string;
        currentSubmission: string;
        attachmentUrl: string | null;
        file: File | null;
    }>({
        open: false,
        assignmentId: null,
        assignmentTitle: "",
        currentSubmission: "",
        attachmentUrl: null,
        file: null,
    });

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (!userData) {
            router.push("/auth");
            return;
        }
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/student/assignments", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch assignments");
            }

            const data = await response.json();
            setAssignments(data.assignments);
        } catch (error) {
            console.error("Assignments error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleComplete = async (assignmentId: string, completed: boolean) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/student/assignments", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    assignmentId,
                    completed: !completed,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update assignment");
            }

            fetchAssignments();
        } catch (error) {
            console.error("Update error:", error);
        }
    };

    const getDaysUntilDue = (dueDate: string | null) => {
        if (!dueDate) return null;
        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const handleOpenSubmission = (assignment: Assignment) => {
        setSubmissionDialog({
            open: true,
            assignmentId: assignment.id,
            assignmentTitle: assignment.title,
            currentSubmission: assignment.submissionText || "",
            attachmentUrl: assignment.attachmentUrl || null,
            file: null,
        });
    };

    const handleSubmitAssignment = async () => {
        if (!submissionDialog.assignmentId) return;

        try {
            let attachmentUrl = submissionDialog.attachmentUrl;

            // Upload file if selected
            if (submissionDialog.file) {
                const formData = new FormData();
                formData.append("file", submissionDialog.file);

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: formData,
                });

                if (!uploadRes.ok) throw new Error("File upload failed");
                const data = await uploadRes.json();
                attachmentUrl = data.url;
            }

            const token = localStorage.getItem("token");
            const response = await fetch("/api/student/assignments", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    assignmentId: submissionDialog.assignmentId,
                    completed: true,
                    submissionText: submissionDialog.currentSubmission,
                    attachmentUrl,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to submit assignment");
            }

            setSubmissionDialog({
                open: false,
                assignmentId: null,
                assignmentTitle: "",
                currentSubmission: "",
                attachmentUrl: null,
                file: null
            });
            fetchAssignments();
        } catch (error) {
            console.error("Submit error:", error);
            alert("Failed to submit assignment. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading assignments...</p>
                </div>
            </div>
        );
    }

    const pendingAssignments = assignments.filter((a) => !a.completed);
    const completedAssignments = assignments.filter((a) => a.completed);

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

                <div className="mb-8">
                    <h1 className="text-3xl font-bold">My Assignments</h1>
                    <p className="text-muted-foreground">Track and complete your assignments</p>
                </div>

                {/* Pending Assignments */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Pending ({pendingAssignments.length})
                        </CardTitle>
                        <CardDescription>Assignments to complete</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {pendingAssignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No pending assignments. Great job!
                            </p>
                        ) : (
                            pendingAssignments.map((assignment) => {
                                const daysUntilDue = getDaysUntilDue(assignment.dueDate);
                                const isOverdue = daysUntilDue !== null && daysUntilDue < 0;
                                const isDueSoon = daysUntilDue !== null && daysUntilDue <= 3 && daysUntilDue >= 0;

                                return (
                                    <div
                                        key={assignment.id}
                                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                    >
                                        <Checkbox
                                            checked={assignment.completed}
                                            onCheckedChange={() =>
                                                handleToggleComplete(assignment.id, assignment.completed)
                                            }
                                            className="mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold">{assignment.title}</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        {assignment.description}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-2">
                                                        Class: {assignment.class.name}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {assignment.dueDate && (
                                                        <Badge
                                                            variant={isOverdue ? "destructive" : isDueSoon ? "default" : "secondary"}
                                                            className="flex items-center gap-1 whitespace-nowrap"
                                                        >
                                                            <Calendar className="h-3 w-3" />
                                                            {isOverdue
                                                                ? `${Math.abs(daysUntilDue!)} days overdue`
                                                                : daysUntilDue === 0
                                                                    ? "Due today"
                                                                    : `${daysUntilDue} days left`}
                                                        </Badge>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleOpenSubmission(assignment)}
                                                        className="whitespace-nowrap"
                                                    >
                                                        <FileText className="h-3 w-3 mr-1" />
                                                        Submit Work
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Completed Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            Completed ({completedAssignments.length})
                        </CardTitle>
                        <CardDescription>Assignments you've finished</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {completedAssignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No completed assignments yet.
                            </p>
                        ) : (
                            completedAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-start gap-4 p-4 border rounded-lg bg-accent/20"
                                >
                                    <Checkbox
                                        checked={assignment.completed}
                                        onCheckedChange={() =>
                                            handleToggleComplete(assignment.id, assignment.completed)
                                        }
                                        className="mt-1"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold line-through text-muted-foreground">
                                            {assignment.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {assignment.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Completed on{" "}
                                            {new Date(assignment.completedAt!).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Submission Dialog */}
                <Dialog open={submissionDialog.open} onOpenChange={(open) => setSubmissionDialog({ ...submissionDialog, open })}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Submit Assignment</DialogTitle>
                            <DialogDescription>
                                {submissionDialog.assignmentTitle}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label>Your Answer</Label>
                                <Textarea
                                    placeholder="Enter your assignment work here..."
                                    value={submissionDialog.currentSubmission}
                                    onChange={(e) =>
                                        setSubmissionDialog({ ...submissionDialog, currentSubmission: e.target.value })
                                    }
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Attachment (PDF, Word, Image)</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0] || null;
                                            setSubmissionDialog({ ...submissionDialog, file });
                                        }}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    />
                                </div>
                                {(submissionDialog.attachmentUrl || submissionDialog.file) && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded">
                                        <FileText className="h-4 w-4" />
                                        <span>
                                            {submissionDialog.file ? submissionDialog.file.name : "Existing attachment"}
                                        </span>
                                        {submissionDialog.attachmentUrl && !submissionDialog.file && (
                                            <a href={submissionDialog.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline ml-2">
                                                View
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setSubmissionDialog({
                                    open: false,
                                    assignmentId: null,
                                    assignmentTitle: "",
                                    currentSubmission: "",
                                    attachmentUrl: null,
                                    file: null
                                })}
                            >
                                Cancel
                            </Button>
                            <Button onClick={handleSubmitAssignment}>
                                Submit Assignment
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

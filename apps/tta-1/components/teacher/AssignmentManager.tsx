"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Plus, BookOpen, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ClassData {
    id: string;
    name: string;
}

interface Assignment {
    title: string;
    description: string;
    dueDate: string | null;
    className: string;
    classId: string;
    totalStudents: number;
    completedCount: number;
    createdAt: string;
}

interface Submission {
    studentName: string;
    completed: boolean;
    completedAt: string | null;
    submissionText: string | null;
    attachmentUrl: string | null;
}

interface AssignmentManagerProps {
    refreshTrigger?: number;
}

export function AssignmentManager({ refreshTrigger = 0 }: AssignmentManagerProps) {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState<Date>();
    const [viewingSubmissions, setViewingSubmissions] = useState<{
        open: boolean;
        title: string;
        submissions: Submission[];
    }>({
        open: false,
        title: "",
        submissions: [],
    });

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        classId: "",
    });

    useEffect(() => {
        fetchClasses();
        fetchAssignments();
    }, [refreshTrigger]);

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

    const fetchAssignments = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/teacher/assignments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setAssignments(data.assignments);
            }
        } catch (error) {
            console.error("Failed to fetch assignments:", error);
        }
    };

    const handleViewSubmissions = async (assignmentTitle: string) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`/api/teacher/assignments/${encodeURIComponent(assignmentTitle)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
                const data = await response.json();
                setViewingSubmissions({
                    open: true,
                    title: data.title,
                    submissions: data.submissions,
                });
            }
        } catch (error) {
            console.error("Failed to fetch submissions:", error);
        }
    };

    const handleCreateAssignment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/teacher/assignments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...formData,
                    dueDate: date?.toISOString(),
                }),
            });

            if (response.ok) {
                fetchAssignments();
                setFormData({ title: "", description: "", classId: "" });
                setDate(undefined);
                setShowForm(false);
            } else {
                const data = await response.json();
                alert(data.error || "Failed to create assignment");
            }
        } catch (error) {
            console.error("Failed to create assignment:", error);
            alert("An error occurred while creating the assignment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Assignments</CardTitle>
                            <CardDescription>Create and manage assignments for your classes</CardDescription>
                        </div>
                        <Button onClick={() => setShowForm(!showForm)} size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Assignment
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {showForm && (
                        <form onSubmit={handleCreateAssignment} className="space-y-4 p-4 border rounded-lg bg-muted/50">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class *</Label>
                                    <Select
                                        value={formData.classId}
                                        onValueChange={(value) => setFormData({ ...formData, classId: value })}
                                        required
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
                                </div>
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={date}
                                                onSelect={setDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading ? "Creating..." : "Create Assignment"}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-3">
                        {assignments.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                No assignments created yet.
                            </p>
                        ) : (
                            assignments.map((assignment, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold">{assignment.title}</h3>
                                            <Badge variant="outline">{assignment.className}</Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                                            {assignment.description}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                            <span>{assignment.completedCount} / {assignment.totalStudents} completed</span>
                                            {assignment.dueDate && (
                                                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewSubmissions(assignment.title)}
                                    >
                                        <BookOpen className="h-4 w-4 mr-2" />
                                        View Submissions
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Submissions Dialog */}
            <Dialog open={viewingSubmissions.open} onOpenChange={(open) => setViewingSubmissions({ ...viewingSubmissions, open })}>
                <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Student Submissions</DialogTitle>
                        <DialogDescription>
                            {viewingSubmissions.title}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {viewingSubmissions.submissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No submissions yet.
                            </p>
                        ) : (
                            viewingSubmissions.submissions.map((submission, idx) => (
                                <div key={idx} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">{submission.studentName}</h4>
                                        {submission.completed ? (
                                            <Badge className="bg-green-500">
                                                Submitted {submission.completedAt && `on ${new Date(submission.completedAt).toLocaleDateString()}`}
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">Not submitted</Badge>
                                        )}
                                    </div>
                                    {submission.submissionText ? (
                                        <div className="bg-muted p-3 rounded-md">
                                            <p className="text-sm whitespace-pre-wrap">{submission.submissionText}</p>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No submission text</p>
                                    )}
                                    {submission.attachmentUrl && (
                                        <div className="flex items-center gap-2 mt-2">
                                            <FileText className="h-4 w-4 text-muted-foreground" />
                                            <a
                                                href={submission.attachmentUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm text-primary hover:underline"
                                            >
                                                View Attachment
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setViewingSubmissions({ open: false, title: "", submissions: [] })}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

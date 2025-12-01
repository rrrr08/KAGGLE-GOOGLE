"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Plus, Users } from "lucide-react";

interface ClassData {
    id: string;
    name: string;
    grade?: string;
    classCode: string;
    studentCount: number;
    createdAt: string;
}

interface ClassManagementProps {
    onClassCreated?: () => void;
}

export function ClassManagement({ onClassCreated }: ClassManagementProps) {
    const [classes, setClasses] = useState<ClassData[]>([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", grade: "" });

    const fetchClasses = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/teacher/classes", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setClasses(data.classes);
            }
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem("token");
            const response = await fetch("/api/teacher/classes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                setClasses([data.class, ...classes]);
                setFormData({ name: "", grade: "" });
                setShowForm(false);
                onClassCreated?.();
            }
        } catch (error) {
            console.error("Failed to create class:", error);
        } finally {
            setLoading(false);
        }
    };

    const copyClassCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    // Fetch classes on mount
    useEffect(() => {
        fetchClasses();
    }, []);

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>My Classes</CardTitle>
                        <CardDescription>Manage your classes and get class codes for student enrollment</CardDescription>
                    </div>
                    <Button onClick={() => setShowForm(!showForm)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        New Class
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm && (
                    <form onSubmit={handleCreateClass} className="space-y-4 p-4 border rounded-lg bg-muted/50">
                        <div className="space-y-2">
                            <Label htmlFor="className">Class Name *</Label>
                            <Input
                                id="className"
                                placeholder="e.g., Math 101, Science 7A"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="grade">Grade (Optional)</Label>
                            <Input
                                id="grade"
                                placeholder="e.g., 7th Grade, Year 10"
                                value={formData.grade}
                                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Class"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                )}

                {classes.length === 0 ? (
                    <Alert>
                        <AlertDescription>
                            No classes yet. Create your first class to get a class code for student enrollment.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-3">
                        {classes.map((classItem) => (
                            <div
                                key={classItem.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold">{classItem.name}</h3>
                                        {classItem.grade && (
                                            <Badge variant="outline" className="text-xs">
                                                {classItem.grade}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {classItem.studentCount} student{classItem.studentCount !== 1 ? "s" : ""}
                                        </span>
                                        {classItem.createdAt && (
                                            <span>Created {new Date(classItem.createdAt).toLocaleDateString()}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right mr-2">
                                        <p className="text-xs text-muted-foreground mb-1">Class Code</p>
                                        <code className="text-sm font-mono font-bold bg-muted px-2 py-1 rounded">
                                            {classItem.classCode}
                                        </code>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => copyClassCode(classItem.classCode)}
                                    >
                                        {copiedCode === classItem.classCode ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

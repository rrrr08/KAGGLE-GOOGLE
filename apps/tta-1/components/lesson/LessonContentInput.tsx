"use client";

import { useState } from "react";
import { FileText, Link as LinkIcon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ContentInputType = "text" | "file" | "url";

interface LessonContentInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function LessonContentInput({ value, onChange }: LessonContentInputProps) {
    const [inputType, setInputType] = useState<ContentInputType>("text");
    const [file, setFile] = useState<File | null>(null);
    const [url, setUrl] = useState("");

    const handleFileUpload = async (uploadedFile: File) => {
        setFile(uploadedFile);
        const text = await uploadedFile.text();
        onChange(text);
    };

    const handleUrlFetch = async () => {
        if (!url) return;

        try {
            const response = await fetch(url);
            const text = await response.text();
            onChange(text);
        } catch (error) {
            alert("Failed to fetch content from URL");
        }
    };

    return (
        <div className="space-y-4">
            {/* Input Type Selector */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={inputType === "text" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputType("text")}
                >
                    <Type className="mr-2 h-4 w-4" />
                    Type Text
                </Button>
                <Button
                    type="button"
                    variant={inputType === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputType("file")}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Upload File
                </Button>
                <Button
                    type="button"
                    variant={inputType === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setInputType("url")}
                >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    From URL
                </Button>
            </div>

            {/* Text Input */}
            {inputType === "text" && (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    rows={8}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Enter your lesson content here..."
                />
            )}

            {/* File Upload */}
            {inputType === "file" && (
                <div className="space-y-3">
                    {!file ? (
                        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 hover:bg-accent/50">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm font-medium">Click to upload lesson file</span>
                            <span className="text-xs text-muted-foreground">
                                Supports .txt, .md, .docx, .pdf
                            </span>
                            <input
                                type="file"
                                className="hidden"
                                accept=".txt,.md,.docx,.pdf"
                                onChange={(e) => {
                                    const uploadedFile = e.target.files?.[0];
                                    if (uploadedFile) handleFileUpload(uploadedFile);
                                }}
                            />
                        </label>
                    ) : (
                        <Card className="border-2 border-primary/20 bg-primary/5">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-primary" />
                                        <div>
                                            <p className="font-medium">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setFile(null);
                                            onChange("");
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {value && (
                        <div className="rounded-md border bg-muted p-3">
                            <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                            <p className="text-sm line-clamp-3">{value}</p>
                        </div>
                    )}
                </div>
            )}

            {/* URL Input */}
            {inputType === "url" && (
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com/lesson.txt"
                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <Button type="button" onClick={handleUrlFetch}>
                            Fetch
                        </Button>
                    </div>

                    {value && (
                        <div className="rounded-md border bg-muted p-3">
                            <p className="text-xs text-muted-foreground mb-2">Fetched Content:</p>
                            <pre className="text-sm line-clamp-6 whitespace-pre-wrap">{value}</pre>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

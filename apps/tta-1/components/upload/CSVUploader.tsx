"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CSVUploaderProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
}

export function CSVUploader({ onFileSelect, selectedFile, onClear }: CSVUploaderProps) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length > 0) {
                onFileSelect(acceptedFiles[0]);
            }
        },
        [onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "text/csv": [".csv"],
        },
        maxFiles: 1,
    });

    if (selectedFile) {
        return (
            <Card className="border-2 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-primary/10 p-3">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">{selectedFile.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClear}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div
            {...getRootProps()}
            className={`
        cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-all
        ${isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
                }
      `}
        >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-primary/10 p-4">
                    <Upload className="h-8 w-8 text-primary" />
                </div>
                <div>
                    <p className="text-lg font-semibold">
                        {isDragActive ? "Drop your CSV file here" : "Upload Student Data CSV"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Drag and drop or click to browse
                    </p>
                </div>
                <p className="text-xs text-muted-foreground">
                    Required columns: student_id, question_id, score, max_score
                </p>
            </div>
        </div>
    );
}

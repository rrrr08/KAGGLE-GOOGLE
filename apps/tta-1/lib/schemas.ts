import { z } from "zod";

export const analysisFormSchema = z.object({
    file: z
        .instanceof(File, { message: "Please upload a CSV file" })
        .refine((file) => file.size > 0, "File cannot be empty")
        .refine((file) => file.name.endsWith(".csv"), "File must be a CSV"),
    classId: z.string().min(1, "Class ID is required"),
    teacherId: z.string().min(1, "Teacher ID is required"),
    initialLesson: z.string().min(10, "Lesson content must be at least 10 characters"),
});

export type AnalysisFormValues = z.infer<typeof analysisFormSchema>;

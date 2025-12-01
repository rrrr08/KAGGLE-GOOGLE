import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";
import { z } from "zod";

const createAssignmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    dueDate: z.string().optional(),
    classId: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "TEACHER");

        const body = await request.json();
        const data = createAssignmentSchema.parse(body);

        // Verify teacher owns the class
        const classData = await prisma.class.findUnique({
            where: { id: data.classId },
        });

        if (!classData || classData.teacherId !== user.userId) {
            return NextResponse.json(
                { error: "Class not found or unauthorized" },
                { status: 403 }
            );
        }

        // Get all students in the class
        const students = await prisma.student.findMany({
            where: { classId: data.classId },
            include: {
                profile: true,
            },
        });

        if (students.length === 0) {
            return NextResponse.json(
                { error: "No students found in this class" },
                { status: 400 }
            );
        }

        // Create individual assignment records for each student
        const assignments = await Promise.all(
            students.map((student) =>
                prisma.assignment.create({
                    data: {
                        title: data.title,
                        description: data.description,
                        dueDate: data.dueDate ? new Date(data.dueDate) : null,
                        classId: data.classId,
                        teacherId: user.userId,
                        studentId: student.profile?.id || null,
                        completed: false,
                    },
                })
            )
        );

        return NextResponse.json({
            success: true,
            message: `Assignment distributed to ${assignments.length} students`,
            assignmentCount: assignments.length,
        });
    } catch (error: any) {
        console.error("Create assignment error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to create assignment" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "TEACHER");

        const { searchParams } = new URL(request.url);
        const classId = searchParams.get("classId");

        const whereClause: any = {
            teacherId: user.userId,
        };

        if (classId) {
            whereClause.classId = classId;
        }

        const assignments = await prisma.assignment.findMany({
            where: whereClause,
            include: {
                class: {
                    select: { name: true },
                },
                studentProfile: {
                    select: {
                        student: {
                            select: { name: true },
                        },
                    },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        });

        // Group assignments by title and class to show as "assignment groups"
        const assignmentGroups = new Map<string, any>();

        for (const assignment of assignments) {
            const key = `${assignment.title}-${assignment.classId}`;

            if (!assignmentGroups.has(key)) {
                assignmentGroups.set(key, {
                    title: assignment.title,
                    description: assignment.description,
                    dueDate: assignment.dueDate,
                    className: assignment.class.name,
                    classId: assignment.classId,
                    totalStudents: 0,
                    completedCount: 0,
                    createdAt: assignment.createdAt,
                });
            }

            const group = assignmentGroups.get(key);
            group.totalStudents++;
            if (assignment.completed) {
                group.completedCount++;
            }
        }

        const groupedAssignments = Array.from(assignmentGroups.values());

        return NextResponse.json({ assignments: groupedAssignments });
    } catch (error: any) {
        console.error("Get assignments error:", error);
        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.userId },
        });

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Get assignments for this student
        const assignments = await prisma.assignment.findMany({
            where: {
                studentId: studentProfile.id,
            },
            include: {
                class: {
                    select: { name: true },
                },
            },
            orderBy: {
                dueDate: "asc",
            },
        });

        return NextResponse.json({ assignments });
    } catch (error: any) {
        console.error("Get student assignments error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to fetch assignments" },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "STUDENT");

        const body = await request.json();
        const { assignmentId, completed, submissionText, attachmentUrl } = body;

        if (!assignmentId || typeof completed !== "boolean") {
            return NextResponse.json(
                { error: "Invalid input" },
                { status: 400 }
            );
        }

        // Get student profile
        const studentProfile = await prisma.studentProfile.findUnique({
            where: { userId: user.userId },
        });

        if (!studentProfile) {
            return NextResponse.json(
                { error: "Student profile not found" },
                { status: 404 }
            );
        }

        // Verify assignment belongs to this student
        const assignment = await prisma.assignment.findUnique({
            where: { id: assignmentId },
        });

        if (!assignment || assignment.studentId !== studentProfile.id) {
            return NextResponse.json(
                { error: "Assignment not found or unauthorized" },
                { status: 403 }
            );
        }

        // Update assignment with submission
        const updatedAssignment = await prisma.assignment.update({
            where: { id: assignmentId },
            data: {
                completed,
                completedAt: completed ? new Date() : null,
                submissionText: submissionText || assignment.submissionText,
                attachmentUrl: attachmentUrl || assignment.attachmentUrl,
            },
        });

        return NextResponse.json({
            success: true,
            assignment: updatedAssignment,
        });
    } catch (error: any) {
        console.error("Update assignment error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to update assignment" },
            { status: 500 }
        );
    }
}

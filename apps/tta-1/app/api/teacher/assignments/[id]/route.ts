import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const user = await getAuthUser(request);
        requireRole(user, "TEACHER");

        const assignmentId = params.id;

        // Get all student submissions for this assignment
        const submissions = await prisma.assignment.findMany({
            where: {
                title: assignmentId, // Using title as group identifier
                teacherId: user.userId,
            },
            include: {
                studentProfile: {
                    include: {
                        student: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                class: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                completedAt: "desc",
            },
        });

        if (submissions.length === 0) {
            return NextResponse.json(
                { error: "Assignment not found" },
                { status: 404 }
            );
        }

        // Format response
        const assignmentData = {
            title: submissions[0].title,
            description: submissions[0].description,
            dueDate: submissions[0].dueDate,
            className: submissions[0].class.name,
            totalStudents: submissions.length,
            submissions: submissions.map((s) => ({
                studentName: s.studentProfile?.student.name || "Unknown",
                completed: s.completed,
                completedAt: s.completedAt,
                submissionText: s.submissionText,
                attachmentUrl: s.attachmentUrl,
            })),
        };

        return NextResponse.json(assignmentData);
    } catch (error: any) {
        console.error("Get assignment submissions error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to fetch submissions" },
            { status: 500 }
        );
    }
}

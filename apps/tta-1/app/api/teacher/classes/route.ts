import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { getAuthUser, requireRole } from "@/lib/auth/middleware";
import { z } from "zod";

const createClassSchema = z.object({
    name: z.string().min(1),
    grade: z.string().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "TEACHER");

        const body = await request.json();
        const data = createClassSchema.parse(body);

        // Create class with auto-generated class code
        const newClass = await prisma.class.create({
            data: {
                name: data.name,
                grade: data.grade,
                teacherId: user.userId,
            },
            select: {
                id: true,
                name: true,
                grade: true,
                classCode: true,
            },
        });

        return NextResponse.json({
            success: true,
            class: {
                id: newClass.id,
                name: newClass.name,
                grade: newClass.grade,
                classCode: newClass.classCode,
            },
        });
    } catch (error: any) {
        console.error("Create class error:", error);

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
            { error: "Failed to create class" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthUser(request);
        requireRole(user, "TEACHER");

        // Get all classes for this teacher
        const classes = await prisma.class.findMany({
            where: {
                teacherId: user.userId,
            },
            select: {
                id: true,
                name: true,
                grade: true,
                classCode: true,
                createdAt: true,
                _count: {
                    select: {
                        students: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({
            classes: classes.map((c) => ({
                id: c.id,
                name: c.name,
                grade: c.grade,
                classCode: c.classCode,
                studentCount: c._count.students,
                createdAt: c.createdAt,
            })),
        });
    } catch (error: any) {
        console.error("Get classes error:", error);

        if (error.message === "Unauthorized" || error.message.startsWith("Forbidden")) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }

        return NextResponse.json(
            { error: "Failed to fetch classes" },
            { status: 500 }
        );
    }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { verifyPassword } from "@/lib/auth/password";
import { createToken } from "@/lib/auth/jwt";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = loginSchema.parse(body);

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
            include: {
                studentProfile: {
                    include: {
                        student: {
                            include: {
                                class: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(data.password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Create JWT token
        const token = await createToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        // Prepare response data
        const responseData: any = {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        };

        // Add student-specific data if applicable
        if (user.role === "STUDENT" && user.studentProfile) {
            responseData.user.studentId = user.studentProfile.studentId;
            responseData.user.classId = user.studentProfile.student.classId;
            responseData.user.className = user.studentProfile.student.class.name;
            responseData.user.grade = user.studentProfile.grade;
        }

        return NextResponse.json(responseData);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Login error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

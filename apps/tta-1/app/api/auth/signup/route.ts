import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { hashPassword } from "@/lib/auth/password";
import { z } from "zod";

const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1),
    role: z.enum(["TEACHER", "STUDENT"]),
    classCode: z.string().optional(), // Required for students
    grade: z.string().optional(), // Optional for students
    parentEmail: z.string().email().optional(), // Optional for students
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = signupSchema.parse(body);

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 400 }
            );
        }

        // Hash password
        const passwordHash = await hashPassword(data.password);

        // Create user based on role
        if (data.role === "TEACHER") {
            const user = await prisma.user.create({
                data: {
                    email: data.email,
                    name: data.name,
                    passwordHash,
                    role: "TEACHER",
                },
            });

            return NextResponse.json({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            });
        } else {
            // Student signup
            if (!data.classCode) {
                return NextResponse.json(
                    { error: "Class code is required for student signup" },
                    { status: 400 }
                );
            }

            // Find class by code
            const classData = await prisma.class.findUnique({
                where: { classCode: data.classCode },
            });

            if (!classData) {
                return NextResponse.json(
                    { error: "Invalid class code" },
                    { status: 400 }
                );
            }

            // Create user and student profile in a transaction
            const result = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: data.email,
                        name: data.name,
                        passwordHash,
                        role: "STUDENT",
                    },
                });

                // Create Student record
                const student = await tx.student.create({
                    data: {
                        hashedId: user.id, // Using user ID as hashed ID for now
                        name: data.name,
                        classId: classData.id,
                        skillsJson: "{}",
                    },
                });

                // Create StudentProfile
                const profile = await tx.studentProfile.create({
                    data: {
                        userId: user.id,
                        studentId: student.id,
                        grade: data.grade,
                        parentEmail: data.parentEmail,
                    },
                });

                return { user, student, profile };
            });

            return NextResponse.json({
                success: true,
                user: {
                    id: result.user.id,
                    email: result.user.email,
                    name: result.user.name,
                    role: result.user.role,
                    studentId: result.student.id,
                    classId: classData.id,
                },
            });
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid input", details: error.errors },
                { status: 400 }
            );
        }

        console.error("Signup error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

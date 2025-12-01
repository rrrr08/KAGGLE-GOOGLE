import { PrismaClient, Role } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // 1. Create Teacher
    const passwordHash = await hashPassword("password123");
    const teacher = await prisma.user.upsert({
        where: { email: "teacher@example.com" },
        update: {},
        create: {
            email: "teacher@example.com",
            name: "Sarah Johnson",
            passwordHash,
            role: Role.TEACHER,
        },
    });

    console.log(`Created teacher: ${teacher.name}`);

    // 2. Create Classes
    const mathClass = await prisma.class.upsert({
        where: { id: "cmindgjyn0004w4yg0fcyruv1" },
        update: {},
        create: {
            name: "Algebra I - Period 2",
            grade: "9th",
            classCode: "cmindgjyn0004w4yg0fcyruv1",
            teacherId: teacher.id,
            trends: {
                create: {
                    snapshotDate: new Date(),
                    weaknessesJson: JSON.stringify([
                        { topic: "Linear Equations", avg: 65, pct_below: 0.4 },
                        { topic: "Inequalities", avg: 72, pct_below: 0.25 },
                    ]),
                    trendSummaryJson: JSON.stringify({
                        summary: "Class is struggling with multi-step linear equations.",
                    }),
                },
            },
        },
    });

    console.log(`Created class: ${mathClass.name}`);

    // 3. Create Students
    const studentNames = [
        "Alice Baker", "Bob Charlie", "Charlie Delta", "David Echo", "Eve Foxtrot",
        "Frank Golf", "Grace Hotel", "Heidi India", "Ivan Juliet", "Judy Kilo"
    ];

    for (let i = 0; i < studentNames.length; i++) {
        await prisma.student.upsert({
            where: { hashedId: `student_${i + 1}` },
            update: {},
            create: {
                hashedId: `student_${i + 1}`,
                name: studentNames[i],
                classId: mathClass.id,
                skillsJson: JSON.stringify({
                    "Linear Equations": Math.floor(Math.random() * 40) + 60, // 60-100
                    "Inequalities": Math.floor(Math.random() * 40) + 60,
                }),
            },
        });
    }

    console.log(`Created ${studentNames.length} students`);

    // 4. Create Analysis Run (Mock Data)
    await prisma.analysisRun.create({
        data: {
            classId: mathClass.id,
            teacherId: teacher.id,
            initialLesson: "Today we will learn about solving linear equations.",
            finalDraft: "Today we will master solving linear equations using real-world examples...",
            agentAOutputJson: JSON.stringify({
                class_average: 72,
                weakest_topics: [{ topic: "Linear Equations", avg: 65 }],
            }),
            historyJson: JSON.stringify([]),
            finalScore: 85,
            passed: true,
            iterations: 2,
        },
    });

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

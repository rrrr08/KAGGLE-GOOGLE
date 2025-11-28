import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // 1. Create Teacher
    const teacher = await prisma.user.upsert({
        where: { email: "teacher@example.com" },
        update: {},
        create: {
            email: "teacher@example.com",
            name: "Sarah Johnson",
            passwordHash: "hashed_password_123", // In real app, use bcrypt
            role: Role.TEACHER,
        },
    });

    console.log(`Created teacher: ${teacher.name}`);

    // 2. Create Classes
    const mathClass = await prisma.class.create({
        data: {
            name: "Algebra I - Period 2",
            grade: "9th",
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
        await prisma.student.create({
            data: {
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

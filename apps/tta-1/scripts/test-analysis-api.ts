import { readFileSync } from "fs";
import { join } from "path";

async function main() {
    const baseUrl = "http://localhost:3003";

    // 1. Login
    console.log("Logging in...");
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "teacher@example.com",
            password: "password123",
        }),
    });

    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    const teacherId = loginData.user.id;
    console.log("Logged in as:", loginData.user.email);

    // 2. Get Classes
    console.log("Fetching classes...");
    const classesRes = await fetch(`${baseUrl}/api/teacher/classes`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (!classesRes.ok) {
        console.error("Failed to fetch classes:", await classesRes.text());
        return;
    }

    const classesData = await classesRes.json();
    const classId = classesData.classes[0]?.id;

    if (!classId) {
        console.error("No classes found. Please run seed script.");
        return;
    }
    console.log("Using class ID:", classId);

    // 3. Upload CSV and Run Analysis
    console.log("Uploading CSV...");
    const csvPath = join(process.cwd(), "public", "sample.csv");
    const csvContent = readFileSync(csvPath, "utf-8");
    const blob = new Blob([csvContent], { type: "text/csv" });

    const formData = new FormData();
    formData.append("file", blob, "sample.csv");
    formData.append("class_id", classId);
    formData.append("teacher_id", teacherId);
    formData.append("initial_lesson", "This is a test lesson content that is long enough.");

    const analysisRes = await fetch(`${baseUrl}/api/analysis/run`, {
        method: "POST",
        body: formData,
    });

    if (!analysisRes.ok) {
        console.error("Analysis failed:", await analysisRes.text());
    } else {
        const result = await analysisRes.json();
        console.log("Analysis successful!");
        console.log("Run ID:", result.run_id);
    }
}

main().catch(console.error);

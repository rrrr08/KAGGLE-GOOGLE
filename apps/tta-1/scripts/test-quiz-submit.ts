import { readFileSync } from "fs";
import { join } from "path";

async function main() {
    const baseUrl = "http://localhost:3003";

    // 1. Login as Student
    console.log("Logging in as student...");
    // The seed creates students with hashedId `student_1`, but no email/password login for them directly in the seed?
    // Wait, the seed creates students but not Users for them?
    // Let's check the seed again.
    // The seed creates `Student` records but not `User` records for students.
    // The auth system requires a `User` record.
    // I might need to sign up a new student or use the teacher account if the teacher can take quizzes (unlikely based on role check).
    
    // Let's try to sign up a new student first.
    const uniqueId = Date.now();
    const email = `student${uniqueId}@example.com`;
    const password = "password123";
    
    console.log(`Signing up student: ${email}`);
    const signupRes = await fetch(`${baseUrl}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
            name: "Test Student",
            role: "STUDENT",
            classCode: "DEMO-CLASS", // From seed
            grade: "9th"
        }),
    });

    if (!signupRes.ok) {
        console.error("Signup failed:", await signupRes.text());
        return;
    }

    const signupData = await signupRes.json();
    console.log("Signup successful. Logging in...");

    // 1b. Login to get token
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    if (!loginRes.ok) {
        console.error("Login failed:", await loginRes.text());
        return;
    }

    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log("Logged in. Token:", token ? "Yes" : "No");
    console.log("User Data:", JSON.stringify(loginData.user, null, 2));

    // 2. Generate Quiz
    console.log("Generating quiz...");
    const generateRes = await fetch(`${baseUrl}/api/student/quiz/generate`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            topic: "Linear Equations",
            difficulty: "easy"
        }),
    });

    if (!generateRes.ok) {
        console.error("Quiz generation failed:", await generateRes.text());
        return;
    }

    const quizData = await generateRes.json();
    const quizId = quizData.quizId;
    console.log("Quiz generated. ID:", quizId);

    // 3. Submit Quiz
    console.log("Submitting quiz...");
    const submitRes = await fetch(`${baseUrl}/api/student/quiz/submit`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            quizId: quizId,
            studentId: loginData.user.studentId, // Sending what the frontend likely sends
            answers: [
                { questionId: "q1", answer: 0 },
                { questionId: "q2", answer: 1 }
            ]
        }),
    });

    if (!submitRes.ok) {
        console.error("Quiz submission failed:", await submitRes.text());
    } else {
        console.log("Quiz submitted successfully!");
        console.log(await submitRes.json());
    }
}

main().catch(console.error);

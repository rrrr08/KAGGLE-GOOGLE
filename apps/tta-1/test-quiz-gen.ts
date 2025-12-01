import { generateQuiz } from "./lib/ai/quiz-generator";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

async function test() {
    try {
        console.log("Checking API Key...");
        if (!process.env.GEMINI_API_KEY) {
            fs.writeFileSync("result.log", "ERROR: GEMINI_API_KEY is missing in process.env");
            return;
        }
        console.log("API Key present (length: " + process.env.GEMINI_API_KEY.length + ")");

        console.log("Generating quiz for topic: Photosynthesis...");
        const quiz = await generateQuiz("Photosynthesis", 3, "easy");
        console.log("Quiz generated successfully!");
        fs.writeFileSync("result.log", "Success:\n" + JSON.stringify(quiz, null, 2));
    } catch (error: any) {
        console.error("Test failed!");
        try {
            const msg = "Message: " + error.message;
            fs.writeFileSync("result.log", msg);
        } catch (e) {
            console.error("Write failed:", e);
        }
    }
}

test();

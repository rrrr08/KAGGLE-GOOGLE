import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface PracticeExercise {
    question: string;
    hint: string;
    answer: string;
    explanation: string;
}

export interface PracticeMaterialContent {
    title: string;
    introduction: string;
    keyConceptsMarkdown: string;
    examples: string[];
    exercises: PracticeExercise[];
}

export async function generatePracticeMaterial(
    topic: string,
    difficulty: "easy" | "medium" | "hard",
    weaknessContext?: string
): Promise<PracticeMaterialContent> {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const prompt = `You are an expert educational content creator. Create a practice material for the topic "${topic}" with difficulty "${difficulty}".
    
    Context: ${weaknessContext || "General practice"}
    
    Return ONLY a JSON object with this structure:
    {
        "title": "string",
        "introduction": "string",
        "keyConceptsMarkdown": "string",
        "examples": ["string"],
        "exercises": [
            {
                "question": "string",
                "hint": "string",
                "answer": "string",
                "explanation": "string"
            }
        ]
    }`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const jsonMatch = response.match(/`json\n([\s\S]*?)\n`/) || response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse AI response");
    const jsonText = jsonMatch[1] || jsonMatch[0];
    return JSON.parse(jsonText);
}

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set in environment variables");
}

export const genAI = new GoogleGenerativeAI(apiKey);

// Default model for text generation
export const getGenerativeModel = (modelName: string = "gemini-2.0-flash-lite-preview-02-05") => {
    return genAI.getGenerativeModel({ model: modelName });
};

// Helper function to generate content
export async function generateContent(prompt: string, modelName?: string): Promise<string> {
    const model = getGenerativeModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}

// Helper function to generate structured JSON
export async function generateJSON<T>(prompt: string, modelName?: string): Promise<T> {
    const model = getGenerativeModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
    const jsonText = jsonMatch ? jsonMatch[1] : text;

    return JSON.parse(jsonText) as T;
}

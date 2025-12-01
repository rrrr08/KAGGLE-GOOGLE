import { getGenerativeModel } from "@/lib/ai/gemini";

export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    difficulty: "easy" | "medium" | "hard";
}

export interface GeneratedQuiz {
    title: string;
    topic: string;
    questions: QuizQuestion[];
}

export async function generateQuiz(
    topic: string,
    numQuestions: number = 5,
    difficulty: "easy" | "medium" | "hard" = "medium",
    weaknessContext?: string
): Promise<GeneratedQuiz> {
    const model = getGenerativeModel();

    const prompt = `You are an expert educational assessment creator. Generate a quiz to test student understanding.

Topic: ${topic}
Number of Questions: ${numQuestions}
Difficulty Level: ${difficulty}
${weaknessContext ? `Student Weakness Context: ${weaknessContext}` : ""}

Generate a quiz with the following requirements:

1. Create ${numQuestions} multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Questions should progressively test understanding from basic to advanced
4. Include clear explanations for why each answer is correct
5. Make questions practical and application-based, not just memorization
6. Ensure questions are appropriate for the ${difficulty} difficulty level

Format your response as a JSON object with this structure:
{
  "title": "Quiz title",
  "topic": "${topic}",
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this is correct",
      "difficulty": "${difficulty}"
    },
    ...
  ]
}

The correctAnswer should be the index (0-3) of the correct option in the options array.`;

    let retries = 0;
    const maxRetries = 3;
    let result;

    while (retries < maxRetries) {
        try {
            result = await model.generateContent(prompt);
            break;
        } catch (error: any) {
            if (error.status === 429 || error.message?.includes("429")) {
                retries++;
                if (retries === maxRetries) throw error;
                
                // Wait for 2^retries * 1000ms (2s, 4s, 8s)
                const delay = Math.pow(2, retries) * 1000;
                console.log(`Rate limit hit. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                throw error;
            }
        }
    }

    if (!result) throw new Error("Failed to generate quiz after retries");

    const response = result.response.text();

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error("Failed to parse AI response");
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const quiz = JSON.parse(jsonText);

    // Ensure IDs are unique
    quiz.questions = quiz.questions.map((q: any, idx: number) => ({
        ...q,
        id: q.id || `q${idx + 1}`,
    }));

    return quiz;
}

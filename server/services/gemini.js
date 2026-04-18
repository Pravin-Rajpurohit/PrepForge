import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // Changed to standard 2.5 flash

const executeWithRetry = async (fn, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error.message && error.message.includes('429');
      if (isRateLimit && i < retries - 1) {
        let delayMs = 5000 * Math.pow(2, i); // Fallback: 5s, 10s
        // Try to extract exact wait time if provided in the error message
        const match = error.message.match(/retry in ([\d\.]+)s/);
        if (match && match[1]) {
           delayMs = parseFloat(match[1]) * 1000 + 1000; // Add 1s buffer
        }
        console.warn(`[Gemini API] Rate limit hit (429). Retrying in ${Math.round(delayMs)}ms... (Attempt ${i + 1} of ${retries - 1})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        throw error;
      }
    }
  }
};

export const generateQuestions = async ({ role, topic, difficulty, count }) => {
  const prompt = `You are a strict technical interviewer at a top product company. Generate ${count} ${difficulty} interview questions for a ${role} candidate on the topic of ${topic}. Return ONLY a valid JSON array of question strings. No explanation, no markdown, no extra text. Example: ["Question 1?", "Question 2?"]`;

  try {
    const result = await executeWithRetry(() => model.generateContent(prompt));
    const response = await result.response;
    let text = response.text();
    
    // Clean up in case there are markdown ticks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const questions = JSON.parse(text);
    if (!Array.isArray(questions)) {
      throw new Error("Parsed JSON is not an array");
    }
    return questions;
  } catch (error) {
    console.error("Gemini Question Generation Error:", error);
    throw new Error("AI service is temporarily unavailable. Please try again later.");
  }
};

export const evaluateAnswer = async ({ questionText, userAnswer }) => {
  const prompt = `You are a senior technical interviewer at a top product company. Evaluate this interview answer strictly. Question: ${questionText} Candidate Answer: ${userAnswer} Score the answer on: technical accuracy, completeness, and clarity. Return ONLY a valid JSON object with exactly these fields: { "score": number between 0-10, "strength": "string (one sentence about what was good)", "improvement": "string (one sentence about what was missing or wrong)", "feedback": "string (2-3 sentence overall feedback)" }. No markdown, no extra text.`;

  try {
    const result = await executeWithRetry(() => model.generateContent(prompt));
    const response = await result.response;
    let text = response.text();
    
    // Clean up in case there are markdown ticks
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const evaluation = JSON.parse(text);
    
    // Basic validation
    if (typeof evaluation.score !== 'number') {
      evaluation.score = parseFloat(evaluation.score) || 0;
    }
    
    return {
      score: evaluation.score,
      strength: evaluation.strength || "N/A",
      improvement: evaluation.improvement || "N/A",
      feedback: evaluation.feedback || "Evaluation unavailable"
    };
  } catch (error) {
    console.error("Gemini Answer Evaluation Error:", error);
    return {
      score: 0,
      strength: "Evaluation unavailable",
      improvement: "Evaluation unavailable",
      feedback: "AI service is temporarily unavailable. Please try again later."
    };
  }
};

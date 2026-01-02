import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Get the image generation model
export function getImageModel() {
    // Using Gemini 2.0 Flash for image generation
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
    });
}

// Get the text model for prompt enhancement
export function getTextModel() {
    return genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
}

// Enhance prompt for better image generation
export async function enhancePrompt(prompt: string): Promise<string> {
    try {
        const model = getTextModel();
        const result = await model.generateContent(
            `You are an expert at writing prompts for AI image generation. 
            Enhance this prompt to create a high-quality, professional image.
            Keep the response concise (under 200 words).
            Focus on: style, lighting, composition, and details.
            
            Original prompt: "${prompt}"
            
            Enhanced prompt:`
        );
        return result.response.text().trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return prompt; // Fall back to original prompt
    }
}

export { genAI };

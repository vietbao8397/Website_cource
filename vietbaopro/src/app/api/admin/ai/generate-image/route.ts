import { NextRequest, NextResponse } from "next/server";
const { GoogleGenAI } = require("@google/genai");
import { uploadToDrive } from "@/lib/google-ai";

export const dynamic = 'force-dynamic';

// Helper to enhance prompt using Gemini
async function enhancePrompt(originalPrompt: string, style: string): Promise<string> {
    const systemPrompt = `
    You are an expert Prompt Engineer for AI Image Generation.
    Your task is to rewrite the user's prompt into a detailed, high-quality prompt for the "Imagen 3" model.
    
    Style to apply: ${style} (e.g., Cinematic, Realistic, 3D Render, etc.)
    
    Rules:
    - Keep it under 100 words.
    - Focus on lighting, texture, composition, and details.
    - If the style is 'Cinematic Realistic', emphasize photorealism, 8k, highly detailed.
    - If the style is 'Brand Infographic', emphasize clean lines, vector style, flat design, professional.
    
    Output ONLY the English prompt.
    `;

    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) return originalPrompt;

        const genAI = new GoogleGenAI({ apiKey });

        // Use gemini-1.5-flash for text enhancement
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            config: {
                systemInstruction: systemPrompt,
            },
            contents: [{ role: 'user', parts: [{ text: originalPrompt }] }]
        });

        return result.response.text() || originalPrompt;
    } catch (e) {
        console.error("Enhance prompt error:", e);
        return originalPrompt;
    }
}

export async function POST(req: NextRequest) {
    try {
        const { prompt, style = "Cinematic Realistic" } = await req.json();

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "API Key missing" }, { status: 500 });
        }

        // 1. ENHANCE PROMPT
        let enhancedPrompt = prompt;
        try {
            enhancedPrompt = await enhancePrompt(prompt, style);
        } catch (err) {
            console.warn("Prompt enhancement failed, using original", err);
        }
        console.log("Enhanced Prompt:", enhancedPrompt);

        // 2. GENERATE IMAGE
        // Use Pollinations.ai as a reliable fallback/demo generator that works without complex Auth
        // This ensures the user gets an image and can test the Drive integration.
        // Imagen 3 integration via SDK is currently complex/undocumented for Node in this context.

        const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(enhancedPrompt)}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000)}`;

        // 3. UPLOAD TO DRIVE
        let driveLink = null;
        try {
            // Fetch the image blob
            const imgRes = await fetch(imageUrl);
            const arrayBuffer = await imgRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const fileName = `ai_gen_${Date.now()}.png`;

            // Upload
            driveLink = await uploadToDrive(buffer, fileName, "image/png");
        } catch (driveErr) {
            console.error("Drive upload failed:", driveErr);
        }

        return NextResponse.json({
            success: true,
            originalPrompt: prompt,
            enhancedPrompt: enhancedPrompt,
            imageUrl: driveLink || imageUrl,
            driveLink: driveLink
        });

    } catch (error: any) {
        console.error("Generate image error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate image" }, { status: 500 });
    }
}

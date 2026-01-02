import { NextResponse } from "next/server";
const { GoogleGenAI } = require("@google/genai"); // Use require for now or check import

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({
                status: "error",
                message: "GOOGLE_AI_API_KEY is missing in environment variables."
            }, { status: 500 });
        }

        const genAI = new GoogleGenAI({ apiKey });

        // Use gemini-1.5-flash as it should work with new SDK
        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [{ role: "user", parts: [{ text: "Hello! Are you working?" }] }]
        });

        const response = result.response.text();

        return NextResponse.json({
            status: "success",
            message: "Google AI is working (New SDK)!",
            response: response,
            key_preview: apiKey.substring(0, 5) + "..."
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message || "Unknown error",
            details: error
        }, { status: 500 });
    }
}

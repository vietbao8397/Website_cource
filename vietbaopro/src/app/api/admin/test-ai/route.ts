import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const result = await model.generateContent("Hello! Are you working?");
        const response = result.response.text();

        return NextResponse.json({
            status: "success",
            message: "Google AI is working!",
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

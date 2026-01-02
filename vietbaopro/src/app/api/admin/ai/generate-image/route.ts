import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();

        // Check admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { prompt, style = "realistic" } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Check API key
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 });
        }

        // Style modifiers
        const stylePrompts: Record<string, string> = {
            realistic: "photorealistic, high quality, professional photography, 8k resolution",
            artistic: "artistic, creative, vibrant colors, digital art style",
            minimal: "minimalist, clean, simple, modern design",
            illustration: "illustration style, vector art, clean lines",
            "3d": "3D render, octane render, highly detailed, volumetric lighting",
        };

        const styleModifier = stylePrompts[style] || stylePrompts.realistic;
        const enhancedPrompt = `${prompt}. Style: ${styleModifier}`;

        // Initialize Google AI
        const genAI = new GoogleGenerativeAI(apiKey);

        // Try using Imagen model through Gemini API
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash-exp",
        });

        // Generate content with image request
        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `Generate an image based on this description: ${enhancedPrompt}. 
                    
                    Please create a detailed, high-quality image that matches this description.`
                }]
            }],
        });

        const response = result.response;
        const text = response.text();

        // For now, since direct image generation might need Imagen API,
        // we'll return a text response with instructions
        // In production, you'd integrate with Imagen or use the experimental image generation

        // Check if there are any image parts in the response
        const candidates = response.candidates;
        let imageData = null;

        if (candidates && candidates[0]?.content?.parts) {
            for (const part of candidates[0].content.parts) {
                if ("inlineData" in part && part.inlineData) {
                    imageData = {
                        mimeType: part.inlineData.mimeType,
                        data: part.inlineData.data,
                    };
                    break;
                }
            }
        }

        if (imageData) {
            // If we got image data, return it
            return NextResponse.json({
                success: true,
                image: {
                    base64: imageData.data,
                    mimeType: imageData.mimeType,
                },
                prompt: enhancedPrompt,
            });
        }

        // If no image was generated, return the text response
        return NextResponse.json({
            success: true,
            message: "Image generation model response",
            text: text,
            prompt: enhancedPrompt,
            note: "Direct image generation requires Imagen API or experimental features. Please check Google AI Studio for full image generation capabilities.",
        });

    } catch (error: unknown) {
        console.error("AI Image generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
        return NextResponse.json({
            error: errorMessage,
            details: "Please ensure your Google AI API key has access to image generation models."
        }, { status: 500 });
    }
}

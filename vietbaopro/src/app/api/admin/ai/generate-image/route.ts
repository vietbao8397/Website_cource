import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { enhancePrompt, uploadToDrive } from "@/lib/google-ai"; // Import our new helpers

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
        const { prompt, style = "realistic" } = body; // style is now critical

        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        // Check API key
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Google AI API key not configured" }, { status: 500 });
        }

        // 1. ENHANCE PROMPT with Master Framework
        // Map UI styles to our framework styles
        const frameworkStyle = (style === "realistic" || style === "3d" || style === "artistic")
            ? "realistic"
            : "infographic";

        console.log(`Enhancing prompt for style: ${frameworkStyle}...`);
        const enhancedPrompt = await enhancePrompt(prompt, frameworkStyle);
        console.log("Enhanced Prompt:", enhancedPrompt);

        // Helper to get a text model
        const getTextModel = (apiKey: string) => {
            const genAI = new GoogleGenerativeAI(apiKey);
            return genAI.getGenerativeModel({ model: "gemini-pro" });
        };

        // Initialize Google AI for image generation
        const genAI = new GoogleGenerativeAI(apiKey);

        // 2. GENERATE IMAGE
        // Try using experimental image model
        let modelName = "gemini-2.0-flash-exp";
        // Note: In production you might swap this based on availability

        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [{
                    text: `Generate an image based on this description: ${enhancedPrompt}`
                }]
            }],
        });

        const response = result.response;
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
            // 3. UPLOAD TO DRIVE
            let driveFile;
            try {
                // Generate filename using timestamp and prompt snippet
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const safePrompt = prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
                const fileName = `AI_Gen_${timestamp}_${safePrompt}.png`; // Assuming PNG from Gemini

                driveFile = await uploadToDrive(
                    imageData.data,
                    fileName,
                    imageData.mimeType
                );
                console.log("Uploaded to Drive:", driveFile.id);
            } catch (driveError) {
                console.error("Failed to upload to Drive (continuing):", driveError);
                // We won't fail the request if Drive upload fails, just log it
            }

            return NextResponse.json({
                success: true,
                image: {
                    base64: imageData.data,
                    mimeType: imageData.mimeType,
                },
                prompt: enhancedPrompt,
                originalPrompt: prompt,
                driveFile: driveFile ? {
                    id: driveFile.id,
                    link: driveFile.webViewLink
                } : null
            });
        }

        // If no image
        return NextResponse.json({
            success: true,
            message: "No image generated (Text only response)",
            text: response.text(),
            prompt: enhancedPrompt,
            originalPrompt: prompt
        });

    } catch (error: unknown) {
        console.error("AI Image generation error:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to generate image";
        return NextResponse.json({
            error: errorMessage
        }, { status: 500 });
    }
}

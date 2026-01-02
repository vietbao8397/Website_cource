const { GoogleGenAI } = require("@google/genai");
import { google } from "googleapis";
import { Readable } from "stream";

// Initialize Google AI
const apiKey = process.env.GOOGLE_AI_API_KEY || "";
const genAI = new GoogleGenAI({ apiKey });

// Initialize Drive API
const getDriveService = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error("Google OAuth2 credentials missing (CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN)");
    }

    const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        process.env.NEXT_PUBLIC_SITE_URL // Redirect URL
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    return google.drive({ version: 'v3', auth: oauth2Client });
};

// Upload to Drive
export async function uploadToDrive(base64Data: string | Buffer, fileName: string, mimeType: string) {
    try {
        const drive = getDriveService();
        // Handle both base64 string and Buffer
        const buffer = Buffer.isBuffer(base64Data)
            ? base64Data
            : Buffer.from(base64Data as string, 'base64');

        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        // Create specific folder for AI Images if needed
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const fileMetadata: { name: string; parents?: string[] } = {
            name: fileName,
        };

        if (folderId) {
            fileMetadata.parents = [folderId];
        }

        const media = {
            mimeType: mimeType,
            body: stream,
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink',
        });

        return response.data;
    } catch (error) {
        console.error("Drive upload error:", error);
        throw error;
    }
}

// VIET BAO PRO Frameworks (Kept for reference or future use)
const REALISTIC_FRAMEWORK = `
# VIET BAO PRO: MASTER VISUAL PROMPT FRAMEWORK
Goal: Consistent, high-quality, "Tangible Knowledge", No Sci-fi/Hype.
Core Principles: Solid - Calm - Professional.

FORMULA: [1. SUBJECT & FRAMING] + [2. APPEARANCE & POSE] + [3. LIGHTING & COLOR] + [4. ENVIRONMENT & PROPS] + [5. TECHNICAL & STYLE]

DETAILS:
1. SUBJECT: Hyper-realistic cinematic [Angle] of [Subject]...
   - Angles: Medium shot (work), Close-up (focus), Low angle (authority).
2. APPEARANCE: Tailored matte charcoal/dark grey attire. Focused, calm, professional expression.
3. LIGHTING (CRITICAL): "Soft Graphite & Warm Gold". Soft diffused studio lighting, warm amber highlights, deep charcoal shadows. NO blue/teal/neon.
4. ENVIRONMENT: "Tangible Knowledge". High-end minimalist dark studio. Tangible props (wood, paper, metal). No holograms.
5. TECHNICAL: 85mm lens, f/1.8-2.8, 8K, hyper-detailed. Editorial photography.
`;

const INFOGRAPHIC_FRAMEWORK = `
# VIET BAO PRO: BRAND GUIDELINE - ELEVATED WARM PRECISION™ - DARKMODE
Goal: Create premium, professional infographics/diagrams.
Style: Dark mode, clean, precise, high contrast but warm.

KEY ELEMENTS:
1. Background: Deep Matte Charcoal (#161514).
2. Accents: Warm Gold (#B89A5A) for key data/highlights.
3. Text/Lines: Crisp White or Light Grey for readability.
4. Style: Minimalist, flat or subtle 3D matte (not glossy).
5. Mood: Professional, data-driven, trustworthy.
`;

// Helper to enhance prompt using New SDK (if used anywhere)
export async function enhancePrompt(prompt: string, style: 'realistic' | 'infographic'): Promise<string> {
    try {
        const systemPrompt = style === 'realistic'
            ? "You are an expert prompt engineer using the VIET BAO PRO Framework. Convert the input into a detailed, high-quality realistic image prompt."
            : "You are an expert prompt engineer using the VIET BAO PRO Brand Guideline. Convert the input into a detailed infographic prompt.";

        const result = await genAI.models.generateContent({
            model: "gemini-1.5-flash",
            config: { systemInstruction: systemPrompt },
            contents: [{ role: 'user', parts: [{ text: prompt }] }]
        });

        return result.response.text().trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return prompt;
    }
}

export function getImageModel() {
    // Placeholder or implement if needed using genAI.models
    return genAI.models;
}

export function getTextModel() {
    return genAI.models;
}

export { genAI };

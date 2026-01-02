import { GoogleGenerativeAI } from "@google/generative-ai";
import { google } from "googleapis";
import { Readable } from "stream";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");

// Initialize Drive API
const getDriveService = () => {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        throw new Error("Google Service Account credentials missing");
    }

    const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.file']
    });

    return google.drive({ version: 'v3', auth });
};

// Upload to Drive
export async function uploadToDrive(base64Data: string, fileName: string, mimeType: string) {
    try {
        const drive = getDriveService();
        const buffer = Buffer.from(base64Data, 'base64');
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

// Get models
export function getImageModel() {
    return genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
    });
}

export function getTextModel() {
    return genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
}

// VIET BAO PRO Frameworks
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

// Enhance prompt based on style
export async function enhancePrompt(prompt: string, style: 'realistic' | 'infographic'): Promise<string> {
    try {
        const model = getTextModel();
        let systemInstruction = "";

        if (style === 'realistic') {
            systemInstruction = `You are an expert prompt engineer using the VIET BAO PRO Framework.
            ${REALISTIC_FRAMEWORK}
            
            TASK: Convert the user's input into a FULL detailed prompt following the Master Formula 5-Layers.
            - Input: "${prompt}"
            - Output: A single paragraph efficient prompt.
            - STRICTLY follow the Lighting & Color rules (Soft Graphite & Warm Gold, No Blue/Neon).`;
        } else { // infographic
            systemInstruction = `You are an expert design prompter using the VIET BAO PRO Brand Guideline.
            ${INFOGRAPHIC_FRAMEWORK}
            
            TASK: Convert the user's input into a prompt for a high-quality infographic/diagram.
            - Input: "${prompt}"
            - Output: A single paragraph detailed prompt.
            - Focus on: Dark mode, clean layout, Gold accents, legible composition.`;
        }

        const result = await model.generateContent(systemInstruction);
        return result.response.text().trim();
    } catch (error) {
        console.error("Error enhancing prompt:", error);
        return `${prompt}. Style: ${style === 'realistic' ? 'Cinematic, warm gold lighting, dark background' : 'Dark mode infographic, gold accents'}`;
    }
}

export { genAI };

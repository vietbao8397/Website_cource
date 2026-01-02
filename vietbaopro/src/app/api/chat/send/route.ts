import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { KNOWLEDGE_BASE, SOPHIA_PERSONA } from "@/lib/chatbot-data";

// Type for chat history
interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { message, history } = body;

        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Check User Status
        const { data: { user } } = await supabase.auth.getUser();
        let isStudent = false;
        let userName = "bạn";

        if (user) {
            // Get profile for name
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (profile?.full_name) userName = profile.full_name;

            // Check if user bought ANY course (check orders table)
            const { data: orders } = await supabase
                .from("orders")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "completed") // Assuming 'completed' means paid
                .limit(1);

            if (orders && orders.length > 0) {
                isStudent = true;
            }
        }

        // 2. Construct System Prompt based on Role
        let roleInstruction = "";

        if (isStudent) {
            // STUDENT MODE
            roleInstruction = `
            USER STATUS: STUDENT (Đã mua khóa học).
            GOAL: Tutor & Support.
            INSTRUCTION:
            - Trả lời chi tiết, chuyên sâu vào kiến thức.
            - Giải thích cặn kẽ các khái niệm nếu được hỏi.
            - Hỗ trợ tối đa để học viên hiểu bài.
            - Vẫn giữ giọng văn thân thiện của Sophia.
            - Chào người dùng bằng tên: "${userName}" nếu biết.
            `;
        } else {
            // GUEST MODE
            roleInstruction = `
            USER STATUS: GUEST (Chưa mua khóa học).
            GOAL: Consultant & Sales.
            INSTRUCTION:
            - Trả lời nhiệt tình nhưng CHỈ TÓM TẮT/SƠ LƯỢC nội dung.
            - KHÔNG giải thích sâu về kiến thức chuyên môn (RAG).
            - Luôn khéo léo lồng ghép lời mời mua khóa học để được học chi tiết.
            - Gợi ý: "Dạ phần này trong khóa học thầy giảng kỹ lắm á, mình đăng ký để Sophia hỗ trợ tốt hơn nha ^^"
            - Chào người dùng bằng tên: "${userName}" nếu biết.
            `;
        }

        const systemPrompt = `
        ${SOPHIA_PERSONA}
        
        ${roleInstruction}

        KNOWLEDGE BASE:
        ${JSON.stringify(KNOWLEDGE_BASE, null, 2)}
        `;

        // 3. Call Gemini
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "AI Key missing" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: systemPrompt
        });

        // Convert history to Gemini format
        const chat = model.startChat({
            history: history || [],
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const response = result.response.text();

        return NextResponse.json({
            response: response,
            isStudent: isStudent
        });

    } catch (error: unknown) {
        console.error("Chat error:", error);
        return NextResponse.json({
            error: "Sophia đang bận xíu, thử lại sau nha ^^"
        }, { status: 500 });
    }
}

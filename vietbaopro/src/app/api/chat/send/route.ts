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
        const { message, history } = body; // history from client is now optional/fallback

        if (!message) {
            return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        const supabase = await createClient();

        // 1. Check User Status
        const { data: { user } } = await supabase.auth.getUser();
        let isStudent = false;
        let userName = "bạn";
        let dbHistory: Message[] = [];

        if (user) {
            // Get profile for name
            const { data: profile } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", user.id)
                .single();

            if (profile?.full_name) userName = profile.full_name;

            // Check purchase status
            const { data: orders } = await supabase
                .from("orders")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "completed")
                .limit(1);

            if (orders && orders.length > 0) {
                isStudent = true;
            }

            // --- SAVE USER MESSAGE ---
            await supabase.from("chat_history").insert({
                user_id: user.id,
                role: "user",
                content: message,
                created_at: new Date().toISOString()
            });

            // --- LOAD HISTORY FROM DB FOR CONTEXT ---
            // Get last 20 messages for context window
            const { data: recentMessages } = await supabase
                .from("chat_history")
                .select("role, content")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false }) // Get latest first
                .limit(20);

            if (recentMessages) {
                // Reverse back to chronological order
                dbHistory = recentMessages.reverse().map(msg => ({
                    role: msg.role as "user" | "model",
                    parts: [{ text: msg.content }]
                }));
            }
        }

        // Use DB history if available, else client history
        // Note: dbHistory already includes the user's latest message we just saved? 
        // No, created_at might be same, but let's be safe.
        // Actually, for Gemini call, we need [History] + [Current Message].
        // If we use dbHistory (which includes latest User msg), we pass it as 'history' to chat.startChat? 
        // No, startChat takes 'history' (previous messages).
        // So we should exclude the very last user message from 'history' passed to startChat, OR just pass it all and send empty string? No.

        // Correct approach: 
        // History passed to Gemini = Previous conversation.
        // New Message = Current User Input.

        // Logic fix:
        // Use history from Client OR DB (excluding latest insert). 
        // Let's stick to using `dbHistory` but we need to remove the message we just inserted if it was returned?
        // Wait, insert is async. Select logic usually sees it.
        // Let's rely on constructing the history array manually for Gemini.

        const contextHistory = user && dbHistory.length > 0 ? dbHistory.slice(0, -1) : (history || []);
        // Remove the last message (which is the current user message) from history context 
        // because chat.sendMessage(message) appends it automatically?
        // Actually, gemini `startChat` history should NOT contain the new message we are about to send via `sendMessage`.

        // If I saved user message to DB, `dbHistory` has it at the end.
        // So contextHistory should be `dbHistory.slice(0, -1)`.

        // 2. Construct System Prompt based on Role
        let roleInstruction = "";

        if (isStudent) {
            // STUDENT MODE
            roleInstruction = `
            USER STATUS: STUDENT (Đã mua khóa học).
            GOAL: Tutor & Support.
            Current User Name: "${userName}".
            INSTRUCTION:
            - Trả lời chi tiết, chuyên sâu vào kiến thức.
            - Giải thích cặn kẽ các khái niệm nếu được hỏi.
            - Hỗ trợ tối đa để học viên hiểu bài.
            - Vẫn giữ giọng văn thân thiện của Sophia.
            - Sử dụng lịch sử chat để nhớ ngữ cảnh cũ (nếu có).
            `;
        } else {
            // GUEST MODE
            roleInstruction = `
            USER STATUS: GUEST (Chưa mua khóa học).
            GOAL: Consultant & Sales.
            Current User Name: "${userName}".
            INSTRUCTION:
            - Trả lời nhiệt tình nhưng CHỈ TÓM TẮT/SƠ LƯỢC nội dung.
            - KHÔNG giải thích sâu về kiến thức chuyên môn (RAG).
            - Luôn khéo léo lồng ghép lời mời mua khóa học để được học chi tiết.
            - Gợi ý: "Dạ phần này trong khóa học thầy giảng kỹ lắm á, mình đăng ký để Sophia hỗ trợ tốt hơn nha ^^"
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

        // Use contextHistory derived from DB (for students) or Client (for guests)
        const chat = model.startChat({
            history: contextHistory,
            generationConfig: {
                maxOutputTokens: 500,
            },
        });

        const result = await chat.sendMessage(message);
        const responseText = result.response.text();

        // --- SAVE MODEL RESPONSE ONLY IF USER IS LOGGED IN ---
        if (user) {
            await supabase.from("chat_history").insert({
                user_id: user.id,
                role: "model",
                content: responseText,
                created_at: new Date().toISOString()
            });
        }

        return NextResponse.json({
            response: responseText,
            isStudent: isStudent
        });

    } catch (error: unknown) {
        console.error("Chat error:", error);
        return NextResponse.json({
            error: "Sophia đang bận xíu, thử lại sau nha ^^"
        }, { status: 500 });
    }
}

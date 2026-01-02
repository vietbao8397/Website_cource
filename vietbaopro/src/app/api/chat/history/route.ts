import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ messages: [] }); // Guest has no persistent history
        }

        const { data: messages, error } = await supabase
            .from("chat_history")
            .select("role, content, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });

        if (error) throw error;

        // Map to format suitable for frontend & Gemini
        const formattedMessages = messages.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }]
        }));

        return NextResponse.json({ messages: formattedMessages });

    } catch (error) {
        console.error("Fetch history error:", error);
        return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
    }
}

import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
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

        // Get latest 10 events with related info
        const { data: events } = await supabase
            .from("customer_events")
            .select(`
                id,
                email,
                event_type,
                event_data,
                created_at
            `)
            .order("created_at", { ascending: false })
            .limit(10);

        const eventLabels: Record<string, { label: string; emoji: string }> = {
            resource_download: { label: "Tải tài nguyên", emoji: "📥" },
            checkout_view: { label: "Xem checkout", emoji: "🛒" },
            checkout_abandon: { label: "Bỏ checkout", emoji: "🔥" },
            purchase: { label: "Mua hàng", emoji: "💰" },
            login: { label: "Đăng nhập", emoji: "🔐" },
        };

        const activities = (events || []).map(event => {
            const eventInfo = eventLabels[event.event_type] || {
                label: event.event_type,
                emoji: "📋"
            };

            // Extract name from email
            const emailParts = event.email.split("@");
            const displayName = emailParts[0];

            // Get details from event_data
            const eventData = event.event_data as Record<string, unknown> || {};
            let detail = "";

            if (event.event_type === "purchase" && eventData.course_name) {
                detail = `khóa "${eventData.course_name}"`;
            } else if (event.event_type === "resource_download" && eventData.resource_name) {
                detail = `"${eventData.resource_name}"`;
            } else if (event.event_type === "checkout_view" && eventData.course_name) {
                detail = `khóa "${eventData.course_name}"`;
            }

            // Format time
            const time = new Date(event.created_at).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
            });

            return {
                id: event.id,
                time,
                emoji: eventInfo.emoji,
                action: eventInfo.label,
                user: displayName,
                detail,
                amount: event.event_type === "purchase" ? eventData.amount : null,
            };
        });

        return NextResponse.json({
            success: true,
            activities,
        });
    } catch (error) {
        console.error("Dashboard activity error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

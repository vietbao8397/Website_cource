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

        // 1. Orders pending payment
        const { count: pendingOrders } = await supabase
            .from("orders")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending_payment");

        // 2. Hot leads (from pipeline)
        const { count: hotLeads } = await supabase
            .from("customer_pipeline")
            .select("id", { count: "exact", head: true })
            .eq("stage", "hot_lead");

        // 3. Cart abandonment (prospects who viewed checkout but didn't buy)
        const { count: cartAbandonment } = await supabase
            .from("customer_pipeline")
            .select("id", { count: "exact", head: true })
            .eq("stage", "prospect");

        // 4. Emails pending
        const { count: pendingEmails } = await supabase
            .from("email_queue")
            .select("id", { count: "exact", head: true })
            .eq("status", "pending");

        return NextResponse.json({
            success: true,
            actions: [
                {
                    id: "pending_orders",
                    label: "Chờ xác nhận",
                    emoji: "📦",
                    count: pendingOrders || 0,
                    link: "/admin/orders?status=pending_payment",
                },
                {
                    id: "hot_leads",
                    label: "Hot Leads",
                    emoji: "🔥",
                    count: hotLeads || 0,
                    link: "/admin/pipeline?stage=hot_lead",
                },
                {
                    id: "cart_abandonment",
                    label: "Bỏ checkout",
                    emoji: "🛒",
                    count: cartAbandonment || 0,
                    link: "/admin/pipeline?stage=prospect",
                },
                {
                    id: "pending_emails",
                    label: "Email chờ",
                    emoji: "✉️",
                    count: pendingEmails || 0,
                    link: "/admin/emails",
                },
            ],
        });
    } catch (error) {
        console.error("Dashboard actions error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

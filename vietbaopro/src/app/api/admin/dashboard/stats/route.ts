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

        // Date calculations
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get all completed orders
        const { data: orders } = await supabase
            .from("orders")
            .select("final_price, created_at, status")
            .eq("status", "completed");

        const allOrders = orders || [];

        // Calculate revenue for different periods
        const todayRevenue = allOrders
            .filter(o => new Date(o.created_at) >= today)
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        const yesterdayRevenue = allOrders
            .filter(o => {
                const d = new Date(o.created_at);
                return d >= yesterday && d < today;
            })
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        const thisWeekRevenue = allOrders
            .filter(o => new Date(o.created_at) >= thisWeekStart)
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        const lastWeekRevenue = allOrders
            .filter(o => {
                const d = new Date(o.created_at);
                return d >= lastWeekStart && d < lastWeekEnd;
            })
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        const thisMonthRevenue = allOrders
            .filter(o => new Date(o.created_at) >= thisMonthStart)
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        const lastMonthRevenue = allOrders
            .filter(o => {
                const d = new Date(o.created_at);
                return d >= lastMonthStart && d <= lastMonthEnd;
            })
            .reduce((sum, o) => sum + (o.final_price || 0), 0);

        // Order counts
        const todayOrders = allOrders.filter(o => new Date(o.created_at) >= today).length;
        const yesterdayOrders = allOrders.filter(o => {
            const d = new Date(o.created_at);
            return d >= yesterday && d < today;
        }).length;

        // Average order value
        const avgOrderValue = allOrders.length > 0
            ? allOrders.reduce((sum, o) => sum + (o.final_price || 0), 0) / allOrders.length
            : 0;

        // Conversion rate calculation
        // Conversion = purchases / checkout_views
        const { data: checkoutViews } = await supabase
            .from("customer_events")
            .select("id")
            .eq("event_type", "checkout_view")
            .gte("created_at", thisWeekStart.toISOString());


        const { data: purchases } = await supabase
            .from("customer_events")
            .select("id")
            .eq("event_type", "purchase")
            .gte("created_at", thisWeekStart.toISOString());

        const checkoutCount = checkoutViews?.length || 0;
        const purchaseCount = purchases?.length || 0;
        const conversionRate = checkoutCount > 0
            ? ((purchaseCount / checkoutCount) * 100).toFixed(1)
            : "0";

        // Calculate percentage changes
        const revenueChange = lastWeekRevenue > 0
            ? (((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100).toFixed(0)
            : thisWeekRevenue > 0 ? "+100" : "0";

        const orderChange = yesterdayOrders > 0
            ? todayOrders - yesterdayOrders
            : todayOrders;

        return NextResponse.json({
            success: true,
            stats: {
                revenue: {
                    today: todayRevenue,
                    yesterday: yesterdayRevenue,
                    thisWeek: thisWeekRevenue,
                    lastWeek: lastWeekRevenue,
                    thisMonth: thisMonthRevenue,
                    lastMonth: lastMonthRevenue,
                    weekChange: revenueChange,
                },
                orders: {
                    today: todayOrders,
                    yesterday: yesterdayOrders,
                    total: allOrders.length,
                    change: orderChange,
                },
                avgOrderValue: Math.round(avgOrderValue),
                conversionRate: parseFloat(conversionRate as string),
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

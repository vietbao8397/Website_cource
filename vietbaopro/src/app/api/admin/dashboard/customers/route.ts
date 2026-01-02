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

        const thisWeekStart = new Date(today);
        thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Get all profiles (customers)
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, created_at");

        const allProfiles = profiles || [];

        // New customers
        const todayCustomers = allProfiles.filter(p =>
            new Date(p.created_at) >= today
        ).length;

        const thisWeekCustomers = allProfiles.filter(p =>
            new Date(p.created_at) >= thisWeekStart
        ).length;

        const thisMonthCustomers = allProfiles.filter(p =>
            new Date(p.created_at) >= thisMonthStart
        ).length;

        const lastMonthCustomers = allProfiles.filter(p => {
            const d = new Date(p.created_at);
            return d >= lastMonthStart && d <= lastMonthEnd;
        }).length;

        const monthChange = lastMonthCustomers > 0
            ? (((thisMonthCustomers - lastMonthCustomers) / lastMonthCustomers) * 100).toFixed(0)
            : thisMonthCustomers > 0 ? "+100" : "0";

        // Pipeline distribution
        const { data: pipeline } = await supabase
            .from("customer_pipeline")
            .select("stage");

        const pipelineData = pipeline || [];

        const stageOrder = ['visitor', 'lead', 'prospect', 'hot_lead', 'customer', 'repeat_customer'];
        const stageLabels: Record<string, string> = {
            visitor: 'Visitor',
            lead: 'Lead',
            prospect: 'Prospect',
            hot_lead: 'Hot Lead',
            customer: 'Customer',
            repeat_customer: 'VIP',
        };

        const distribution = stageOrder.map(stage => {
            const count = pipelineData.filter(p => p.stage === stage).length;
            return {
                stage,
                label: stageLabels[stage] || stage,
                count,
                percentage: pipelineData.length > 0
                    ? Math.round((count / pipelineData.length) * 100)
                    : 0,
            };
        });

        return NextResponse.json({
            success: true,
            customers: {
                new: {
                    today: todayCustomers,
                    thisWeek: thisWeekCustomers,
                    thisMonth: thisMonthCustomers,
                    lastMonth: lastMonthCustomers,
                    monthChange,
                },
                total: allProfiles.length,
                pipelineTotal: pipelineData.length,
                distribution,
            },
        });
    } catch (error) {
        console.error("Dashboard customers error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

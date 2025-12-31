import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - List pipeline customers with filtering
export async function GET(request: NextRequest) {
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

        // Parse query params
        const { searchParams } = new URL(request.url);
        const stage = searchParams.get("stage");
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Build query
        let query = supabase
            .from("customer_pipeline")
            .select("*", { count: "exact" })
            .order("last_activity_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (stage && stage !== "all") {
            query = query.eq("stage", stage);
        }

        if (search) {
            query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
        }

        const { data: customers, count, error } = await query;

        if (error) {
            console.error("Pipeline fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch pipeline" }, { status: 500 });
        }

        // Get stage counts for summary
        const { data: stageCounts } = await supabase
            .from("customer_pipeline")
            .select("stage");

        const counts: Record<string, number> = {
            visitor: 0,
            lead: 0,
            prospect: 0,
            hot_lead: 0,
            customer: 0,
            repeat_customer: 0,
        };

        stageCounts?.forEach((c) => {
            if (counts[c.stage] !== undefined) {
                counts[c.stage]++;
            }
        });

        return NextResponse.json({
            success: true,
            customers,
            total: count,
            stageCounts: counts,
        });
    } catch (error) {
        console.error("Pipeline error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

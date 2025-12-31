import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { performFullBackup } from "@/lib/backup-service";

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const result = await performFullBackup();
        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json({ error: result.error }, { status: 500 });
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

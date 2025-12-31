import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listMediaLibrary } from "@/lib/drive-upload";

export async function GET(request: NextRequest) {
    const supabase = await createClient();

    // 1. Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const files = await listMediaLibrary();
        return NextResponse.json({ success: true, files });
    } catch (error: any) {
        console.error("List files handler error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

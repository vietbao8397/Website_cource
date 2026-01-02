import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// PATCH - Update email step
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
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

        // Update allowed fields
        const allowedFields = ["subject", "content", "delay_hours", "send_at_time", "is_active"];
        const updateData: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const { data: updated, error } = await supabase
            .from("email_sequence_steps")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Update step error:", error);
            return NextResponse.json({ error: "Failed to update step" }, { status: 500 });
        }

        return NextResponse.json({ success: true, step: updated });
    } catch (error) {
        console.error("Update step error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

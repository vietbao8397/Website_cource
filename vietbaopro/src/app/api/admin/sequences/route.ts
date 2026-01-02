import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - List all sequences
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

        const { data: sequences, error } = await supabase
            .from("email_sequences")
            .select(`
                *,
                email_sequence_steps (
                    id,
                    step_order,
                    delay_hours,
                    send_at_time,
                    subject,
                    content,
                    is_active
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Sequences fetch error:", error);
            return NextResponse.json({ error: "Failed to fetch sequences" }, { status: 500 });
        }

        return NextResponse.json({ success: true, sequences });
    } catch (error) {
        console.error("Sequences error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// POST - Create new sequence
export async function POST(request: NextRequest) {
    try {
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

        const { name, description, trigger_event, trigger_filter, is_active = true } = body;

        if (!name || !trigger_event) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        const { data: sequence, error } = await supabase
            .from("email_sequences")
            .insert({
                name,
                description,
                trigger_event,
                trigger_filter: trigger_filter || {},
                is_active,
            })
            .select()
            .single();

        if (error) {
            console.error("Create sequence error:", error);
            return NextResponse.json({ error: "Failed to create sequence" }, { status: 500 });
        }

        return NextResponse.json({ success: true, sequence });
    } catch (error) {
        console.error("Create sequence error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

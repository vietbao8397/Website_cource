import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// GET - Get customer detail with events
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        // Fetch customer
        const { data: customer, error: customerError } = await supabase
            .from("customer_pipeline")
            .select("*")
            .eq("id", id)
            .single();

        if (customerError || !customer) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }

        // Fetch events
        const { data: events } = await supabase
            .from("customer_events")
            .select("*")
            .eq("email", customer.email)
            .order("created_at", { ascending: false })
            .limit(50);

        // Fetch queued/sent emails
        const { data: emails } = await supabase
            .from("email_queue")
            .select(`
                *,
                email_sequences (name),
                email_sequence_steps (subject, step_order)
            `)
            .eq("recipient_email", customer.email)
            .order("scheduled_at", { ascending: false })
            .limit(20);

        // Fetch orders if user exists
        let orders = null;
        if (customer.user_id) {
            const { data: orderData } = await supabase
                .from("orders")
                .select(`
                    id,
                    amount,
                    status,
                    created_at,
                    courses (id, title, slug)
                `)
                .eq("user_id", customer.user_id)
                .order("created_at", { ascending: false });
            orders = orderData;
        }

        return NextResponse.json({
            success: true,
            customer,
            events,
            emails,
            orders,
        });
    } catch (error) {
        console.error("Customer detail error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// PATCH - Update customer
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
        const allowedFields = ["stage", "tags", "notes", "full_name", "phone", "source"];
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field];
            }
        }

        const { data: updated, error } = await supabase
            .from("customer_pipeline")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Update error:", error);
            return NextResponse.json({ error: "Failed to update customer" }, { status: 500 });
        }

        return NextResponse.json({ success: true, customer: updated });
    } catch (error) {
        console.error("Update customer error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

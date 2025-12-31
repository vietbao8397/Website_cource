import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Event types and their corresponding pipeline stages
const STAGE_TRANSITIONS: Record<string, string> = {
    resource_download: "lead",
    checkout_view: "prospect",
    checkout_abandon: "hot_lead",
    purchase: "customer",
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, eventType, eventData = {}, userId, fullName, phone } = body;

        if (!email || !eventType) {
            return NextResponse.json(
                { error: "Missing required fields: email and eventType" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 1. Record the event
        const { error: eventError } = await supabase
            .from("customer_events")
            .insert({
                email,
                user_id: userId || null,
                event_type: eventType,
                event_data: eventData,
            });

        if (eventError) {
            console.error("Error recording event:", eventError);
            return NextResponse.json(
                { error: "Failed to record event" },
                { status: 500 }
            );
        }

        // 2. Update or create pipeline record
        const newStage = STAGE_TRANSITIONS[eventType];

        // Check if customer exists in pipeline
        const { data: existingCustomer } = await supabase
            .from("customer_pipeline")
            .select("id, stage, tags")
            .eq("email", email)
            .single();

        if (existingCustomer) {
            // Update existing customer
            const updateData: Record<string, unknown> = {
                last_activity_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Only upgrade stage (never downgrade)
            const stageOrder = ["visitor", "lead", "prospect", "hot_lead", "customer", "repeat_customer"];
            const currentStageIndex = stageOrder.indexOf(existingCustomer.stage);
            const newStageIndex = newStage ? stageOrder.indexOf(newStage) : -1;

            if (newStageIndex > currentStageIndex) {
                updateData.stage = newStage;
            }

            // Handle repeat customer
            if (eventType === "purchase" && existingCustomer.stage === "customer") {
                updateData.stage = "repeat_customer";
            }

            // Add tags based on event
            if (eventData.resource_id || eventData.course_id) {
                const newTag = eventData.resource_id
                    ? `resource_${eventData.resource_id}`
                    : `course_${eventData.course_id}`;
                const currentTags = existingCustomer.tags || [];
                if (!currentTags.includes(newTag)) {
                    updateData.tags = [...currentTags, newTag];
                }
            }

            if (fullName) updateData.full_name = fullName;
            if (phone) updateData.phone = phone;
            if (userId) updateData.user_id = userId;

            await supabase
                .from("customer_pipeline")
                .update(updateData)
                .eq("id", existingCustomer.id);
        } else {
            // Create new customer in pipeline
            const tags: string[] = [];
            if (eventData.resource_id) tags.push(`resource_${eventData.resource_id}`);
            if (eventData.course_id) tags.push(`course_${eventData.course_id}`);

            await supabase
                .from("customer_pipeline")
                .insert({
                    email,
                    user_id: userId || null,
                    full_name: fullName || null,
                    phone: phone || null,
                    stage: newStage || "visitor",
                    tags,
                    source: eventData.source || "organic",
                });
        }

        // 3. Queue emails for matching sequences
        await queueSequenceEmails(supabase, email, eventType, eventData, fullName);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Tracking error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

async function queueSequenceEmails(
    supabase: any,
    email: string,
    eventType: string,
    eventData: Record<string, unknown>,
    recipientName?: string
) {
    // Find active sequences for this event type
    const { data: sequences } = await supabase
        .from("email_sequences")
        .select(`
            id,
            trigger_filter,
            email_sequence_steps (
                id,
                step_order,
                delay_hours,
                subject,
                content,
                is_active
            )
        `)
        .eq("trigger_event", eventType)
        .eq("is_active", true);

    if (!sequences || sequences.length === 0) return;

    const now = new Date();

    for (const sequence of sequences) {
        // Check trigger filter if exists
        const filter = sequence.trigger_filter;
        if (filter && Object.keys(filter).length > 0) {
            const filterMatch = Object.entries(filter).every(
                ([key, value]) => eventData[key] === value
            );
            if (!filterMatch) continue;
        }

        // Queue each active step
        const steps = sequence.email_sequence_steps?.filter((s: any) => s.is_active) || [];

        for (const step of steps) {
            const scheduledAt = new Date(now.getTime() + step.delay_hours * 60 * 60 * 1000);

            // Check if this email is already queued
            const { data: existing } = await supabase
                .from("email_queue")
                .select("id")
                .eq("recipient_email", email)
                .eq("step_id", step.id)
                .eq("status", "pending")
                .single();

            if (!existing) {
                await supabase
                    .from("email_queue")
                    .insert({
                        recipient_email: email,
                        recipient_name: recipientName || null,
                        sequence_id: sequence.id,
                        step_id: step.id,
                        scheduled_at: scheduledAt.toISOString(),
                        metadata: eventData,
                    });
            }
        }
    }
}

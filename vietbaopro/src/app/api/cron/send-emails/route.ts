import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { sendAutomatedEmail } from "@/lib/email";

// This endpoint should be called by a cron job (Vercel Cron or external service)
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/send-emails", "schedule": "*/15 * * * *" }] }

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (optional but recommended)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createClient();
        const now = new Date().toISOString();

        // Fetch pending emails that are due
        const { data: pendingEmails, error } = await supabase
            .from("email_queue")
            .select(`
                *,
                email_sequence_steps (
                    subject,
                    content
                )
            `)
            .eq("status", "pending")
            .lte("scheduled_at", now)
            .order("scheduled_at", { ascending: true })
            .limit(50); // Process in batches

        if (error) {
            console.error("Fetch queue error:", error);
            return NextResponse.json({ error: "Failed to fetch email queue" }, { status: 500 });
        }

        if (!pendingEmails || pendingEmails.length === 0) {
            return NextResponse.json({ success: true, processed: 0 });
        }

        let sentCount = 0;
        let failedCount = 0;

        for (const email of pendingEmails) {
            try {
                const step = email.email_sequence_steps;
                if (!step) continue;

                // Replace template variables
                const metadata = email.metadata || {};
                let subject = step.subject;
                let content = step.content;

                // Simple variable replacement
                const variables: Record<string, string> = {
                    name: email.recipient_name || "bạn",
                    email: email.recipient_email,
                    course_name: metadata.course_name || "",
                    resource_name: metadata.resource_name || "",
                };

                for (const [key, value] of Object.entries(variables)) {
                    subject = subject.replace(new RegExp(`{{${key}}}`, "g"), value);
                    content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
                }

                // Send email using Resend
                await sendAutomatedEmail({
                    to: email.recipient_email,
                    subject,
                    html: content,
                });

                // Mark as sent
                await supabase
                    .from("email_queue")
                    .update({
                        status: "sent",
                        sent_at: new Date().toISOString(),
                    })
                    .eq("id", email.id);

                sentCount++;
            } catch (sendError) {
                console.error(`Failed to send email ${email.id}:`, sendError);

                // Mark as failed
                await supabase
                    .from("email_queue")
                    .update({
                        status: "failed",
                        error_message: String(sendError),
                    })
                    .eq("id", email.id);

                failedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            processed: pendingEmails.length,
            sent: sentCount,
            failed: failedCount,
        });
    } catch (error) {
        console.error("Cron error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

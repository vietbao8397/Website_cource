import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getYoutubeClient } from "@/lib/google-drive"; // Renamed or still google-drive.ts
import { parseYouTubeDuration } from "@/lib/youtube";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const youtube = getYoutubeClient();
        const response = await youtube.videos.list({
            id: [videoId],
            part: ["snippet", "contentDetails"],
        });

        const video = response.data.items?.[0];

        if (!video) {
            return NextResponse.json({ error: "Video not found" }, { status: 404 });
        }

        const title = video.snippet?.title;
        const durationISO = video.contentDetails?.duration;
        const duration_minutes = durationISO ? parseYouTubeDuration(durationISO) : 0;

        return NextResponse.json({
            title,
            duration_minutes,
        });

    } catch (error: any) {
        console.error("YouTube API error:", error);
        return NextResponse.json({
            error: "Failed to fetch video info",
            details: error.message
        }, { status: 500 });
    }
}

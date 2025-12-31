"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./page.module.css";

interface LessonPlayerProps {
    lessonId: string;
    courseId: string;
    youtubeVideoId: string;
    title: string;
    description: string | null;
    isCompleted: boolean;
    nextLessonUrl: string | null;
    prevLessonUrl: string | null;
}

export default function LessonPlayer({
    lessonId,
    courseId,
    youtubeVideoId,
    title,
    description,
    isCompleted: initialCompleted,
    nextLessonUrl,
    prevLessonUrl,
}: LessonPlayerProps) {
    const router = useRouter();
    const [isCompleted, setIsCompleted] = useState(initialCompleted);
    const [isMarking, setIsMarking] = useState(false);

    const handleMarkComplete = async () => {
        setIsMarking(true);
        const supabase = createClient();

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // Update or insert lesson progress
        const { error: progressError } = await supabase
            .from("lesson_progress")
            .upsert(
                {
                    user_id: user.id,
                    lesson_id: lessonId,
                    course_id: courseId,
                    completed: !isCompleted,
                    last_watched_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,lesson_id",
                }
            );

        if (progressError) {
            console.error("Error updating progress:", progressError);
            setIsMarking(false);
            return;
        }

        // Also update the enrollment progress JSON
        const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id, progress")
            .eq("user_id", user.id)
            .eq("course_id", courseId)
            .single();

        if (enrollment) {
            const newProgress = {
                ...(enrollment.progress || {}),
                [lessonId]: !isCompleted,
            };

            await supabase
                .from("enrollments")
                .update({ progress: newProgress })
                .eq("id", enrollment.id);
        }

        setIsCompleted(!isCompleted);
        setIsMarking(false);
        router.refresh();
    };

    const handleNextLesson = () => {
        if (nextLessonUrl) {
            router.push(nextLessonUrl);
        }
    };

    return (
        <div className={styles.playerContainer}>
            {/* Video */}
            <div className={styles.videoWrapper}>
                {youtubeVideoId ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.video}
                    />
                ) : (
                    <div className={styles.noVideo}>
                        <span>🎬</span>
                        <p>Video đang được cập nhật</p>
                    </div>
                )}
            </div>

            {/* Lesson Info */}
            <div className={styles.lessonInfo}>
                <div className={styles.lessonHeader}>
                    <h1>{title}</h1>
                    <button
                        onClick={handleMarkComplete}
                        disabled={isMarking}
                        className={`btn ${isCompleted ? "btn-secondary" : "btn-primary"}`}
                    >
                        {isMarking
                            ? "Đang xử lý..."
                            : isCompleted
                                ? "✓ Đã hoàn thành"
                                : "Đánh dấu hoàn thành"}
                    </button>
                </div>

                {description && (
                    <div className={styles.lessonDescription}>
                        <p>{description}</p>
                    </div>
                )}

                {/* Navigation */}
                <div className={styles.lessonNav}>
                    {prevLessonUrl ? (
                        <Link href={prevLessonUrl} className="btn btn-ghost">
                            ← Bài trước
                        </Link>
                    ) : (
                        <span></span>
                    )}

                    {nextLessonUrl && (
                        <button onClick={handleNextLesson} className="btn btn-primary">
                            Bài tiếp theo →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

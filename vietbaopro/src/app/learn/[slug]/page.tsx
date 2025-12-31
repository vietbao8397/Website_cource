import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header } from "@/components/layout";
import Link from "next/link";
import LessonPlayer from "./LessonPlayer";
import styles from "./page.module.css";

interface Lesson {
    id: string;
    title: string;
    description: string | null;
    youtube_video_id: string | null;
    duration_minutes: number | null;
    chapter_title: string;
    chapter_index: number;
    lesson_index: number;
    is_preview: boolean;
}

interface Course {
    id: string;
    title: string;
    slug: string;
}

// Group lessons by chapter
function groupLessonsByChapter(lessons: Lesson[]) {
    const chapters: { title: string; lessons: Lesson[] }[] = [];

    lessons
        .sort((a, b) => {
            if (a.chapter_index !== b.chapter_index) {
                return a.chapter_index - b.chapter_index;
            }
            return a.lesson_index - b.lesson_index;
        })
        .forEach((lesson) => {
            const existingChapter = chapters.find(
                (c) => c.title === lesson.chapter_title
            );
            if (existingChapter) {
                existingChapter.lessons.push(lesson);
            } else {
                chapters.push({
                    title: lesson.chapter_title,
                    lessons: [lesson],
                });
            }
        });

    return chapters;
}

export default async function LearnPage({
    params,
    searchParams,
}: {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ lesson?: string }>;
}) {
    const { slug } = await params;
    const { lesson: lessonId } = await searchParams;

    const supabase = await createClient();

    // Check if user is logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/login?redirect=/learn/${slug}`);
    }

    // Fetch course
    const { data: course } = await supabase
        .from("courses")
        .select("id, title, slug")
        .eq("slug", slug)
        .single();

    if (!course) {
        notFound();
    }

    // Check if user is enrolled
    const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id, progress")
        .eq("user_id", user.id)
        .eq("course_id", course.id)
        .single();

    if (!enrollment) {
        redirect(`/course/${slug}?error=not_enrolled`);
    }

    // Fetch all lessons for this course
    const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("course_id", course.id)
        .order("chapter_index")
        .order("lesson_index");

    // Fetch user progress for all lessons in this course
    const { data: lessonProgress } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", user.id)
        .eq("course_id", course.id);

    const progressObj: Record<string, boolean> = {};
    if (lessonProgress) {
        lessonProgress.forEach(lp => {
            progressObj[lp.lesson_id] = lp.completed;
        });
    }

    if (!lessons || lessons.length === 0) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.emptyState}>
                            <h2>Nội dung đang được cập nhật</h2>
                            <p>Khóa học này chưa có bài học nào. Vui lòng quay lại sau.</p>
                            <Link href="/my-learning" className="btn btn-primary">
                                Quay lại
                            </Link>
                        </div>
                    </div>
                </main>
            </>
        );
    }

    // Get current lesson (from URL or first lesson)
    const currentLesson = lessonId
        ? lessons.find((l) => l.id === lessonId)
        : lessons[0];

    if (!currentLesson) {
        redirect(`/learn/${slug}`);
    }

    // Group lessons by chapter
    const chapters = groupLessonsByChapter(lessons);

    // Get progress
    const progress = progressObj;

    // Calculate overall progress
    const completedCount = Object.values(progress).filter(Boolean).length;
    const progressPercent = Math.round((completedCount / lessons.length) * 100);

    // Find next lesson
    const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
    const nextLesson = currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className={styles.learnLayout}>
                    {/* Sidebar - Curriculum */}
                    <aside className={styles.sidebar}>
                        <div className={styles.sidebarHeader}>
                            <Link href="/my-learning" className={styles.backLink}>
                                ← Quay lại
                            </Link>
                            <h2>{course.title}</h2>
                            <div className={styles.overallProgress}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <span>
                                    {completedCount}/{lessons.length} bài ({progressPercent}%)
                                </span>
                            </div>
                        </div>

                        <nav className={styles.curriculum}>
                            {chapters.map((chapter, chapterIndex) => (
                                <div key={chapter.title} className={styles.chapter}>
                                    <div className={styles.chapterHeader}>
                                        <span className={styles.chapterNumber}>
                                            {String(chapterIndex + 1).padStart(2, "0")}
                                        </span>
                                        <span className={styles.chapterTitle}>{chapter.title}</span>
                                    </div>
                                    <ul className={styles.lessonList}>
                                        {chapter.lessons.map((lesson) => {
                                            const isCompleted = progress[lesson.id];
                                            const isActive = lesson.id === currentLesson.id;

                                            return (
                                                <li key={lesson.id}>
                                                    <Link
                                                        href={`/learn/${slug}?lesson=${lesson.id}`}
                                                        className={`${styles.lessonItem} ${isActive ? styles.lessonActive : ""
                                                            } ${isCompleted ? styles.lessonCompleted : ""}`}
                                                    >
                                                        <span className={styles.lessonStatus}>
                                                            {isCompleted ? "✓" : isActive ? "▶" : "○"}
                                                        </span>
                                                        <span className={styles.lessonTitle}>
                                                            {lesson.title}
                                                        </span>
                                                        {lesson.duration_minutes && (
                                                            <span className={styles.lessonDuration}>
                                                                {lesson.duration_minutes} phút
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content - Video Player */}
                    <div className={styles.content}>
                        <LessonPlayer
                            key={currentLesson.id}
                            lessonId={currentLesson.id}
                            courseId={course.id}
                            youtubeVideoId={currentLesson.youtube_video_id || ""}
                            title={currentLesson.title}
                            description={currentLesson.description}
                            isCompleted={!!progress[currentLesson.id]}
                            nextLessonUrl={nextLesson ? `/learn/${slug}?lesson=${nextLesson.id}` : null}
                            prevLessonUrl={prevLesson ? `/learn/${slug}?lesson=${prevLesson.id}` : null}
                        />
                    </div>
                </div>
            </main>
        </>
    );
}

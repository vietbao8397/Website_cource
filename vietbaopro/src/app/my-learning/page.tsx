import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import styles from "./page.module.css";

interface Enrollment {
    id: string;
    progress: Record<string, boolean>;
    completed_at: string | null;
    created_at: string;
    courses: {
        id: string;
        title: string;
        slug: string;
        short_description: string;
        thumbnail_url: string | null;
    }[];
}

interface LessonCount {
    course_id: string;
    count: number;
}

export default async function MyLearningPage() {
    const supabase = await createClient();

    // Check if user is logged in
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/my-learning");
    }

    // Fetch user's enrollments with course info
    const { data: enrollments, error } = await supabase
        .from("enrollments")
        .select(
            `
      id,
      progress,
      completed_at,
      created_at,
      courses (
        id,
        title,
        slug,
        short_description,
        thumbnail_url,
        type,
        resource_url
      )
    `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Get lesson counts for each enrolled course (only for type='course')
    const enrolledCourses = enrollments?.filter(e => (e.courses as any)?.[0]?.type === 'course') || [];
    const courseIds = enrolledCourses.map((e) => (e.courses as any)?.[0]?.id).filter(Boolean);

    let lessonCounts: LessonCount[] = [];
    if (courseIds.length > 0) {
        const { data: lessons } = await supabase
            .from("lessons")
            .select("course_id")
            .in("course_id", courseIds);

        // Count lessons per course
        const countMap: Record<string, number> = {};
        lessons?.forEach((l) => {
            countMap[l.course_id] = (countMap[l.course_id] || 0) + 1;
        });
        lessonCounts = Object.entries(countMap).map(([course_id, count]) => ({
            course_id,
            count,
        }));
    }

    // Calculate progress for each enrollment
    const enrollmentsWithProgress = (enrollments?.map((enrollment) => {
        const course = (enrollment.courses as any)?.[0];
        if (!course) return null;

        const isResource = course.type === 'resource';
        const lessonCount = isResource ? 0 : (lessonCounts.find((lc) => lc.course_id === course.id)?.count || 0);
        const completedCount = isResource ? 0 : Object.values(enrollment.progress || {}).filter(Boolean).length;
        const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

        return {
            ...enrollment,
            course,
            isResource,
            lessonCount,
            completedCount,
            progressPercent,
        };
    }) || []).filter((e): e is NonNullable<typeof e> => e !== null);

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <h1>Nội dung của tôi</h1>
                        <p>Khám phá các khóa học và tài nguyên bạn đã sở hữu</p>
                    </div>

                    {/* Enrollments */}
                    {!enrollmentsWithProgress || enrollmentsWithProgress.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h2>Chưa có nội dung nào</h2>
                            <p>Bạn chưa sở hữu khóa học hay tài nguyên nào. Hãy bắt đầu ngay!</p>
                            <Link href="/courses" className="btn btn-primary">
                                Xem khóa học & tài nguyên
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className={styles.stats}>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>
                                        {enrollmentsWithProgress.filter(e => !e.isResource).length}
                                    </span>
                                    <span className={styles.statLabel}>Khóa học</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>
                                        {enrollmentsWithProgress.filter(e => e.isResource).length}
                                    </span>
                                    <span className={styles.statLabel}>Tài nguyên</span>
                                </div>
                            </div>

                            {/* List */}
                            <div className={styles.courseList}>
                                {enrollmentsWithProgress.map((enrollment) => (
                                    <div key={enrollment.id} className={styles.courseCard}>
                                        <div className={styles.courseThumbnail}>
                                            <div className={styles.thumbnailPlaceholder}>
                                                {enrollment.isResource ? "🎁" : "📚"}
                                            </div>
                                            {enrollment.isResource && (
                                                <div className={styles.resourceBadge}>Tài nguyên</div>
                                            )}
                                            {enrollment.completed_at && !enrollment.isResource && (
                                                <div className={styles.completedBadge}>✓ Hoàn thành</div>
                                            )}
                                        </div>
                                        <div className={styles.courseContent}>
                                            <div className={styles.courseInfo}>
                                                <h3>{enrollment.course.title}</h3>
                                                <p>{enrollment.course.short_description}</p>
                                                {!enrollment.isResource && (
                                                    <div className={styles.courseMeta}>
                                                        <span>
                                                            {enrollment.completedCount}/{enrollment.lessonCount} bài học
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {!enrollment.isResource ? (
                                                <>
                                                    <div className={styles.courseProgress}>
                                                        <div className={styles.progressBar}>
                                                            <div
                                                                className={styles.progressFill}
                                                                style={{ width: `${enrollment.progressPercent}%` }}
                                                            />
                                                        </div>
                                                        <span className={styles.progressText}>
                                                            {enrollment.progressPercent}% hoàn thành
                                                        </span>
                                                    </div>
                                                    <div className={styles.courseActions}>
                                                        <Link
                                                            href={`/learn/${enrollment.course.slug}`}
                                                            className="btn btn-primary"
                                                        >
                                                            {enrollment.progressPercent === 0
                                                                ? "Bắt đầu học"
                                                                : enrollment.progressPercent === 100
                                                                    ? "Xem lại"
                                                                    : "Tiếp tục học"}
                                                        </Link>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className={styles.courseActions}>
                                                    <a
                                                        href={enrollment.course.resource_url || "#"}
                                                        className="btn btn-primary"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        Truy cập ngay
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

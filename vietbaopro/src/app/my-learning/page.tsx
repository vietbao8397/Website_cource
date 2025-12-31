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
    };
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
        thumbnail_url
      )
    `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

    // Get lesson counts for each enrolled course
    const courseIds = enrollments?.map((e) => (e.courses as unknown as Enrollment["courses"]).id) || [];

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
    const enrollmentsWithProgress = enrollments?.map((enrollment) => {
        const course = enrollment.courses as unknown as Enrollment["courses"];
        const lessonCount = lessonCounts.find((lc) => lc.course_id === course.id)?.count || 0;
        const completedCount = Object.values(enrollment.progress || {}).filter(Boolean).length;
        const progressPercent = lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

        return {
            ...enrollment,
            course,
            lessonCount,
            completedCount,
            progressPercent,
        };
    });

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    {/* Page Header */}
                    <div className={styles.pageHeader}>
                        <h1>Khóa học của tôi</h1>
                        <p>Tiếp tục hành trình học tập của bạn</p>
                    </div>

                    {/* Enrollments */}
                    {!enrollmentsWithProgress || enrollmentsWithProgress.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>📚</div>
                            <h2>Chưa có khóa học nào</h2>
                            <p>Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng tôi!</p>
                            <Link href="/courses" className="btn btn-primary">
                                Xem khóa học
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Stats */}
                            <div className={styles.stats}>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>{enrollmentsWithProgress.length}</span>
                                    <span className={styles.statLabel}>Khóa học đã đăng ký</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>
                                        {enrollmentsWithProgress.filter((e) => e.progressPercent > 0 && e.progressPercent < 100).length}
                                    </span>
                                    <span className={styles.statLabel}>Đang học</span>
                                </div>
                                <div className={styles.statCard}>
                                    <span className={styles.statValue}>
                                        {enrollmentsWithProgress.filter((e) => e.completed_at).length}
                                    </span>
                                    <span className={styles.statLabel}>Đã hoàn thành</span>
                                </div>
                            </div>

                            {/* Course List */}
                            <div className={styles.courseList}>
                                {enrollmentsWithProgress.map((enrollment) => (
                                    <div key={enrollment.id} className={styles.courseCard}>
                                        <div className={styles.courseThumbnail}>
                                            <div className={styles.thumbnailPlaceholder}>📚</div>
                                            {enrollment.completed_at && (
                                                <div className={styles.completedBadge}>✓ Đã hoàn thành</div>
                                            )}
                                        </div>
                                        <div className={styles.courseContent}>
                                            <div className={styles.courseInfo}>
                                                <h3>{enrollment.course.title}</h3>
                                                <p>{enrollment.course.short_description}</p>
                                                <div className={styles.courseMeta}>
                                                    <span>
                                                        {enrollment.completedCount}/{enrollment.lessonCount} bài học
                                                    </span>
                                                </div>
                                            </div>
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

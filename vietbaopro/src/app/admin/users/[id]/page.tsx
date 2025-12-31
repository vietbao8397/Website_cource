import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import RevokeButton from "./RevokeButton";
import styles from "./page.module.css";

interface Enrollment {
    id: string;
    course_id: string;
    progress: Record<string, boolean>;
    created_at: string;
    completed_at: string | null;
    courses: {
        id: string;
        title: string;
        slug: string;
    }[];
}

interface Order {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    courses: {
        title: string;
    }[];
}

export default async function UserDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: userId } = await params;
    const supabase = await createClient();

    // Fetch user profile
    const { data: user, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (!user || error) {
        notFound();
    }

    // Fetch user enrollments with course info and lesson counts
    const { data: enrollments } = await supabase
        .from("enrollments")
        .select(`
      id,
      course_id,
      progress,
      created_at,
      completed_at,
      courses (id, title, slug)
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    // Fetch user progress for all lessons
    const { data: userLessonProgress } = await supabase
        .from("lesson_progress")
        .select("course_id, lesson_id, completed")
        .eq("user_id", userId)
        .eq("completed", true);

    const completedCounts: Record<string, number> = {};
    if (userLessonProgress) {
        userLessonProgress.forEach(lp => {
            completedCounts[lp.course_id] = (completedCounts[lp.course_id] || 0) + 1;
        });
    }

    // Fetch lesson counts for enrolled courses
    const courseIds = enrollments?.map((e) => e.course_id) || [];
    let lessonCounts: Record<string, number> = {};

    if (courseIds.length > 0) {
        const { data: lessons } = await supabase
            .from("lessons")
            .select("course_id")
            .in("course_id", courseIds);

        lessons?.forEach((l) => {
            lessonCounts[l.course_id] = (lessonCounts[l.course_id] || 0) + 1;
        });
    }

    // Fetch user orders
    const { data: orders } = await supabase
        .from("orders")
        .select(`
      id,
      amount,
      status,
      created_at,
      courses (title)
    `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    // Calculate stats
    const totalSpent = orders?.filter((o) => o.status === "paid").reduce((sum, o) => sum + o.amount, 0) || 0;
    const totalEnrollments = enrollments?.length || 0;

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function calculateProgress(enrollment: Enrollment): number {
        const lessonCount = lessonCounts[enrollment.course_id] || 0;
        if (lessonCount === 0) return 0;
        const completedCount = completedCounts[enrollment.course_id] || 0;
        return Math.round((completedCount / lessonCount) * 100);
    }

    return (
        <div className={styles.userDetailPage}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/admin/users" className={styles.backLink}>
                    ← Quay lại
                </Link>
                <div className={styles.userHeader}>
                    <div className={styles.avatar}>
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name || ""} />
                        ) : (
                            <span>{(user.full_name || user.email || "U").charAt(0).toUpperCase()}</span>
                        )}
                    </div>
                    <div className={styles.userMeta}>
                        <h1>{user.full_name || "Chưa đặt tên"}</h1>
                        <p>{user.email}</p>
                        <span className={`${styles.roleBadge} ${styles[`role_${user.role}`]}`}>
                            {user.role === "admin" ? "👑 Admin" : "📚 Học viên"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{totalEnrollments}</span>
                    <span className={styles.statLabel}>Khóa học đã đăng ký</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{formatPrice(totalSpent)}</span>
                    <span className={styles.statLabel}>Tổng giá trị đơn hàng</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statValue}>{orders?.length || 0}</span>
                    <span className={styles.statLabel}>Tổng đơn hàng</span>
                </div>
            </div>

            {/* Enrollments */}
            <section className={styles.section}>
                <h2>📚 Khóa học đã đăng ký ({totalEnrollments})</h2>
                {enrollments && enrollments.length > 0 ? (
                    <div className={styles.enrollmentsList}>
                        {enrollments.map((enrollment) => {
                            const course = (enrollment.courses as any)?.[0];
                            if (!course) return null;
                            const progress = calculateProgress(enrollment);
                            const lessonCount = lessonCounts[enrollment.course_id] || 0;
                            const completedCount = completedCounts[enrollment.course_id] || 0;

                            return (
                                <div key={enrollment.id} className={styles.enrollmentCard}>
                                    <div className={styles.enrollmentInfo}>
                                        <h3>{course.title}</h3>
                                        <div className={styles.enrollmentMeta}>
                                            <span>Đăng ký: {formatDate(enrollment.created_at)}</span>
                                            {enrollment.completed_at && (
                                                <span className={styles.completedTag}>✓ Hoàn thành</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles.progressSection}>
                                        <div className={styles.progressInfo}>
                                            <span>{completedCount}/{lessonCount} bài</span>
                                            <span className={styles.progressPercent}>{progress}%</span>
                                        </div>
                                        <div className={styles.progressBar}>
                                            <div
                                                className={styles.progressFill}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.enrollmentActions}>
                                        <RevokeButton
                                            enrollmentId={enrollment.id}
                                            courseTitle={course.title}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className={styles.emptyText}>Chưa đăng ký khóa học nào</p>
                )}
            </section>

            {/* Orders */}
            <section className={styles.section}>
                <h2>📦 Lịch sử đơn hàng ({orders?.length || 0})</h2>
                {orders && orders.length > 0 ? (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Khóa học</th>
                                    <th>Số tiền</th>
                                    <th>Trạng thái</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td>{(order.courses as any)?.[0]?.title || "N/A"}</td>
                                        <td className={styles.amount}>{formatPrice(order.amount)}</td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[`status_${order.status}`]}`}>
                                                {order.status === "paid" ? "✓ Đã thanh toán" :
                                                    order.status === "pending" ? "⏳ Chờ duyệt" :
                                                        order.status === "cancelled" ? "✗ Đã hủy" : order.status}
                                            </span>
                                        </td>
                                        <td className={styles.date}>{formatDate(order.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className={styles.emptyText}>Chưa có đơn hàng nào</p>
                )}
            </section>
        </div>
    );
}

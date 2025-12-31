import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeleteCourseButton from "./DeleteCourseButton";
import styles from "./page.module.css";

export default async function AdminCoursesPage() {
    const supabase = await createClient();

    // Fetch all courses with lesson counts and enrollment counts
    const { data: courses, error } = await supabase
        .from("courses")
        .select(`
      *,
      lessons (count),
      enrollments (count)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching courses:", error);
    }

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <div className={styles.coursesPage}>
            <header className={styles.header}>
                <div>
                    <h1>Quản lý khóa học</h1>
                    <p>Thêm, sửa, xóa khóa học và bài học</p>
                </div>
                <Link href="/admin/courses/new" className={styles.addBtn}>
                    + Thêm khóa học
                </Link>
            </header>

            {/* Courses Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Khóa học</th>
                            <th>Giá</th>
                            <th>Trạng thái</th>
                            <th>Bài học</th>
                            <th>Học viên</th>
                            <th>Ngày tạo</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses && courses.length > 0 ? (
                            courses.map((course) => {
                                const lessonCount = course.lessons?.[0]?.count || 0;
                                const enrollmentCount = course.enrollments?.[0]?.count || 0;

                                return (
                                    <tr key={course.id}>
                                        <td>
                                            <div className={styles.courseInfo}>
                                                <strong>{course.title}</strong>
                                                <span className={styles.slug}>/{course.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.priceInfo}>
                                                {course.sale_price ? (
                                                    <>
                                                        <span className={styles.salePrice}>
                                                            {formatPrice(course.sale_price)}
                                                        </span>
                                                        <span className={styles.originalPrice}>
                                                            {formatPrice(course.price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>
                                                        {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`${styles.statusBadge} ${styles[`status_${course.status}`]
                                                    }`}
                                            >
                                                {course.status === "published"
                                                    ? "✓ Công khai"
                                                    : course.status === "draft"
                                                        ? "📝 Nháp"
                                                        : course.status}
                                            </span>
                                        </td>
                                        <td className={styles.count}>{lessonCount}</td>
                                        <td className={styles.count}>{enrollmentCount}</td>
                                        <td className={styles.date}>{formatDate(course.created_at)}</td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link
                                                    href={`/admin/courses/${course.id}`}
                                                    className={styles.editBtn}
                                                >
                                                    ✏️ Sửa
                                                </Link>
                                                <Link
                                                    href={`/admin/courses/${course.id}/lessons`}
                                                    className={styles.lessonsBtn}
                                                >
                                                    📚 Bài học
                                                </Link>
                                                <DeleteCourseButton
                                                    courseId={course.id}
                                                    courseTitle={course.title}
                                                    hasEnrollments={enrollmentCount > 0}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                                    Chưa có khóa học nào.{" "}
                                    <Link href="/admin/courses/new">Thêm khóa học đầu tiên</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

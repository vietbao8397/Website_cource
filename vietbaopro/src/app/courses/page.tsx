import { createClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import styles from "./page.module.css";
import { Motion, StaggerContainer } from "@/components/ui/Motion";

function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export const revalidate = 60; // Revalidate every 60 seconds

export default async function CoursesPage() {
    const supabase = await createClient();

    // Fetch published courses from Supabase
    const { data: { user } } = await supabase.auth.getUser();

    const { data: courses, error } = await supabase
        .from("courses")
        .select(`
      id,
      title,
      slug,
      short_description,
      thumbnail_url,
      price,
      sale_price,
      lessons (count)
    `)
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching courses:", error);
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className={styles.heroGlow}></div>
                    <div className="container">
                        <Motion type="slide-up">
                            <h1 className={styles.heroTitle}>Khóa Học</h1>
                        </Motion>
                        <Motion type="slide-up" delay={0.1}>
                            <p className={styles.heroSubtitle}>
                                Hệ thống hóa Quy trình Sáng tạo Nội dung bằng AI.
                                <br />
                                Từ người mới đến Pro trong 30 ngày.
                            </p>
                        </Motion>
                    </div>
                </section>

                {/* Courses Grid */}
                <section className={`section ${styles.coursesSection}`}>
                    <div className="container">
                        {!courses || courses.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
                                <p>Đang cập nhật khóa học...</p>
                            </div>
                        ) : (
                            <StaggerContainer className={styles.coursesGrid}>
                                {courses.map((course) => {
                                    const lessonCount = course.lessons?.[0]?.count || 0;

                                    return (
                                        <Motion key={course.id} type="zoom">
                                            <Link
                                                href={`/course/${course.slug}`}
                                                className={styles.courseCard}
                                            >
                                                <div className={styles.courseThumbnail}>
                                                    <div className={styles.thumbnailPlaceholder}>
                                                        <span>📚</span>
                                                    </div>
                                                    {course.slug === 'pro-content-system' && (
                                                        <span className={styles.badge}>Bestseller</span>
                                                    )}
                                                </div>
                                                <div className={styles.courseBody}>
                                                    <h3 className={styles.courseTitle}>{course.title}</h3>
                                                    <p className={styles.courseDescription}>
                                                        {course.short_description}
                                                    </p>
                                                    <div className={styles.courseMeta}>
                                                        <span className={styles.metaItem}>
                                                            📖 14 ngày (dự kiến)
                                                        </span>
                                                        <span className={styles.metaItem}>
                                                            🎥 {lessonCount} Bài
                                                        </span>
                                                    </div>
                                                    <div className={styles.courseFooter}>
                                                        <div className={styles.coursePrice}>
                                                            {course.sale_price ? (
                                                                <>
                                                                    <span className={styles.priceOriginal}>
                                                                        {formatPrice(course.price)}
                                                                    </span>
                                                                    <span className={styles.priceSale}>
                                                                        {formatPrice(course.sale_price)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className={styles.priceSale}>
                                                                    {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={styles.viewButton}>Xem chi tiết →</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Motion>
                                    );
                                })}
                            </StaggerContainer>
                        )}
                    </div>
                </section>

                {/* Free Resources Section */}
                <section className={`section ${styles.resourcesSection}`}>
                    <div className="container">
                        <Motion type="zoom" className={styles.resourcesCard}>
                            <div className={styles.resourcesContent}>
                                <span className="badge badge-gold">MIỄN PHÍ</span>
                                <h2>Tài Nguyên Starter Kit</h2>
                                <p>
                                    Nhận ngay Template Notion Workspace + Checklist Lộ Trình 30
                                    ngày hoàn toàn miễn phí.
                                </p>
                                <Link href={user ? "/resources" : "/register"} className="btn btn-primary">
                                    Nhận tài nguyên miễn phí
                                </Link>
                            </div>
                            <div className={styles.resourcesVisual}>
                                <div className={styles.resourceIcon}>🎁</div>
                            </div>
                        </Motion>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

import { createClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import CurriculumAccordion from "./CurriculumAccordion";

interface Lesson {
    id: string;
    title: string;
    duration_minutes: number;
    chapter_title: string;
    chapter_index: number;
    is_preview: boolean;
}

function groupLessonsByChapter(lessons: Lesson[]) {
    const chapters: { title: string; lessons: Lesson[] }[] = [];

    // Sort lessons first
    const sortedLessons = [...lessons].sort((a, b) => {
        if (a.chapter_index !== b.chapter_index) return a.chapter_index - b.chapter_index;
        return 0;
    });

    sortedLessons.forEach((lesson) => {
        let chapter = chapters.find(c => c.title === lesson.chapter_title);
        if (!chapter) {
            chapter = { title: lesson.chapter_title, lessons: [] };
            chapters.push(chapter);
        }
        chapter.lessons.push(lesson);
    });

    return chapters;
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch course data with lessons
    const { data: course, error } = await supabase
        .from("courses")
        .select(`
      *,
      lessons (
        id,
        title,
        duration_minutes,
        chapter_title,
        chapter_index,
        is_preview
      ),
      instructor:profiles (
        full_name,
        avatar_url
      )
    `)
        .eq("slug", slug)
        .single();

    if (error) {
        console.error("Supabase Error:", error);
    }

    if (!course) {
        console.error("Course Not Found:", slug);
        notFound();
    }

    // Check enrollment status if user is logged in
    const { data: { user } } = await supabase.auth.getUser();
    let isEnrolled = false;

    if (user) {
        const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", course.id)
            .single();
        if (enrollment) isEnrolled = true;
    }

    const chapters = groupLessonsByChapter(course.lessons || []);
    const totalLessons = course.lessons?.length || 0;
    const finalPrice = course.sale_price || course.price;

    const highlights = [
        `${chapters.length} Module chuyên sâu`,
        `${totalLessons} bài học video`,
        "Templates & Prompts sẵn sàng sử dụng",
        "Cập nhật miễn phí trọn đời",
        "Hỗ trợ qua nhóm riêng",
    ];

    const testimonials = [
        {
            content: "Trước đây mình mất cả ngày để viết 1 bài. Giờ chỉ cần 30 phút là xong.",
            author: "Thanh Lan",
            role: "Chủ shop online",
        },
        {
            content: "Khóa học rất chi tiết, dành cho người mới như mình. Không cần biết code.",
            author: "Minh Hoàng",
            role: "Freelancer Marketing",
        },
    ];

    const instructorName = (course.instructor as any)?.[0]?.full_name || "Việt Bảo";
    const instructorTitle = "Chuyên gia Hệ thống hóa Quy trình Sáng tạo Nội dung";

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <div className={styles.heroGrid}>
                            {/* Video Preview */}
                            <div className={styles.videoWrapper}>
                                <div className={styles.videoContainer}>
                                    {course.youtube_preview_id ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${course.youtube_preview_id}?rel=0`}
                                            title={course.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className={styles.video}
                                        />
                                    ) : (
                                        <div className={styles.thumbnailPlaceholder} style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333' }}>
                                            <span>Thumbnail Placeholder</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Course Info */}
                            <div className={styles.courseInfo}>
                                <span className="badge badge-gold">KHÓA HỌC NỔI BẬT</span>
                                <h1 className={styles.courseTitle}>{course.title}</h1>
                                <p className={styles.courseShortDesc}>
                                    {course.short_description}
                                </p>

                                <div className={styles.instructor}>
                                    <div className={styles.instructorAvatar}>
                                        {instructorName.charAt(0)}
                                    </div>
                                    <div className={styles.instructorInfo}>
                                        <strong>{instructorName}</strong>
                                        <span>{instructorTitle}</span>
                                    </div>
                                </div>

                                <div className={styles.stats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>📚</span>
                                        <span>{chapters.length} Module</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>🎥</span>
                                        <span>{totalLessons} Bài học</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>♾️</span>
                                        <span>Truy cập trọn đời</span>
                                    </div>
                                </div>

                                <div className={styles.priceBox}>
                                    {!isEnrolled ? (
                                        <>
                                            <div className={styles.priceInfo}>
                                                {course.sale_price ? (
                                                    <>
                                                        <span className={styles.priceOriginal}>
                                                            {formatPrice(course.price)}
                                                        </span>
                                                        <span className={styles.priceCurrent}>
                                                            {formatPrice(course.sale_price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className={styles.priceCurrent}>
                                                        {course.price === 0 ? "Miễn phí" : formatPrice(course.price)}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/checkout?course=${course.slug}`}
                                                className="btn btn-primary btn-lg"
                                            >
                                                {course.price === 0 ? "Đăng ký ngay" : "Mua khóa học"}
                                            </Link>
                                        </>
                                    ) : (
                                        <div className={styles.priceInfo} style={{ width: '100%' }}>
                                            <p style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>✓ Bạn đã sở hữu khóa học này</p>
                                            <Link
                                                href={`/learn/${course.slug}`}
                                                className="btn btn-primary btn-lg"
                                                style={{ width: '100%', display: 'block', textAlign: 'center' }}
                                            >
                                                Vào học ngay
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Sections */}
                <div className="container">
                    <div className={styles.contentGrid}>
                        <div className={styles.mainContent}>
                            <section className={styles.section}>
                                <h2>Về khóa học này</h2>
                                <div className={styles.description}>
                                    {course.description && course.description.split("\n").map((paragraph: string, index: number) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2>Nội dung khóa học</h2>
                                <CurriculumAccordion chapters={chapters} />
                            </section>

                            <section className={styles.section}>
                                <h2>Học viên nói gì?</h2>
                                <div className={styles.testimonials}>
                                    {testimonials.map((testimonial, index) => (
                                        <div key={index} className={styles.testimonialCard}>
                                            <p>&quot;{testimonial.content}&quot;</p>
                                            <div className={styles.testimonialAuthor}>
                                                <strong>{testimonial.author}</strong>
                                                <span>{testimonial.role}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarCard}>
                                <h3>Khóa học bao gồm</h3>
                                <ul className={styles.highlightList}>
                                    {highlights.map((highlight, index) => (
                                        <li key={index}>
                                            <span className={styles.checkIcon}>✓</span>
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                {!isEnrolled && (
                                    <>
                                        <div className={styles.sidebarPrice}>
                                            {course.sale_price && (
                                                <span className={styles.priceOriginal}>
                                                    {formatPrice(course.price)}
                                                </span>
                                            )}
                                            <span className={styles.priceCurrent}>
                                                {formatPrice(course.sale_price || course.price)}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/checkout?course=${course.slug}`}
                                            className="btn btn-primary"
                                            style={{ width: "100%" }}
                                        >
                                            Đăng ký ngay
                                        </Link>
                                    </>
                                )}
                                {isEnrolled && (
                                    <Link
                                        href={`/learn/${course.slug}`}
                                        className="btn btn-primary"
                                        style={{ width: "100%" }}
                                    >
                                        Tiếp tục học
                                    </Link>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>

                {/* Mobile Sticky CTA */}
                {!isEnrolled && (
                    <div className={styles.mobileCTA}>
                        <div className={styles.mobileCTAPrice}>
                            <span className={styles.mobilePriceCurrent}>
                                {formatPrice(finalPrice)}
                            </span>
                        </div>
                        <Link
                            href={`/checkout?course=${course.slug}`}
                            className="btn btn-primary"
                        >
                            Đăng ký ngay
                        </Link>
                    </div>
                )}
            </main>
            <Footer />
        </>
    );
}

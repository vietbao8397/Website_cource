import { createClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

export default async function ResourceDetailPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    // Fetch resource data
    const { data: resource, error } = await supabase
        .from("courses")
        .select(`
      *,
      instructor:profiles (
        full_name,
        avatar_url
      )
    `)
        .eq("slug", slug)
        .eq("type", "resource")
        .single();

    if (error || !resource) {
        notFound();
    }

    // Check enrollment/purchase status
    const { data: { user } } = await supabase.auth.getUser();
    let isOwned = false;

    if (user) {
        const { data: enrollment } = await supabase
            .from("enrollments")
            .select("id")
            .eq("user_id", user.id)
            .eq("course_id", resource.id)
            .single();
        if (enrollment) isOwned = true;
    }

    const isFree = resource.price === 0;
    const canAccess = isFree || isOwned;
    const finalPrice = resource.sale_price || resource.price;

    // Custom highlights for resources
    const itemsIncluded = [
        "Tài liệu hướng dẫn chuyên sâu",
        "Templates sẵn sàng sử dụng",
        "Checklist tối ưu quy trình",
        "Cập nhật nội dung trọn đời",
        "Hỗ trợ giải đáp thắc mắc",
    ];

    const instructorName = (resource.instructor as any)?.[0]?.full_name || "Việt Bảo";

    return (
        <>
            <Header />
            <main className={styles.main}>
                {/* Hero Section */}
                <section className={styles.hero}>
                    <div className="container">
                        <div className={styles.heroGrid}>
                            {/* Video/Image Preview Area */}
                            <div className={styles.videoWrapper}>
                                <div className={styles.videoContainer}>
                                    {resource.youtube_preview_id ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${resource.youtube_preview_id}?rel=0`}
                                            title={resource.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className={styles.video}
                                        />
                                    ) : (
                                        <div className={styles.thumbnailPlaceholder} style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            borderRadius: '16px'
                                        }}>
                                            <span style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎁</span>
                                            <span style={{ color: 'var(--color-text-muted)' }}>Tài nguyên Starter Kit</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Resource Info */}
                            <div className={styles.courseInfo}>
                                <span className="badge badge-gold">TÀI NGUYÊN ĐỘC QUYỀN</span>
                                <h1 className={styles.courseTitle}>{resource.title}</h1>
                                <p className={styles.courseShortDesc}>
                                    {resource.short_description}
                                </p>

                                <div className={styles.instructor}>
                                    <div className={styles.instructorAvatar}>
                                        {instructorName.charAt(0)}
                                    </div>
                                    <div className={styles.instructorInfo}>
                                        <strong>{instructorName}</strong>
                                        <span>Founder Vietbaopro</span>
                                    </div>
                                </div>

                                <div className={styles.stats}>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>🚀</span>
                                        <span>Tải về ngay</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>🛠️</span>
                                        <span>Thực hành mẫu</span>
                                    </div>
                                    <div className={styles.statItem}>
                                        <span className={styles.statIcon}>♾️</span>
                                        <span>Dùng trọn đời</span>
                                    </div>
                                </div>

                                <div className={styles.priceBox}>
                                    {canAccess ? (
                                        <div className={styles.priceInfo} style={{ width: '100%' }}>
                                            <p style={{ marginBottom: '1rem', color: isFree ? 'var(--color-gold)' : 'var(--color-success)' }}>
                                                {isFree ? "🎁 Bạn có quyền truy cập miễn phí" : "✓ Bạn đã sở hữu tài nguyên này"}
                                            </p>
                                            <a
                                                href={resource.resource_url || "#"}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary btn-lg"
                                                style={{ width: '100%', display: 'block', textAlign: 'center' }}
                                            >
                                                Truy cập / Tải về ngay
                                            </a>
                                        </div>
                                    ) : (
                                        <>
                                            <div className={styles.priceInfo}>
                                                {resource.sale_price ? (
                                                    <>
                                                        <span className={styles.priceOriginal}>
                                                            {formatPrice(resource.price)}
                                                        </span>
                                                        <span className={styles.priceCurrent}>
                                                            {formatPrice(resource.sale_price)}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className={styles.priceCurrent}>
                                                        {formatPrice(resource.price)}
                                                    </span>
                                                )}
                                            </div>
                                            <Link
                                                href={`/checkout?courseId=${resource.id}`}
                                                className="btn btn-primary btn-lg"
                                            >
                                                Mua tài nguyên ngay
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="container">
                    <div className={styles.contentGrid}>
                        <div className={styles.mainContent}>
                            <section className={styles.section}>
                                <h2>Giới thiệu tài nguyên</h2>
                                <div className={styles.description}>
                                    {resource.description ? resource.description.split("\n").map((paragraph: string, index: number) => (
                                        <p key={index}>{paragraph}</p>
                                    )) : (
                                        <p>Đang cập nhật mô tả chi tiết cho tài nguyên này...</p>
                                    )}
                                </div>
                            </section>

                            <section className={styles.section}>
                                <h2>Lợi ích khi sở hữu</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {itemsIncluded.map((item, index) => (
                                        <div key={index} style={{
                                            padding: '1.5rem',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.05)'
                                        }}>
                                            <span style={{ color: 'var(--color-gold)', marginRight: '0.5rem' }}>✓</span>
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <aside className={styles.sidebar}>
                            <div className={styles.sidebarCard}>
                                <h3>Giá trị nhận được</h3>
                                <ul className={styles.highlightList}>
                                    {itemsIncluded.map((highlight, index) => (
                                        <li key={index}>
                                            <span className={styles.checkIcon}>✓</span>
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>

                                {!canAccess ? (
                                    <>
                                        <div className={styles.sidebarPrice}>
                                            {resource.sale_price && (
                                                <span className={styles.priceOriginal}>
                                                    {formatPrice(resource.price)}
                                                </span>
                                            )}
                                            <span className={styles.priceCurrent}>
                                                {formatPrice(finalPrice)}
                                            </span>
                                        </div>
                                        <Link
                                            href={`/checkout?courseId=${resource.id}`}
                                            className="btn btn-primary"
                                            style={{ width: "100%" }}
                                        >
                                            Sở hữu ngay
                                        </Link>
                                    </>
                                ) : (
                                    <a
                                        href={resource.resource_url || "#"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-primary"
                                        style={{ width: "100%", textAlign: 'center' }}
                                    >
                                        Tải về ngay
                                    </a>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

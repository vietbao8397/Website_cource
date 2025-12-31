import { Header, Footer } from "@/components/layout";
import { Motion, StaggerContainer } from "@/components/ui/Motion";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ResourcesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/resources");
    }

    // Fetch published resources
    const { data: resourcesData, error } = await supabase
        .from("courses")
        .select("*")
        .eq("status", "published")
        .eq("type", "resource")
        .order("created_at", { ascending: false });

    // Fetch user enrollments
    const { data: enrollments } = await supabase
        .from("enrollments")
        .select("course_id")
        .eq("user_id", user.id);

    const ownedResourceIds = new Set(enrollments?.map((e) => e.course_id) || []);

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }

    return (
        <>
            <Header />
            <main className={styles.resourcesPage}>
                <div className="container">
                    <header className={styles.header}>
                        <Motion type="slide-up">
                            <h1>Kho Tài Nguyên</h1>
                        </Motion>
                        <Motion type="slide-up" delay={0.1}>
                            <p>Tất cả công cụ, templates và tài liệu độc quyền dành cho học viên Vietbaopro.</p>
                        </Motion>
                    </header>

                    {resourcesData && resourcesData.length > 0 ? (
                        <StaggerContainer className={styles.grid}>
                            {resourcesData.map((resource) => {
                                const isOwned = ownedResourceIds.has(resource.id);
                                const isFree = resource.price === 0;
                                const canAccess = isFree || isOwned;

                                return (
                                    <Motion key={resource.id} type="zoom">
                                        <div className={styles.resourceCard}>
                                            <div className={styles.icon}>
                                                {isFree ? "🎁" : "💎"}
                                            </div>
                                            <h3>{resource.title}</h3>
                                            <p>{resource.short_description}</p>

                                            <div className={styles.resourceMeta}>
                                                {!isFree && !isOwned && (
                                                    <span className={styles.price}>
                                                        {formatPrice(resource.sale_price || resource.price)}
                                                    </span>
                                                )}
                                                {isFree && <span className={styles.freeBadge}>Miễn phí</span>}
                                                {isOwned && !isFree && <span className={styles.ownedBadge}>Đã sở hữu</span>}
                                            </div>

                                            {canAccess ? (
                                                <Link
                                                    href={`/resource/${resource.slug}`}
                                                    className={styles.downloadBtn}
                                                >
                                                    Xem chi tiết →
                                                </Link>
                                            ) : (
                                                <Link href={`/resource/${resource.slug}`} className={styles.buyBtn}>
                                                    Xem chi tiết & Mua
                                                </Link>
                                            )}
                                        </div>
                                    </Motion>
                                );
                            })}
                        </StaggerContainer>
                    ) : (
                        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
                            <p>Hiện chưa có tài nguyên nào được cập nhật. Quay lại sau nhé!</p>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}

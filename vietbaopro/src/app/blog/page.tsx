import { createClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import styles from "./page.module.css";

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    category: string;
    read_time_minutes: number;
    published_at: string | null;
    scheduled_at: string | null;
}

export default async function BlogPage() {
    const supabase = await createClient();
    const now = new Date().toISOString();

    // Only fetch published posts that are NOT scheduled for the future
    const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("id, slug, title, excerpt, category, read_time_minutes, published_at, scheduled_at")
        .eq("status", "published")
        .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
        .order("published_at", { ascending: false, nullsFirst: false });

    if (error) {
        console.error("Error fetching blog posts:", error);
    }

    function formatDate(post: BlogPost): string {
        // Use published_at if available, otherwise use scheduled_at
        const dateStr = post.published_at || post.scheduled_at;
        if (!dateStr) return "";

        return new Date(dateStr).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className="container">
                        <h1>Blog</h1>
                        <p className={styles.subtitle}>
                            Chia sẻ kiến thức về AI, Content Marketing và Tự động hóa
                        </p>
                    </div>
                </section>

                <section className={styles.content}>
                    <div className="container">
                        {posts && posts.length > 0 ? (
                            <div className={styles.grid}>
                                {posts.map((post) => (
                                    <article key={post.id} className={styles.postCard}>
                                        <div className={styles.postMeta}>
                                            <span className={styles.category}>{post.category || "Chung"}</span>
                                            <span className={styles.date}>{formatDate(post)}</span>
                                        </div>
                                        <h2 className={styles.postTitle}>
                                            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                                        </h2>
                                        <p className={styles.postExcerpt}>{post.excerpt}</p>
                                        <div className={styles.postFooter}>
                                            <span className={styles.readTime}>📖 {post.read_time_minutes} phút</span>
                                            <Link href={`/blog/${post.slug}`} className={styles.readMore}>
                                                Đọc tiếp →
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyNotice}>
                                <p>🚧 Chưa có bài viết nào. Hãy quay lại sau!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

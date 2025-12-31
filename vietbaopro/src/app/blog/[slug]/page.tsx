import { createClient } from "@/lib/supabase/server";
import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: post, error } = await supabase
        .from("blog_posts")
        .select(`
      *,
      author:profiles (full_name, avatar_url)
    `)
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (!post || error) {
        notFound();
    }

    // Check if scheduled for future
    if (post.scheduled_at && new Date(post.scheduled_at) > new Date()) {
        notFound();
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    return (
        <>
            <Header />
            <main className={styles.main}>
                <article className={styles.article}>
                    <div className="container">
                        <div className={styles.articleHeader}>
                            <Link href="/blog" className={styles.backLink}>
                                ← Quay lại Blog
                            </Link>

                            {post.cover_image_url && (
                                <div className={styles.coverImage}>
                                    <img src={post.cover_image_url} alt={post.title} />
                                </div>
                            )}

                            <div className={styles.meta}>
                                <span className={styles.category}>{post.category || "Chung"}</span>
                                <span className={styles.date}>{formatDate(post.published_at || post.created_at)}</span>
                                <span className={styles.readTime}>📖 {post.read_time_minutes} phút đọc</span>
                            </div>
                            <h1 className={styles.title}>{post.title}</h1>
                            {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

                            <div className={styles.author}>
                                <div className={styles.authorAvatar}>
                                    {post.author?.full_name?.charAt(0) || "V"}
                                </div>
                                <div className={styles.authorInfo}>
                                    <strong>{post.author?.full_name || "Việt Bảo"}</strong>
                                    <span>Tác giả</span>
                                </div>
                            </div>
                        </div>

                        {/* Render HTML content directly */}
                        <div
                            className={styles.content}
                            dangerouslySetInnerHTML={{ __html: post.content || "" }}
                        />

                        <div className={styles.articleFooter}>
                            <Link href="/blog" className={styles.backBtn}>
                                ← Xem tất cả bài viết
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </>
    );
}

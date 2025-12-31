import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import DeletePostButton from "./DeletePostButton";
import styles from "./page.module.css";

export default async function AdminBlogPage() {
    const supabase = await createClient();

    const { data: posts, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching posts:", error);
    }

    function formatDate(dateString: string | null): string {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    function getStatusLabel(post: { status: string; scheduled_at: string | null }) {
        if (post.status === "published") {
            if (post.scheduled_at && new Date(post.scheduled_at) > new Date()) {
                return { label: "⏰ Hẹn giờ", class: "status_scheduled" };
            }
            return { label: "✓ Công khai", class: "status_published" };
        }
        return { label: "📝 Nháp", class: "status_draft" };
    }

    return (
        <div className={styles.blogPage}>
            <header className={styles.header}>
                <div>
                    <h1>Quản lý Blog</h1>
                    <p>Thêm, sửa, xóa bài viết</p>
                </div>
                <div className={styles.headerActions}>
                    <Link href="/admin/blog/categories" className={styles.categoriesBtn}>
                        📁 Danh mục
                    </Link>
                    <Link href="/admin/blog/new" className={styles.addBtn}>
                        + Thêm bài viết
                    </Link>
                </div>
            </header>

            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Tiêu đề</th>
                            <th>Danh mục</th>
                            <th>Trạng thái</th>
                            <th>Hẹn giờ / Đã đăng</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {posts && posts.length > 0 ? (
                            posts.map((post) => {
                                const statusInfo = getStatusLabel(post);
                                return (
                                    <tr key={post.id}>
                                        <td>
                                            <div className={styles.postInfo}>
                                                <strong>{post.title}</strong>
                                                <span className={styles.slug}>/{post.slug}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={styles.category}>{post.category || "Chung"}</span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className={styles.date}>
                                            {post.scheduled_at ? formatDate(post.scheduled_at) : formatDate(post.published_at)}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link href={`/admin/blog/${post.id}`} className={styles.editBtn}>
                                                    ✏️ Sửa
                                                </Link>
                                                {post.status === "published" && !post.scheduled_at && (
                                                    <Link href={`/blog/${post.slug}`} target="_blank" className={styles.viewBtn}>
                                                        👁️
                                                    </Link>
                                                )}
                                                <DeletePostButton postId={post.id} postTitle={post.title} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "3rem" }}>
                                    Chưa có bài viết nào.{" "}
                                    <Link href="/admin/blog/new">Viết bài đầu tiên</Link>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

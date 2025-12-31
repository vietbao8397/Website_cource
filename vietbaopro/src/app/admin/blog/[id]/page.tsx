"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./page.module.css";

interface Category {
    id: string;
    name: string;
}

export default function EditBlogPostPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [postId, setPostId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [useSchedule, setUseSchedule] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        cover_image_url: "",
        read_time_minutes: 5,
        status: "draft",
        scheduled_at: "",
    });

    useEffect(() => {
        async function loadData() {
            const { id } = await params;
            setPostId(id);

            const supabase = createClient();

            // Load categories
            const { data: cats } = await supabase
                .from("blog_categories")
                .select("id, name")
                .order("name", { ascending: true });
            if (cats) setCategories(cats);

            // Load post
            const { data: post, error } = await supabase
                .from("blog_posts")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !post) {
                setError("Không tìm thấy bài viết");
                setIsLoading(false);
                return;
            }

            // Check if post is scheduled for future
            const hasSchedule = post.scheduled_at && new Date(post.scheduled_at) > new Date();
            setUseSchedule(hasSchedule);

            // Format scheduled_at for datetime-local input
            let scheduledValue = "";
            if (post.scheduled_at) {
                const d = new Date(post.scheduled_at);
                scheduledValue = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
            }

            setFormData({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt || "",
                content: post.content || "",
                category: post.category || "",
                cover_image_url: post.cover_image_url || "",
                read_time_minutes: post.read_time_minutes || 5,
                status: post.status,
                scheduled_at: scheduledValue,
            });
            setIsLoading(false);
        }

        loadData();
    }, [params]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!postId) return;

        setIsSaving(true);
        setError("");

        const supabase = createClient();

        const updateData: Record<string, unknown> = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || null,
            content: formData.content,
            category: formData.category || "Chung",
            read_time_minutes: Number(formData.read_time_minutes),
            status: formData.status,
            updated_at: new Date().toISOString(),
        };

        // Handle cover image
        if (formData.cover_image_url) {
            updateData.cover_image_url = formData.cover_image_url;
        } else {
            updateData.cover_image_url = null;
        }

        // Handle publishing and scheduling
        if (formData.status === "published") {
            if (useSchedule && formData.scheduled_at) {
                // Schedule for future
                const scheduledDate = new Date(formData.scheduled_at);
                updateData.scheduled_at = scheduledDate.toISOString();
                updateData.published_at = scheduledDate.toISOString();
            } else {
                // Publish immediately - check if already published
                updateData.scheduled_at = null;
                const { data: currentPost } = await supabase
                    .from("blog_posts")
                    .select("published_at")
                    .eq("id", postId)
                    .single();

                if (!currentPost?.published_at) {
                    updateData.published_at = new Date().toISOString();
                }
            }
        } else {
            // Draft
            updateData.scheduled_at = null;
        }

        const { error: updateError } = await supabase
            .from("blog_posts")
            .update(updateData)
            .eq("id", postId);

        if (updateError) {
            setError("Lỗi: " + updateError.message);
            setIsSaving(false);
            return;
        }

        router.push("/admin/blog");
        router.refresh();
    };

    // Get minimum datetime for scheduling (now + 5 minutes)
    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 5);
        return now.toISOString().slice(0, 16);
    };

    if (isLoading) {
        return <div className={styles.formPage}>Đang tải...</div>;
    }

    return (
        <div className={styles.formPage}>
            <header className={styles.header}>
                <Link href="/admin/blog" className={styles.backLink}>
                    ← Quay lại
                </Link>
                <h1>Chỉnh sửa bài viết</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>
                            Tiêu đề *
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Tiêu đề hiển thị trên trang blog</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Slug (URL) *
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Đường dẫn URL của bài viết</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                        />
                        <span className={styles.hint}>/blog/{formData.slug}</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Danh mục</label>
                        <select name="category" value={formData.category} onChange={handleChange}>
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Ảnh bìa (URL)
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Kích thước khuyến nghị: 1200x630px</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="cover_image_url"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Tóm tắt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={2}
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Nội dung * (Hỗ trợ HTML)</label>
                        <div className={styles.editorToolbar}>
                            <span className={styles.toolbarHint}>
                                💡 Sử dụng HTML: &lt;h2&gt;, &lt;p&gt;, &lt;img src="..."&gt;, &lt;ul&gt;&lt;li&gt;...
                            </span>
                        </div>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={20}
                            className={styles.codeEditor}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Thời gian đọc (phút)</label>
                        <input
                            type="number"
                            name="read_time_minutes"
                            value={formData.read_time_minutes}
                            onChange={handleChange}
                            min={1}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="draft">📝 Nháp</option>
                            <option value="published">✓ Công khai</option>
                        </select>
                    </div>

                    {formData.status === "published" && (
                        <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    checked={useSchedule}
                                    onChange={(e) => setUseSchedule(e.target.checked)}
                                />
                                ⏰ Hẹn giờ đăng bài
                            </label>
                            {useSchedule && (
                                <div className={styles.scheduleBox}>
                                    <input
                                        type="datetime-local"
                                        name="scheduled_at"
                                        value={formData.scheduled_at}
                                        onChange={handleChange}
                                        min={getMinDateTime()}
                                        className={styles.scheduleInput}
                                        required
                                    />
                                    <span className={styles.scheduleNote}>
                                        💡 Bài viết sẽ tự động hiển thị vào thời gian này
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.formActions}>
                    <Link href="/admin/blog" className={styles.cancelBtn}>
                        Hủy
                    </Link>
                    <button type="submit" disabled={isSaving} className={styles.submitBtn}>
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </div>
    );
}

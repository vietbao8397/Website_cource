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

export default function NewBlogPostPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
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
        async function loadCategories() {
            const supabase = createClient();
            const { data } = await supabase
                .from("blog_categories")
                .select("id, name")
                .order("name", { ascending: true });
            if (data) setCategories(data);
        }
        loadCategories();
    }, []);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "title") {
            const slug = value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/đ/g, "d")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            setFormData((prev) => ({ ...prev, slug }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const insertData: Record<string, unknown> = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt || null,
            content: formData.content,
            category: formData.category || "Chung",
            read_time_minutes: Number(formData.read_time_minutes),
            status: formData.status,
            author_id: user?.id || null,
        };

        // Only add cover_image_url if provided
        if (formData.cover_image_url) {
            insertData.cover_image_url = formData.cover_image_url;
        }

        // Handle publishing and scheduling
        if (formData.status === "published") {
            if (useSchedule && formData.scheduled_at) {
                // Schedule for future - convert local datetime to ISO string
                const scheduledDate = new Date(formData.scheduled_at);
                insertData.scheduled_at = scheduledDate.toISOString();
                // Also set published_at to scheduled time for display
                insertData.published_at = scheduledDate.toISOString();
            } else {
                // Publish immediately
                insertData.published_at = new Date().toISOString();
                insertData.scheduled_at = null;
            }
        } else {
            // Draft - no dates
            insertData.published_at = null;
            insertData.scheduled_at = null;
        }

        console.log("Inserting post with data:", insertData);

        const { error: insertError } = await supabase.from("blog_posts").insert(insertData);

        if (insertError) {
            setError("Lỗi: " + insertError.message);
            setIsLoading(false);
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

    return (
        <div className={styles.formPage}>
            <header className={styles.header}>
                <Link href="/admin/blog" className={styles.backLink}>
                    ← Quay lại
                </Link>
                <h1>Thêm bài viết mới</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>
                            Tiêu đề *
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Tiêu đề hiển thị trên trang blog và kết quả tìm kiếm</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="VD: Hướng dẫn sử dụng ChatGPT"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Slug (URL) *
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Đường dẫn URL, tự động tạo từ tiêu đề</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            required
                        />
                        <span className={styles.hint}>/blog/{formData.slug || "slug"}</span>
                    </div>

                    <div className={styles.formGroup}>
                        <label>
                            Danh mục
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>Phân loại bài viết</span>
                            </span>
                        </label>
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
                                <span className={styles.tooltipText}>
                                    Không bắt buộc. Kích thước: 1200x630px
                                </span>
                            </span>
                        </label>
                        <input
                            type="text"
                            name="cover_image_url"
                            value={formData.cover_image_url}
                            onChange={handleChange}
                            placeholder="https://example.com/image.jpg (tùy chọn)"
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Tóm tắt</label>
                        <textarea
                            name="excerpt"
                            value={formData.excerpt}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Mô tả ngắn (tùy chọn)"
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>
                            Nội dung * (Hỗ trợ HTML)
                            <span className={styles.tooltip}>
                                ℹ️
                                <span className={styles.tooltipText}>
                                    Sử dụng HTML: &lt;h2&gt;, &lt;p&gt;, &lt;img&gt;, &lt;ul&gt;...
                                </span>
                            </span>
                        </label>
                        <div className={styles.editorToolbar}>
                            <span className={styles.toolbarHint}>
                                💡 Sử dụng HTML để định dạng: &lt;h2&gt;, &lt;p&gt;, &lt;img src="..."&gt;, &lt;ul&gt;&lt;li&gt;...
                            </span>
                        </div>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            rows={20}
                            className={styles.codeEditor}
                            placeholder={`<h2>Tiêu đề phần 1</h2>
<p>Nội dung đoạn văn...</p>

<h2>Tiêu đề phần 2</h2>
<ul>
  <li>Mục 1</li>
  <li>Mục 2</li>
</ul>`}
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
                                <span className={styles.tooltip}>
                                    ℹ️
                                    <span className={styles.tooltipText}>Bài sẽ ẩn cho đến thời gian đã chọn</span>
                                </span>
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
                    <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? "Đang lưu..." : useSchedule ? "Hẹn giờ đăng" : "Tạo bài viết"}
                    </button>
                </div>
            </form>
        </div>
    );
}

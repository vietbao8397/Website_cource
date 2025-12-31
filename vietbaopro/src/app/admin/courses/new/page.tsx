"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import styles from "./page.module.css";

export default function NewCoursePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        short_description: "",
        description: "",
        price: 0,
        sale_price: "",
        youtube_preview_id: "",
        status: "draft",
        type: "course",
        resource_url: "",
        thumbnail_url: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Auto-generate slug from title
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

        const { error: insertError } = await supabase.from("courses").insert({
            title: formData.title,
            slug: formData.slug,
            short_description: formData.short_description,
            description: formData.description,
            price: Number(formData.price),
            instructor_id: user?.id,
            sale_price: formData.sale_price ? Number(formData.sale_price) : null,
            youtube_preview_id: formData.youtube_preview_id || null,
            status: formData.status,
            type: formData.type,
            resource_url: formData.type === "resource" ? formData.resource_url : null,
            thumbnail_url: formData.thumbnail_url || null,
        });

        if (insertError) {
            setError("Lỗi: " + insertError.message);
            setIsLoading(false);
            return;
        }

        router.push("/admin/courses");
        router.refresh();
    };

    return (
        <div className={styles.formPage}>
            <header className={styles.header}>
                <Link href="/admin/courses" className={styles.backLink}>
                    ← Quay lại
                </Link>
                <h1>Thêm khóa học mới</h1>
            </header>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                        <label>Tên khóa học *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="VD: Pro Content System"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Slug (URL) *</label>
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="pro-content-system"
                            required
                        />
                        <span className={styles.hint}>/course/{formData.slug || "slug"}</span>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Mô tả ngắn *</label>
                        <input
                            type="text"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            placeholder="Mô tả 1 dòng cho trang danh sách"
                            required
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Mô tả chi tiết</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Mô tả đầy đủ về khóa học..."
                            rows={6}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Giá gốc (VNĐ) *</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            min={0}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Giá khuyến mãi (VNĐ)</label>
                        <input
                            type="number"
                            name="sale_price"
                            value={formData.sale_price}
                            onChange={handleChange}
                            min={0}
                            placeholder="Để trống nếu không KM"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>YouTube Preview ID</label>
                        <input
                            type="text"
                            name="youtube_preview_id"
                            value={formData.youtube_preview_id}
                            onChange={handleChange}
                            placeholder="VD: dQw4w9WgXcQ"
                        />
                        <span className={styles.hint}>ID video từ URL YouTube</span>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <ImageUpload
                            label="Ảnh đại diện (Thumbnail)"
                            value={formData.thumbnail_url}
                            onChange={(url) => setFormData(prev => ({ ...prev, thumbnail_url: url }))}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Trạng thái</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            <option value="draft">📝 Nháp</option>
                            <option value="published">✓ Công khai</option>
                        </select>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Loại Content</label>
                        <select name="type" value={formData.type} onChange={handleChange}>
                            <option value="course">🎓 Khóa học</option>
                            <option value="resource">🎁 Tài nguyên</option>
                        </select>
                    </div>

                    {formData.type === "resource" && (
                        <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                            <label>Link tài nguyên (Resource URL) *</label>
                            <input
                                type="url"
                                name="resource_url"
                                value={formData.resource_url}
                                onChange={handleChange}
                                placeholder="https://notion.so/my-template"
                                required={formData.type === "resource"}
                            />
                            <span className={styles.hint}>Link này sẽ hiển thị cho người dùng sau khi đã đăng nhập/mua.</span>
                        </div>
                    )}
                </div>

                <div className={styles.formActions}>
                    <Link href="/admin/courses" className={styles.cancelBtn}>
                        Hủy
                    </Link>
                    <button type="submit" disabled={isLoading} className={styles.submitBtn}>
                        {isLoading ? "Đang lưu..." : "Tạo khóa học"}
                    </button>
                </div>
            </form >
        </div >
    );
}

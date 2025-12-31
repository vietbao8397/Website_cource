"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import ImageUpload from "@/components/admin/ImageUpload";
import styles from "./page.module.css";

interface Course {
    id: string;
    title: string;
    slug: string;
    short_description: string;
    description: string;
    price: number;
    sale_price: number | null;
    youtube_preview_id: string | null;
    status: string;
}

export default function EditCoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [courseId, setCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
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

    useEffect(() => {
        async function loadCourse() {
            const { id } = await params;
            setCourseId(id);

            const supabase = createClient();
            const { data: course, error } = await supabase
                .from("courses")
                .select("*")
                .eq("id", id)
                .single();

            if (error || !course) {
                setError("Không tìm thấy khóa học");
                setIsLoading(false);
                return;
            }

            setFormData({
                title: course.title,
                slug: course.slug,
                short_description: course.short_description || "",
                description: course.description || "",
                price: course.price,
                sale_price: course.sale_price?.toString() || "",
                youtube_preview_id: course.youtube_preview_id || "",
                status: course.status,
                type: course.type || "course",
                resource_url: course.resource_url || "",
                thumbnail_url: course.thumbnail_url || "",
            });
            setIsLoading(false);
        }

        loadCourse();
    }, [params]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!courseId) return;

        setIsSaving(true);
        setError("");

        const supabase = createClient();

        const { error: updateError } = await supabase
            .from("courses")
            .update({
                title: formData.title,
                slug: formData.slug,
                short_description: formData.short_description,
                description: formData.description,
                price: Number(formData.price),
                sale_price: formData.sale_price ? Number(formData.sale_price) : null,
                youtube_preview_id: formData.youtube_preview_id || null,
                status: formData.status,
                type: formData.type,
                resource_url: formData.type === "resource" ? formData.resource_url : null,
                thumbnail_url: formData.thumbnail_url || null,
            })
            .eq("id", courseId);

        if (updateError) {
            setError("Lỗi: " + updateError.message);
            setIsSaving(false);
            return;
        }

        router.push("/admin/courses");
        router.refresh();
    };

    if (isLoading) {
        return (
            <div className={styles.formPage}>
                <p>Đang tải...</p>
            </div>
        );
    }

    return (
        <div className={styles.formPage}>
            <header className={styles.header}>
                <Link href="/admin/courses" className={styles.backLink}>
                    ← Quay lại
                </Link>
                <h1>Chỉnh sửa khóa học</h1>
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
                            required
                        />
                        <span className={styles.hint}>/course/{formData.slug}</span>
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Mô tả ngắn *</label>
                        <input
                            type="text"
                            name="short_description"
                            value={formData.short_description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                        <label>Mô tả chi tiết</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
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
                        <select name="status" value={formData.status} onChange={handleChange}>
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

                    {
                        formData.type === "resource" && (
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
                        )
                    }
                </div >

                <div className={styles.formActions}>
                    <Link href={`/admin/courses/${courseId}/lessons`} className={styles.lessonsLink}>
                        📚 Quản lý bài học
                    </Link>
                    <div className={styles.rightActions}>
                        <Link href="/admin/courses" className={styles.cancelBtn}>
                            Hủy
                        </Link>
                        <button type="submit" disabled={isSaving} className={styles.submitBtn}>
                            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
}

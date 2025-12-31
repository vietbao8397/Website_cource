"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./page.module.css";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string | null;
}

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", description: "" });

    useEffect(() => {
        async function loadCategories() {
            const supabase = createClient();
            const { data } = await supabase
                .from("blog_categories")
                .select("*")
                .order("name", { ascending: true });
            if (data) setCategories(data);
            setIsLoading(false);
        }
        loadCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "name" && !editingId) {
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
        const supabase = createClient();

        if (editingId) {
            const { error } = await supabase
                .from("blog_categories")
                .update(formData)
                .eq("id", editingId);
            if (error) {
                alert("Lỗi: " + error.message);
                return;
            }
            setCategories((prev) =>
                prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
            );
        } else {
            const { data, error } = await supabase
                .from("blog_categories")
                .insert(formData)
                .select()
                .single();
            if (error) {
                alert("Lỗi: " + error.message);
                return;
            }
            if (data) setCategories((prev) => [...prev, data]);
        }

        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", slug: "", description: "" });
    };

    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setFormData({ name: cat.name, slug: cat.slug, description: cat.description || "" });
        setShowForm(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Xóa danh mục này?")) return;
        const supabase = createClient();
        const { error } = await supabase.from("blog_categories").delete().eq("id", id);
        if (error) {
            alert("Lỗi: " + error.message);
            return;
        }
        setCategories((prev) => prev.filter((c) => c.id !== id));
    };

    if (isLoading) return <div className={styles.page}>Đang tải...</div>;

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div>
                    <Link href="/admin/blog" className={styles.backLink}>← Quay lại Blog</Link>
                    <h1>Quản lý danh mục</h1>
                </div>
                <button onClick={() => { setShowForm(true); setEditingId(null); setFormData({ name: "", slug: "", description: "" }); }} className={styles.addBtn}>
                    + Thêm danh mục
                </button>
            </header>

            {showForm && (
                <form onSubmit={handleSubmit} className={styles.form}>
                    <h3>{editingId ? "Sửa danh mục" : "Thêm danh mục mới"}</h3>
                    <div className={styles.formRow}>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Tên danh mục *"
                            required
                        />
                        <input
                            type="text"
                            name="slug"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="Slug *"
                            required
                        />
                    </div>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Mô tả (tùy chọn)"
                        rows={2}
                    />
                    <div className={styles.formActions}>
                        <button type="button" onClick={() => setShowForm(false)} className={styles.cancelBtn}>
                            Hủy
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            {editingId ? "Lưu thay đổi" : "Tạo danh mục"}
                        </button>
                    </div>
                </form>
            )}

            <div className={styles.list}>
                {categories.length > 0 ? (
                    categories.map((cat) => (
                        <div key={cat.id} className={styles.item}>
                            <div className={styles.itemInfo}>
                                <strong>{cat.name}</strong>
                                <span className={styles.slug}>/{cat.slug}</span>
                                {cat.description && <p>{cat.description}</p>}
                            </div>
                            <div className={styles.itemActions}>
                                <button onClick={() => handleEdit(cat)} className={styles.editBtn}>✏️</button>
                                <button onClick={() => handleDelete(cat.id)} className={styles.deleteBtn}>🗑️</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.empty}>Chưa có danh mục nào</p>
                )}
            </div>
        </div>
    );
}

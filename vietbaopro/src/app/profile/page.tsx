"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header, Footer } from "@/components/layout";
import { Motion } from "@/components/ui/Motion";
import styles from "./page.module.css";

interface Profile {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
    role: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
    });

    useEffect(() => {
        async function loadProfile() {
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                window.location.href = "/login?redirect=/profile";
                return;
            }

            const { data: profileData, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();

            if (error) {
                console.error("Error loading profile:", error);
            } else if (profileData) {
                setProfile(profileData);
                setFormData({
                    full_name: profileData.full_name || "",
                    phone: profileData.phone || "",
                });
            }
            setIsLoading(false);
        }

        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setIsSaving(true);
        setMessage(null);

        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({
                full_name: formData.full_name,
                phone: formData.phone,
                updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);

        if (error) {
            setMessage({ type: "error", text: "Lỗi: " + error.message });
        } else {
            setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
            setProfile({ ...profile, ...formData });
        }
        setIsSaving(false);
    };

    if (isLoading) {
        return (
            <>
                <Header />
                <div className={styles.profilePage}>
                    <div className="container">
                        <p style={{ textAlign: "center", color: "var(--color-text-muted)" }}>Đang tải...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className={styles.profilePage}>
                <div className={styles.container}>
                    <header className={styles.header}>
                        <Motion type="slide-up">
                            <h1>Tài Khoản</h1>
                        </Motion>
                        <Motion type="slide-up" delay={0.1}>
                            <p>Quản lý thông tin cá nhân của bạn</p>
                        </Motion>
                    </header>

                    <Motion type="zoom" delay={0.2}>
                        <div className={styles.profileCard}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatarCircle}>
                                    {formData.full_name ? formData.full_name.charAt(0).toUpperCase() : profile?.email.charAt(0).toUpperCase()}
                                </div>
                                <span className={`${styles.roleBadge} ${styles[`role_${profile?.role}`]}`}>
                                    {profile?.role === "admin" ? "Quản trị viên" : "Học viên"}
                                </span>
                            </div>

                            <form onSubmit={handleSubmit} className={styles.form}>
                                <div className={styles.formGrid}>
                                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                                        <label>Email (Không thể thay đổi)</label>
                                        <input type="email" value={profile?.email} disabled />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Họ và tên</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            placeholder="Nhập họ tên của bạn"
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label>Số điện thoại</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="Nhập số điện thoại"
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <div className={`${styles.message} ${styles[message.type]}`}>
                                        {message.text}
                                    </div>
                                )}

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn} disabled={isSaving}>
                                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Motion>
                </div>
            </main>
            <Footer />
        </>
    );
}

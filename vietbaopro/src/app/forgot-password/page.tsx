"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const supabase = createClient();

        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (resetError) {
            setError(resetError.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    };

    return (
        <div className={styles.authPage}>
            <div className={styles.authContainer}>
                {/* Left - Branding */}
                <div className={styles.brandSide}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>Vietbao</span>
                        <span className={styles.logoAccent}>Pro</span>
                    </Link>
                    <div className={styles.brandContent}>
                        <h1>Quên mật khẩu?</h1>
                        <p>
                            Đừng lo! Chuyện này xảy ra với tất cả mọi người. Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
                        </p>
                    </div>
                    <div className={styles.brandFooter}>
                        <p>&quot;Đừng làm Content theo bản năng. Hãy làm theo Hệ thống.&quot;</p>
                    </div>
                </div>

                {/* Right - Form */}
                <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                        {success ? (
                            <div className={styles.successBox}>
                                <div className={styles.successIcon}>✉️</div>
                                <h2>Kiểm tra email của bạn</h2>
                                <p>
                                    Chúng tôi đã gửi link đặt lại mật khẩu đến{" "}
                                    <strong>{email}</strong>
                                </p>
                                <p className={styles.hint}>
                                    Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
                                    <button
                                        type="button"
                                        onClick={() => setSuccess(false)}
                                        className={styles.retryLink}
                                    >
                                        thử lại
                                    </button>
                                </p>
                                <Link href="/login" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "1rem" }}>
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className={styles.formHeader}>
                                    <h2>Đặt lại mật khẩu</h2>
                                    <p>
                                        Nhớ mật khẩu rồi?{" "}
                                        <Link href="/login" className={styles.link}>
                                            Đăng nhập
                                        </Link>
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    {error && <div className={styles.error}>{error}</div>}

                                    <div className="form-group">
                                        <label htmlFor="email" className="form-label">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="form-input"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isLoading}
                                        style={{ width: "100%" }}
                                    >
                                        {isLoading ? "Đang gửi..." : "Gửi link đặt lại"}
                                    </button>
                                </form>

                                <div className={styles.backToLogin}>
                                    <Link href="/login" className={styles.backLink}>
                                        ← Quay lại đăng nhập
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

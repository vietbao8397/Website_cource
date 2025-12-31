"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "../login/page.module.css";
import AuthTestimonials from "../login/AuthTestimonials";

export default function RegisterPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự!");
            setIsLoading(false);
            return;
        }

        const supabase = createClient();

        const { error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                setError("Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.");
            } else {
                setError(authError.message);
            }
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);
    };

    const handleGoogleSignup = async () => {
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    if (success) {
        return (
            <div className={styles.authPage}>
                <div className={styles.authContainer}>
                    <div className={styles.formSide} style={{ gridColumn: "1 / -1" }}>
                        <div className={styles.formContainer} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>✉️</div>
                            <h2>Kiểm tra email của bạn!</h2>
                            <p style={{ color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
                                Chúng tôi đã gửi một email xác nhận đến <strong>{email}</strong>.
                                <br />
                                Vui lòng click vào link trong email để hoàn tất đăng ký.
                            </p>
                            <Link href="/login" className="btn btn-primary">
                                Quay lại đăng nhập
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <h1>Bắt đầu hành trình!</h1>
                        <p>
                            Tham gia cộng đồng hàng ngàn Marketers & Creators đang học cách
                            làm chủ AI để tạo nội dung chất lượng.
                        </p>
                        <AuthTestimonials />
                    </div>
                    <div className={styles.brandFooter}>
                        <p>&quot;Biến sự hỗn loạn thành trật tự. Biến người mới thành Pro.&quot;</p>
                    </div>
                </div>

                {/* Right - Form */}
                <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2>Tạo tài khoản</h2>
                            <p>
                                Đã có tài khoản?{" "}
                                <Link href="/login" className={styles.link}>
                                    Đăng nhập
                                </Link>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {error && <div className={styles.error}>{error}</div>}

                            <div className="form-group">
                                <label htmlFor="fullName" className="form-label">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    id="fullName"
                                    className="form-input"
                                    placeholder="Nguyễn Văn A"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>

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

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder="Ít nhất 6 ký tự"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword" className="form-label">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-input"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                                Bằng việc đăng ký, bạn đồng ý với{" "}
                                <Link href="/terms" className={styles.link}>
                                    Điều khoản sử dụng
                                </Link>{" "}
                                và{" "}
                                <Link href="/privacy" className={styles.link}>
                                    Chính sách bảo mật
                                </Link>
                                .
                            </p>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isLoading}
                                style={{ width: "100%" }}
                            >
                                {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>hoặc</span>
                        </div>

                        <button
                            className={`btn btn-secondary ${styles.socialBtn}`}
                            onClick={handleGoogleSignup}
                            type="button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Đăng ký với Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

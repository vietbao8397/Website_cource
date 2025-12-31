"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";
import AuthTestimonials from "./AuthTestimonials";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const supabase = createClient();

        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            if (authError.message === "Invalid login credentials") {
                setError("Email hoặc mật khẩu không đúng. Vui lòng thử lại.");
            } else if (authError.message === "Email not confirmed") {
                setError("Vui lòng xác nhận email của bạn trước khi đăng nhập.");
            } else {
                setError(authError.message);
            }
            setIsLoading(false);
            return;
        }

        // Redirect to home or dashboard after successful login
        router.push("/");
        router.refresh();
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
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
                        <h1>Chào mừng trở lại!</h1>
                        <p>
                            Đăng nhập để tiếp tục hành trình từ Zero đến Pro cùng Vietbaopro.
                        </p>
                        <AuthTestimonials />
                    </div>
                    <div className={styles.brandFooter}>
                        <p>&quot;Đừng làm Content theo bản năng. Hãy làm theo Hệ thống.&quot;</p>
                    </div>
                </div>

                {/* Right - Form */}
                <div className={styles.formSide}>
                    <div className={styles.formContainer}>
                        <div className={styles.formHeader}>
                            <h2>Đăng nhập</h2>
                            <p>
                                Chưa có tài khoản?{" "}
                                <Link href="/register" className={styles.link}>
                                    Đăng ký ngay
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

                            <div className="form-group">
                                <label htmlFor="password" className="form-label">
                                    Mật khẩu
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className={styles.forgotPassword}>
                                <Link href="/forgot-password" className={styles.link}>
                                    Quên mật khẩu?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={isLoading}
                                style={{ width: "100%" }}
                            >
                                {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                            </button>
                        </form>

                        <div className={styles.divider}>
                            <span>hoặc</span>
                        </div>

                        <button
                            className={`btn btn-secondary ${styles.socialBtn}`}
                            onClick={handleGoogleLogin}
                            type="button"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Đăng nhập với Google
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

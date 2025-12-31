"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isValidSession, setIsValidSession] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkSession() {
            const supabase = createClient();

            // Check if we have a valid session from the reset link
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setIsValidSession(true);
            } else {
                // Check for error in URL params
                const errorParam = searchParams.get("error");
                const errorDescription = searchParams.get("error_description");

                if (errorParam) {
                    setError(errorDescription || "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.");
                } else {
                    setError("Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu link mới.");
                }
            }
            setChecking(false);
        }

        checkSession();
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }

        setIsLoading(true);
        setError("");

        const supabase = createClient();

        const { error: updateError } = await supabase.auth.updateUser({
            password: password,
        });

        if (updateError) {
            setError(updateError.message);
            setIsLoading(false);
            return;
        }

        setSuccess(true);
        setIsLoading(false);

        // Sign out and redirect to login after 3 seconds
        setTimeout(async () => {
            await supabase.auth.signOut();
            router.push("/login");
        }, 3000);
    };

    if (checking) {
        return (
            <div className={styles.authPage}>
                <div className={styles.loadingBox}>
                    <p>Đang xác thực...</p>
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
                        <h1>Đặt mật khẩu mới</h1>
                        <p>
                            Hãy chọn một mật khẩu mạnh và dễ nhớ. Mật khẩu phải có ít nhất 6 ký tự.
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
                                <div className={styles.successIcon}>✅</div>
                                <h2>Đổi mật khẩu thành công!</h2>
                                <p>
                                    Mật khẩu của bạn đã được cập nhật. Bạn sẽ được chuyển đến trang đăng nhập...
                                </p>
                                <Link href="/login" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "1rem" }}>
                                    Đăng nhập ngay
                                </Link>
                            </div>
                        ) : !isValidSession ? (
                            <div className={styles.errorBox}>
                                <div className={styles.errorIcon}>⚠️</div>
                                <h2>Link không hợp lệ</h2>
                                <p>{error}</p>
                                <Link href="/forgot-password" className="btn btn-primary btn-lg" style={{ width: "100%", marginTop: "1rem" }}>
                                    Yêu cầu link mới
                                </Link>
                                <div className={styles.backToLogin}>
                                    <Link href="/login" className={styles.backLink}>
                                        ← Quay lại đăng nhập
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className={styles.formHeader}>
                                    <h2>Tạo mật khẩu mới</h2>
                                    <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
                                </div>

                                <form onSubmit={handleSubmit} className={styles.form}>
                                    {error && <div className={styles.error}>{error}</div>}

                                    <div className="form-group">
                                        <label htmlFor="password" className="form-label">
                                            Mật khẩu mới
                                        </label>
                                        <input
                                            type="password"
                                            id="password"
                                            className="form-input"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            minLength={6}
                                            required
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
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            minLength={6}
                                            required
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        disabled={isLoading}
                                        style={{ width: "100%" }}
                                    >
                                        {isLoading ? "Đang cập nhật..." : "Đặt mật khẩu mới"}
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className={styles.authPage}><p>Đang tải...</p></div>}>
            <ResetPasswordForm />
        </Suspense>
    );
}

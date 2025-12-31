"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import styles from "./Header.module.css";

export default function Header() {
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setIsLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <header className={styles.header}>
            <div className={`container ${styles.headerContainer}`}>
                {/* Logo */}
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoText}>Vietbao</span>
                    <span className={styles.logoAccent}>Pro</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className={styles.nav}>
                    <Link href="/courses" className={styles.navLink}>
                        Khóa học
                    </Link>
                    <Link href="/resources" className={styles.navLink}>
                        Tài nguyên
                    </Link>
                    <Link href="/about" className={styles.navLink}>
                        Về chúng tôi
                    </Link>
                    <Link href="/blog" className={styles.navLink}>
                        Blog
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className={styles.authButtons}>
                    {isLoading ? (
                        <span className={styles.loading}>...</span>
                    ) : user ? (
                        <>
                            <Link href="/my-learning" className="btn btn-ghost">
                                Khóa học của tôi
                            </Link>
                            <div className={styles.userMenu}>
                                <button className={styles.userButton}>
                                    <span className={styles.userAvatar}>
                                        {user.email?.charAt(0).toUpperCase()}
                                    </span>
                                </button>
                                <div className={styles.dropdown}>
                                    <div className={styles.dropdownHeader}>
                                        <span className={styles.dropdownEmail}>{user.email}</span>
                                    </div>
                                    <Link href="/profile" className={styles.dropdownItem}>
                                        Tài khoản
                                    </Link>
                                    <Link href="/my-learning" className={styles.dropdownItem}>
                                        Khóa học của tôi
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className={styles.dropdownItem}
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="btn btn-ghost">
                                Đăng nhập
                            </Link>
                            <Link href="/register" className="btn btn-primary">
                                Bắt đầu học
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className={styles.menuButton}
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`${styles.menuIcon} ${isMenuOpen ? styles.open : ""}`}></span>
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.mobileMenuOpen : ""}`}>
                <nav className={styles.mobileNav}>
                    <Link href="/courses" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                        Khóa học
                    </Link>
                    <Link href="/resources" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                        Tài nguyên
                    </Link>
                    <Link href="/about" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                        Về chúng tôi
                    </Link>
                    <Link href="/blog" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                        Blog
                    </Link>
                    {user && (
                        <Link href="/my-learning" className={styles.mobileNavLink} onClick={() => setIsMenuOpen(false)}>
                            Khóa học của tôi
                        </Link>
                    )}
                    <div className={styles.mobileAuthButtons}>
                        {user ? (
                            <>
                                <div className={styles.mobileUserInfo}>
                                    <span>{user.email}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMenuOpen(false);
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Đăng xuất
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="btn btn-secondary" onClick={() => setIsMenuOpen(false)}>
                                    Đăng nhập
                                </Link>
                                <Link href="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                                    Bắt đầu học
                                </Link>
                            </>
                        )}
                    </div>
                </nav>
            </div>
        </header>
    );
}

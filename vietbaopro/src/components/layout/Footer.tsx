import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerGrid}>
                    {/* Brand Column */}
                    <div className={styles.brandColumn}>
                        <Link href="/" className={styles.logo}>
                            <span className={styles.logoText}>Vietbao</span>
                            <span className={styles.logoAccent}>Pro</span>
                        </Link>
                        <p className={styles.tagline}>
                            Content AI: Cắt giảm 50% thời gian, nhân đôi Chất lượng.
                        </p>
                        <p className={styles.mission}>
                            Biến sự hỗn loạn thành trật tự. Biến người mới thành Pro trong 30 ngày.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Khóa học</h4>
                        <ul className={styles.linksList}>
                            <li>
                                <Link href="/courses">Tất cả khóa học</Link>
                            </li>
                            <li>
                                <Link href="/courses/pro-content-system">Pro Content System</Link>
                            </li>
                            <li>
                                <Link href="/resources">Tất cả tài nguyên</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Hỗ trợ</h4>
                        <ul className={styles.linksList}>
                            <li>
                                <Link href="/faq">Câu hỏi thường gặp</Link>
                            </li>
                            <li>
                                <Link href="/contact">Liên hệ</Link>
                            </li>
                            <li>
                                <Link href="/refund-policy">Chính sách hoàn tiền</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className={styles.linksColumn}>
                        <h4 className={styles.columnTitle}>Kết nối</h4>
                        <ul className={styles.linksList}>
                            <li>
                                <a href="https://facebook.com/vietbaopro" target="_blank" rel="noopener noreferrer">
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href="https://tiktok.com/@vietbaopro" target="_blank" rel="noopener noreferrer">
                                    TikTok
                                </a>
                            </li>
                            <li>
                                <a href="https://youtube.com/@vietbaopro" target="_blank" rel="noopener noreferrer">
                                    YouTube
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={styles.bottomBar}>
                    <p className={styles.copyright}>
                        © {new Date().getFullYear()} Vietbaopro. All rights reserved.
                    </p>
                    <div className={styles.legalLinks}>
                        <Link href="/terms">Điều khoản sử dụng</Link>
                        <Link href="/privacy">Chính sách bảo mật</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

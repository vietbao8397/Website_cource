import { Header, Footer } from "@/components/layout";
import styles from "./page.module.css";

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className={styles.main}>
                <section className={styles.hero}>
                    <div className="container">
                        <h1>Về Vietbaopro</h1>
                        <p className={styles.subtitle}>
                            Giúp bạn tạo nội dung chuyên nghiệp với sự hỗ trợ của AI
                        </p>
                    </div>
                </section>

                <section className={styles.content}>
                    <div className="container">
                        <div className={styles.grid}>
                            <div className={styles.section}>
                                <h2>🎯 Sứ mệnh</h2>
                                <p>
                                    Vietbaopro ra đời với sứ mệnh giúp các doanh nhân, marketer, và creator
                                    Việt Nam tận dụng sức mạnh của AI để tạo ra nội dung chất lượng cao
                                    một cách nhanh chóng và hiệu quả.
                                </p>
                                <p>
                                    Chúng tôi tin rằng AI không thay thế con người, mà là công cụ
                                    giúp bạn nhân đôi năng suất và giải phóng thời gian cho những việc
                                    thực sự quan trọng.
                                </p>
                            </div>

                            <div className={styles.section}>
                                <h2>👨‍💼 Người sáng lập</h2>
                                <div className={styles.founder}>
                                    <div className={styles.avatar}>VB</div>
                                    <div className={styles.founderInfo}>
                                        <h3>Việt Bảo</h3>
                                        <p className={styles.title}>
                                            Chuyên gia Hệ thống hóa Quy trình Sáng tạo Nội dung
                                        </p>
                                        <p>
                                            Với hơn 5 năm kinh nghiệm trong lĩnh vực Marketing và Content,
                                            Việt Bảo đã giúp hàng trăm doanh nghiệp và cá nhân xây dựng
                                            hệ thống nội dung hiệu quả với sự hỗ trợ của AI.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2>📊 Thành tựu</h2>
                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>500+</span>
                                        <span className={styles.statLabel}>Học viên</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>5+</span>
                                        <span className={styles.statLabel}>Khóa học</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statValue}>98%</span>
                                        <span className={styles.statLabel}>Hài lòng</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.section}>
                                <h2>📧 Liên hệ</h2>
                                <p>
                                    Email: <a href="mailto:contact@vietbaopro.com">contact@vietbaopro.com</a>
                                </p>
                                <p>
                                    Hotline: <a href="tel:0901234567">0901 234 567</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

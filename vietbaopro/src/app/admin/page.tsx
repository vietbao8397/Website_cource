import Link from "next/link";
import styles from "./page.module.css";
import BackupButton from "./BackupButton";
import StatsCards from "./components/dashboard/StatsCards";
import CustomerInsights from "./components/dashboard/CustomerInsights";
import ActionItems from "./components/dashboard/ActionItems";
import ActivityTimeline from "./components/dashboard/ActivityTimeline";

export default async function AdminDashboard() {
    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>📊 Dashboard Insights</h1>
                    <p>Xin chào, Admin! Đây là tổng quan tình hình kinh doanh.</p>
                </div>
                <BackupButton />
            </header>

            {/* Section 1: Revenue & Conversion Stats */}
            <section className={styles.section}>
                <StatsCards />
            </section>

            {/* Section 2: Customer Insights + Pipeline */}
            <section className={styles.section}>
                <CustomerInsights />
            </section>

            {/* Section 3: Action Items */}
            <section className={styles.section}>
                <ActionItems />
            </section>

            {/* Section 4: Recent Activity */}
            <section className={styles.section}>
                <ActivityTimeline />
            </section>

            {/* Quick Links */}
            <section className={styles.quickLinks}>
                <Link href="/admin/orders" className={styles.quickLink}>
                    📦 Quản lý đơn hàng
                </Link>
                <Link href="/admin/courses" className={styles.quickLink}>
                    🎓 Quản lý khóa học
                </Link>
                <Link href="/admin/pipeline" className={styles.quickLink}>
                    📈 Sales Pipeline
                </Link>
                <Link href="/admin/emails" className={styles.quickLink}>
                    ✉️ Email Marketing
                </Link>
            </section>
        </div>
    );
}

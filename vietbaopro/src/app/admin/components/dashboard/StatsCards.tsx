"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

interface StatsData {
    revenue: {
        today: number;
        yesterday: number;
        thisWeek: number;
        lastWeek: number;
        thisMonth: number;
        weekChange: string;
    };
    orders: {
        today: number;
        yesterday: number;
        total: number;
        change: number;
    };
    avgOrderValue: number;
    conversionRate: number;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export default function StatsCards() {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard/stats")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setStats(data.stats);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className={styles.statsGrid}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`${styles.statCard} ${styles.skeleton}`}>
                        <div className={styles.skeletonText}></div>
                        <div className={styles.skeletonNumber}></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return <div className={styles.error}>Không thể tải dữ liệu</div>;
    }

    const weekChange = parseInt(stats.revenue.weekChange);
    const orderChange = stats.orders.change;

    return (
        <div className={styles.statsGrid}>
            {/* Revenue Card */}
            <div className={styles.statCard}>
                <div className={styles.statIcon}>💰</div>
                <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Doanh thu tuần</span>
                    <span className={styles.statValue}>{formatCurrency(stats.revenue.thisWeek)}</span>
                    <span className={`${styles.statChange} ${weekChange >= 0 ? styles.positive : styles.negative}`}>
                        {weekChange >= 0 ? "▲" : "▼"} {Math.abs(weekChange)}% vs tuần trước
                    </span>
                </div>
            </div>

            {/* Orders Card */}
            <div className={styles.statCard}>
                <div className={styles.statIcon}>📦</div>
                <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Đơn hàng hôm nay</span>
                    <span className={styles.statValue}>{stats.orders.today}</span>
                    <span className={`${styles.statChange} ${orderChange >= 0 ? styles.positive : styles.negative}`}>
                        {orderChange >= 0 ? "▲" : "▼"} {Math.abs(orderChange)} vs hôm qua
                    </span>
                </div>
            </div>

            {/* Conversion Rate Card */}
            <div className={styles.statCard}>
                <div className={styles.statIcon}>📈</div>
                <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Tỷ lệ chuyển đổi</span>
                    <span className={styles.statValue}>{stats.conversionRate}%</span>
                    <span className={styles.statChange}>Checkout → Mua hàng</span>
                </div>
            </div>

            {/* Average Order Value Card */}
            <div className={styles.statCard}>
                <div className={styles.statIcon}>💵</div>
                <div className={styles.statInfo}>
                    <span className={styles.statLabel}>Giá trị TB/đơn</span>
                    <span className={styles.statValue}>{formatCurrency(stats.avgOrderValue)}</span>
                    <span className={styles.statChange}>Tổng {stats.orders.total} đơn</span>
                </div>
            </div>
        </div>
    );
}

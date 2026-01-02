"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

interface CustomerData {
    new: {
        today: number;
        thisWeek: number;
        thisMonth: number;
        monthChange: string;
    };
    total: number;
    pipelineTotal: number;
    distribution: Array<{
        stage: string;
        label: string;
        count: number;
        percentage: number;
    }>;
}

export default function CustomerInsights() {
    const [data, setData] = useState<CustomerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard/customers")
            .then((res) => res.json())
            .then((response) => {
                if (response.success) {
                    setData(response.customers);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className={styles.insightsGrid}>
                <div className={`${styles.insightCard} ${styles.skeleton}`}></div>
                <div className={`${styles.insightCard} ${styles.skeleton}`}></div>
            </div>
        );
    }

    if (!data) {
        return <div className={styles.error}>Không thể tải dữ liệu</div>;
    }

    const monthChange = parseInt(data.new.monthChange);
    const maxCount = Math.max(...data.distribution.map((d) => d.count), 1);

    return (
        <div className={styles.insightsGrid}>
            {/* New Customers Panel */}
            <div className={styles.insightCard}>
                <h3 className={styles.insightTitle}>👥 Khách hàng mới</h3>
                <div className={styles.customerStats}>
                    <div className={styles.customerStat}>
                        <span className={styles.customerValue}>{data.new.today}</span>
                        <span className={styles.customerLabel}>Hôm nay</span>
                    </div>
                    <div className={styles.customerStat}>
                        <span className={styles.customerValue}>{data.new.thisWeek}</span>
                        <span className={styles.customerLabel}>Tuần này</span>
                    </div>
                    <div className={styles.customerStat}>
                        <span className={styles.customerValue}>{data.new.thisMonth}</span>
                        <span className={styles.customerLabel}>Tháng này</span>
                    </div>
                </div>
                <div className={`${styles.monthChange} ${monthChange >= 0 ? styles.positive : styles.negative}`}>
                    {monthChange >= 0 ? "▲" : "▼"} {Math.abs(monthChange)}% so với tháng trước
                </div>
            </div>

            {/* Pipeline Distribution */}
            <div className={styles.insightCard}>
                <h3 className={styles.insightTitle}>📊 Phân bố Pipeline</h3>
                <div className={styles.pipelineChart}>
                    {data.distribution.map((item) => (
                        <div key={item.stage} className={styles.pipelineRow}>
                            <span className={styles.pipelineLabel}>{item.label}</span>
                            <div className={styles.pipelineBarWrapper}>
                                <div
                                    className={styles.pipelineBar}
                                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                                    data-stage={item.stage}
                                ></div>
                            </div>
                            <span className={styles.pipelineCount}>{item.count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

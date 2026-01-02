"use client";

import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";

interface Activity {
    id: string;
    time: string;
    emoji: string;
    action: string;
    user: string;
    detail: string;
    amount: number | null;
}

function formatCurrency(value: number): string {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
}

export default function ActivityTimeline() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard/activity")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setActivities(data.activities);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className={styles.timelineSection}>
                <h3 className={styles.sectionTitle}>📋 Hoạt động gần đây</h3>
                <div className={styles.timeline}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className={`${styles.timelineItem} ${styles.skeleton}`}></div>
                    ))}
                </div>
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className={styles.timelineSection}>
                <h3 className={styles.sectionTitle}>📋 Hoạt động gần đây</h3>
                <div className={styles.emptyState}>Chưa có hoạt động nào</div>
            </div>
        );
    }

    return (
        <div className={styles.timelineSection}>
            <h3 className={styles.sectionTitle}>📋 Hoạt động gần đây</h3>
            <div className={styles.timeline}>
                {activities.map((activity) => (
                    <div key={activity.id} className={styles.timelineItem}>
                        <span className={styles.timelineTime}>{activity.time}</span>
                        <span className={styles.timelineEmoji}>{activity.emoji}</span>
                        <span className={styles.timelineContent}>
                            <strong>{activity.user}</strong> {activity.action}
                            {activity.detail && <span className={styles.timelineDetail}> {activity.detail}</span>}
                        </span>
                        {activity.amount && (
                            <span className={styles.timelineAmount}>{formatCurrency(activity.amount)}</span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

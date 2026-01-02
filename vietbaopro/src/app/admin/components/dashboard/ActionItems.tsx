"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./Dashboard.module.css";

interface ActionItem {
    id: string;
    label: string;
    emoji: string;
    count: number;
    link: string;
}

export default function ActionItems() {
    const [actions, setActions] = useState<ActionItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/dashboard/actions")
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setActions(data.actions);
                }
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className={styles.actionsSection}>
                <h3 className={styles.sectionTitle}>⚠️ Cần xử lý ngay</h3>
                <div className={styles.actionsGrid}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`${styles.actionCard} ${styles.skeleton}`}></div>
                    ))}
                </div>
            </div>
        );
    }

    const totalActions = actions.reduce((sum, a) => sum + a.count, 0);

    return (
        <div className={styles.actionsSection}>
            <h3 className={styles.sectionTitle}>
                ⚠️ Cần xử lý ngay
                {totalActions > 0 && (
                    <span className={styles.totalBadge}>{totalActions}</span>
                )}
            </h3>
            <div className={styles.actionsGrid}>
                {actions.map((action) => (
                    <Link
                        key={action.id}
                        href={action.link}
                        className={`${styles.actionCard} ${action.count > 0 ? styles.hasItems : styles.noItems}`}
                    >
                        <span className={styles.actionEmoji}>{action.emoji}</span>
                        <span className={styles.actionLabel}>{action.label}</span>
                        <span className={styles.actionCount}>{action.count}</span>
                        <span className={styles.actionArrow}>→</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

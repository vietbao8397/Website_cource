"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface Customer {
    id: string;
    email: string;
    full_name: string | null;
    phone: string | null;
    stage: string;
    tags: string[];
    source: string | null;
    last_activity_at: string;
    created_at: string;
}

interface StageCounts {
    visitor: number;
    lead: number;
    prospect: number;
    hot_lead: number;
    customer: number;
    repeat_customer: number;
}

const STAGE_INFO: Record<string, { label: string; color: string; emoji: string }> = {
    visitor: { label: "Visitor", color: "#6b7280", emoji: "👀" },
    lead: { label: "Lead", color: "#3b82f6", emoji: "📥" },
    prospect: { label: "Prospect", color: "#8b5cf6", emoji: "🎯" },
    hot_lead: { label: "Hot Lead", color: "#f59e0b", emoji: "🔥" },
    customer: { label: "Customer", color: "#22c55e", emoji: "✅" },
    repeat_customer: { label: "VIP", color: "#ec4899", emoji: "👑" },
};

export default function PipelinePage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [stageCounts, setStageCounts] = useState<StageCounts | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeStage, setActiveStage] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchCustomers();
    }, [activeStage, searchQuery]);

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeStage !== "all") params.set("stage", activeStage);
            if (searchQuery) params.set("search", searchQuery);

            const res = await fetch(`/api/admin/pipeline?${params}`);
            const data = await res.json();

            if (data.success) {
                setCustomers(data.customers || []);
                setStageCounts(data.stageCounts || null);
            }
        } catch (error) {
            console.error("Failed to fetch pipeline:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totalCustomers = stageCounts
        ? Object.values(stageCounts).reduce((a, b) => a + b, 0)
        : 0;

    return (
        <div className={styles.pipelinePage}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>📊 Sales Pipeline</h1>
                    <p>Quản lý khách hàng theo từng giai đoạn trong phễu bán hàng</p>
                </div>
            </div>

            {/* Stage Filter Cards */}
            <div className={styles.stageCards}>
                <button
                    className={`${styles.stageCard} ${activeStage === "all" ? styles.active : ""}`}
                    onClick={() => setActiveStage("all")}
                >
                    <span className={styles.stageEmoji}>📋</span>
                    <span className={styles.stageLabel}>Tất cả</span>
                    <span className={styles.stageCount}>{totalCustomers}</span>
                </button>
                {Object.entries(STAGE_INFO).map(([stage, info]) => (
                    <button
                        key={stage}
                        className={`${styles.stageCard} ${activeStage === stage ? styles.active : ""}`}
                        onClick={() => setActiveStage(stage)}
                        style={{ "--stage-color": info.color } as React.CSSProperties}
                    >
                        <span className={styles.stageEmoji}>{info.emoji}</span>
                        <span className={styles.stageLabel}>{info.label}</span>
                        <span className={styles.stageCount}>
                            {stageCounts?.[stage as keyof StageCounts] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className={styles.searchBar}>
                <input
                    type="text"
                    placeholder="Tìm theo email hoặc tên..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Customer List */}
            {isLoading ? (
                <div className={styles.loading}>Đang tải...</div>
            ) : customers.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Chưa có khách hàng nào trong giai đoạn này.</p>
                </div>
            ) : (
                <div className={styles.customerList}>
                    <div className={styles.listHeader}>
                        <span>Khách hàng</span>
                        <span>Stage</span>
                        <span>Tags</span>
                        <span>Hoạt động gần nhất</span>
                        <span></span>
                    </div>
                    {customers.map((customer) => (
                        <div key={customer.id} className={styles.customerRow}>
                            <div className={styles.customerInfo}>
                                <span className={styles.customerName}>
                                    {customer.full_name || customer.email.split("@")[0]}
                                </span>
                                <span className={styles.customerEmail}>{customer.email}</span>
                            </div>
                            <div className={styles.customerStage}>
                                <span
                                    className={styles.stageBadge}
                                    style={{
                                        backgroundColor: STAGE_INFO[customer.stage]?.color || "#6b7280",
                                    }}
                                >
                                    {STAGE_INFO[customer.stage]?.emoji}{" "}
                                    {STAGE_INFO[customer.stage]?.label || customer.stage}
                                </span>
                            </div>
                            <div className={styles.customerTags}>
                                {customer.tags?.slice(0, 2).map((tag, i) => (
                                    <span key={i} className={styles.tag}>
                                        {tag}
                                    </span>
                                ))}
                                {customer.tags?.length > 2 && (
                                    <span className={styles.tagMore}>+{customer.tags.length - 2}</span>
                                )}
                            </div>
                            <div className={styles.customerDate}>
                                {formatDate(customer.last_activity_at)}
                            </div>
                            <div className={styles.customerActions}>
                                <Link
                                    href={`/admin/pipeline/${customer.id}`}
                                    className={styles.viewBtn}
                                >
                                    Xem chi tiết →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

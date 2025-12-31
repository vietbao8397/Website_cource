"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
    notes: string | null;
    last_activity_at: string;
    created_at: string;
}

interface Event {
    id: string;
    event_type: string;
    event_data: Record<string, unknown>;
    created_at: string;
}

interface Email {
    id: string;
    status: string;
    scheduled_at: string;
    sent_at: string | null;
    email_sequences: { name: string } | null;
    email_sequence_steps: { subject: string; step_order: number } | null;
}

interface Order {
    id: string;
    amount: number;
    status: string;
    created_at: string;
    courses: { id: string; title: string; slug: string }[] | null;
}

const STAGE_OPTIONS = [
    { value: "visitor", label: "Visitor" },
    { value: "lead", label: "Lead" },
    { value: "prospect", label: "Prospect" },
    { value: "hot_lead", label: "Hot Lead" },
    { value: "customer", label: "Customer" },
    { value: "repeat_customer", label: "VIP" },
];

const EVENT_LABELS: Record<string, string> = {
    resource_download: "📥 Tải tài nguyên",
    checkout_view: "🎯 Xem checkout",
    checkout_abandon: "🔥 Bỏ cuộc checkout",
    purchase: "✅ Mua hàng",
    login: "🔐 Đăng nhập",
};

export default function CustomerDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [emails, setEmails] = useState<Email[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [editStage, setEditStage] = useState("");
    const [editNotes, setEditNotes] = useState("");

    useEffect(() => {
        async function init() {
            const { id } = await params;
            setCustomerId(id);
            fetchCustomer(id);
        }
        init();
    }, [params]);

    const fetchCustomer = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/admin/pipeline/${id}`);
            const data = await res.json();

            if (data.success) {
                setCustomer(data.customer);
                setEvents(data.events || []);
                setEmails(data.emails || []);
                setOrders(data.orders || []);
                setEditStage(data.customer.stage);
                setEditNotes(data.customer.notes || "");
            }
        } catch (error) {
            console.error("Failed to fetch customer:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!customerId) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/admin/pipeline/${customerId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    stage: editStage,
                    notes: editNotes,
                }),
            });

            if (res.ok) {
                fetchCustomer(customerId);
            }
        } catch (error) {
            console.error("Failed to save:", error);
        } finally {
            setIsSaving(false);
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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    };

    if (isLoading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    if (!customer) {
        return <div className={styles.error}>Không tìm thấy khách hàng</div>;
    }

    return (
        <div className={styles.detailPage}>
            {/* Header */}
            <div className={styles.header}>
                <Link href="/admin/pipeline" className={styles.backLink}>
                    ← Quay lại Pipeline
                </Link>
                <div className={styles.customerHeader}>
                    <div className={styles.avatar}>
                        {(customer.full_name || customer.email).charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.customerMeta}>
                        <h1>{customer.full_name || customer.email.split("@")[0]}</h1>
                        <p>{customer.email}</p>
                        {customer.phone && <p>📞 {customer.phone}</p>}
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {/* Left Column - Customer Info */}
                <div className={styles.infoColumn}>
                    <div className={styles.card}>
                        <h3>Thông tin</h3>
                        <div className={styles.formGroup}>
                            <label>Giai đoạn (Stage)</label>
                            <select
                                value={editStage}
                                onChange={(e) => setEditStage(e.target.value)}
                            >
                                {STAGE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Nguồn</label>
                            <input type="text" value={customer.source || "N/A"} disabled />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tags</label>
                            <div className={styles.tags}>
                                {customer.tags?.map((tag, i) => (
                                    <span key={i} className={styles.tag}>
                                        {tag}
                                    </span>
                                ))}
                                {(!customer.tags || customer.tags.length === 0) && (
                                    <span className={styles.noTags}>Chưa có tag</span>
                                )}
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Ghi chú</label>
                            <textarea
                                value={editNotes}
                                onChange={(e) => setEditNotes(e.target.value)}
                                rows={4}
                                placeholder="Ghi chú về khách hàng..."
                            />
                        </div>
                        <button
                            className={styles.saveBtn}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? "Đang lưu..." : "💾 Lưu thay đổi"}
                        </button>
                    </div>

                    {/* Orders */}
                    {orders.length > 0 && (
                        <div className={styles.card}>
                            <h3>📦 Đơn hàng ({orders.length})</h3>
                            <div className={styles.orderList}>
                                {orders.map((order) => (
                                    <div key={order.id} className={styles.orderItem}>
                                        <div className={styles.orderInfo}>
                                            <span className={styles.orderCourse}>
                                                {(order.courses as any)?.[0]?.title || "N/A"}
                                            </span>
                                            <span className={styles.orderAmount}>
                                                {formatPrice(order.amount)}
                                            </span>
                                        </div>
                                        <div className={styles.orderMeta}>
                                            <span
                                                className={`${styles.orderStatus} ${styles[`status_${order.status}`]}`}
                                            >
                                                {order.status}
                                            </span>
                                            <span className={styles.orderDate}>
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column - Timeline */}
                <div className={styles.timelineColumn}>
                    {/* Events */}
                    <div className={styles.card}>
                        <h3>📊 Lịch sử hoạt động</h3>
                        {events.length === 0 ? (
                            <p className={styles.emptyText}>Chưa có hoạt động nào</p>
                        ) : (
                            <div className={styles.timeline}>
                                {events.map((event) => (
                                    <div key={event.id} className={styles.timelineItem}>
                                        <div className={styles.timelineDot} />
                                        <div className={styles.timelineContent}>
                                            <span className={styles.eventType}>
                                                {EVENT_LABELS[event.event_type] || event.event_type}
                                            </span>
                                            <span className={styles.eventDate}>
                                                {formatDate(event.created_at)}
                                            </span>
                                            {event.event_data &&
                                                Object.keys(event.event_data).length > 0 && (
                                                    <div className={styles.eventData}>
                                                        {JSON.stringify(event.event_data)}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Emails */}
                    <div className={styles.card}>
                        <h3>📧 Email đã gửi/lên lịch</h3>
                        {emails.length === 0 ? (
                            <p className={styles.emptyText}>Chưa có email nào</p>
                        ) : (
                            <div className={styles.emailList}>
                                {emails.map((email) => (
                                    <div key={email.id} className={styles.emailItem}>
                                        <div className={styles.emailInfo}>
                                            <span className={styles.emailSubject}>
                                                {email.email_sequence_steps?.subject || "N/A"}
                                            </span>
                                            <span className={styles.emailSequence}>
                                                {email.email_sequences?.name}
                                            </span>
                                        </div>
                                        <div className={styles.emailMeta}>
                                            <span
                                                className={`${styles.emailStatus} ${styles[`email_${email.status}`]}`}
                                            >
                                                {email.status === "pending" ? "⏳ Chờ gửi" :
                                                    email.status === "sent" ? "✅ Đã gửi" :
                                                        email.status === "failed" ? "❌ Lỗi" : email.status}
                                            </span>
                                            <span className={styles.emailDate}>
                                                {email.sent_at
                                                    ? formatDate(email.sent_at)
                                                    : `Dự kiến: ${formatDate(email.scheduled_at)}`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

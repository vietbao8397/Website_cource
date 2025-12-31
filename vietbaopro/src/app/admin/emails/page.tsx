"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface EmailStep {
    id: string;
    step_order: number;
    delay_hours: number;
    send_at_hour: number;
    send_at_minute: number;
    subject: string;
    content: string;
    is_active: boolean;
}

interface EmailSequence {
    id: string;
    name: string;
    description: string | null;
    trigger_event: string;
    is_active: boolean;
    email_sequence_steps: EmailStep[];
}

const TRIGGER_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
    resource_download: { label: "Tải tài nguyên", emoji: "📥", color: "#3b82f6" },
    checkout_abandon: { label: "Bỏ checkout", emoji: "🔥", color: "#f59e0b" },
    purchase: { label: "Mua hàng", emoji: "✅", color: "#22c55e" },
};

export default function EmailSequencesPage() {
    const [sequences, setSequences] = useState<EmailSequence[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStep, setEditingStep] = useState<EmailStep | null>(null);
    const [editForm, setEditForm] = useState({ subject: "", content: "", delay_days: 0, send_at_hour: 9, send_at_minute: 0 });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSequences();
    }, []);

    const fetchSequences = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/sequences");
            const data = await res.json();
            if (data.success) {
                setSequences(data.sequences || []);
            }
        } catch (error) {
            console.error("Failed to fetch sequences:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditClick = (step: EmailStep) => {
        setEditingStep(step);
        setEditForm({
            subject: step.subject,
            content: step.content || "",
            delay_days: Math.floor(step.delay_hours / 24),
            send_at_hour: step.send_at_hour ?? 9,
            send_at_minute: step.send_at_minute ?? 0,
        });
    };

    const handleSaveStep = async () => {
        if (!editingStep) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/admin/sequences/steps/${editingStep.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    subject: editForm.subject,
                    content: editForm.content,
                    delay_hours: editForm.delay_days * 24,
                    send_at_hour: editForm.send_at_hour,
                    send_at_minute: editForm.send_at_minute,
                }),
            });

            if (res.ok) {
                // Update local state
                setSequences((prev) =>
                    prev.map((seq) => ({
                        ...seq,
                        email_sequence_steps: seq.email_sequence_steps.map((step) =>
                            step.id === editingStep.id
                                ? { ...step, ...editForm }
                                : step
                        ),
                    }))
                );
                setEditingStep(null);
            } else {
                alert("Lỗi khi lưu. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("Lỗi khi lưu. Vui lòng thử lại.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatDelay = (step: EmailStep) => {
        const days = Math.floor(step.delay_hours / 24);
        const hour = step.send_at_hour ?? 9;
        const minute = step.send_at_minute ?? 0;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        if (days === 0) return `Gửi ngay lúc ${timeStr}`;
        return `Sau ${days} ngày, lúc ${timeStr}`;
    };

    if (isLoading) {
        return <div className={styles.loading}>Đang tải...</div>;
    }

    return (
        <div className={styles.emailPage}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <h1>📧 Quản lý Email Marketing</h1>
                    <p>Chỉnh sửa nội dung email tự động theo từng giai đoạn khách hàng</p>
                </div>
            </div>

            {/* Sequences List */}
            <div className={styles.sequencesList}>
                {sequences.map((sequence) => {
                    const triggerInfo = TRIGGER_LABELS[sequence.trigger_event] || {
                        label: sequence.trigger_event,
                        emoji: "📧",
                        color: "#6b7280",
                    };

                    return (
                        <div key={sequence.id} className={styles.sequenceCard}>
                            <div className={styles.sequenceHeader}>
                                <div className={styles.sequenceTitle}>
                                    <span
                                        className={styles.triggerBadge}
                                        style={{ backgroundColor: triggerInfo.color }}
                                    >
                                        {triggerInfo.emoji} {triggerInfo.label}
                                    </span>
                                    <h2>{sequence.name}</h2>
                                    {sequence.description && (
                                        <p className={styles.sequenceDesc}>{sequence.description}</p>
                                    )}
                                </div>
                                <div className={styles.sequenceStatus}>
                                    <span className={sequence.is_active ? styles.active : styles.inactive}>
                                        {sequence.is_active ? "✅ Đang hoạt động" : "⏸️ Tạm dừng"}
                                    </span>
                                </div>
                            </div>

                            <div className={styles.stepsTimeline}>
                                {sequence.email_sequence_steps
                                    .sort((a, b) => a.step_order - b.step_order)
                                    .map((step, index) => (
                                        <div key={step.id} className={styles.stepCard}>
                                            <div className={styles.stepNumber}>
                                                <span>{index + 1}</span>
                                            </div>
                                            <div className={styles.stepContent}>
                                                <div className={styles.stepMeta}>
                                                    <span className={styles.stepDelay}>
                                                        ⏰ {formatDelay(step)}
                                                    </span>
                                                    <span className={step.is_active ? styles.stepActive : styles.stepInactive}>
                                                        {step.is_active ? "Bật" : "Tắt"}
                                                    </span>
                                                </div>
                                                <h3 className={styles.stepSubject}>{step.subject}</h3>
                                                <div
                                                    className={styles.stepPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: step.content ? step.content.substring(0, 150) + "..." : "Chưa có nội dung",
                                                    }}
                                                />
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => handleEditClick(step)}
                                                >
                                                    ✏️ Chỉnh sửa
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit Modal */}
            {editingStep && (
                <div className={styles.modalOverlay} onClick={() => setEditingStep(null)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h2>✏️ Chỉnh sửa Email</h2>
                            <button
                                className={styles.closeBtn}
                                onClick={() => setEditingStep(null)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className={styles.modalBody}>
                            <div className={styles.formGroup}>
                                <label>Tiêu đề (Subject)</label>
                                <input
                                    type="text"
                                    value={editForm.subject}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, subject: e.target.value }))
                                    }
                                    placeholder="Nhập tiêu đề email..."
                                />
                                <p className={styles.hint}>
                                    Biến hỗ trợ: {"{{name}}"}, {"{{course_name}}"}, {"{{resource_name}}"}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label>⏰ Thời gian gửi (sau khi trigger)</label>
                                <div className={styles.delayInputGroup}>
                                    <div className={styles.delayInput}>
                                        <input
                                            type="number"
                                            min="0"
                                            value={editForm.delay_days}
                                            onChange={(e) => {
                                                const days = parseInt(e.target.value) || 0;
                                                setEditForm((prev) => ({ ...prev, delay_days: days }));
                                            }}
                                        />
                                        <span>ngày</span>
                                    </div>
                                    <span className={styles.delayLabel}>vào lúc</span>
                                    <div className={styles.delayInput}>
                                        <input
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={editForm.send_at_hour}
                                            onChange={(e) => {
                                                const hour = parseInt(e.target.value) || 0;
                                                setEditForm((prev) => ({ ...prev, send_at_hour: Math.min(23, Math.max(0, hour)) }));
                                            }}
                                        />
                                        <span>:</span>
                                        <input
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={editForm.send_at_minute}
                                            onChange={(e) => {
                                                const minute = parseInt(e.target.value) || 0;
                                                setEditForm((prev) => ({ ...prev, send_at_minute: Math.min(59, Math.max(0, minute)) }));
                                            }}
                                        />
                                    </div>
                                </div>
                                <p className={styles.hint}>
                                    {editForm.delay_days === 0
                                        ? `Gửi ngay khi trigger xảy ra, vào lúc ${editForm.send_at_hour.toString().padStart(2, '0')}:${editForm.send_at_minute.toString().padStart(2, '0')}`
                                        : `Gửi sau ${editForm.delay_days} ngày, vào lúc ${editForm.send_at_hour.toString().padStart(2, '0')}:${editForm.send_at_minute.toString().padStart(2, '0')}`}
                                </p>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Nội dung (HTML)</label>
                                <textarea
                                    value={editForm.content}
                                    onChange={(e) =>
                                        setEditForm((prev) => ({ ...prev, content: e.target.value }))
                                    }
                                    rows={15}
                                    placeholder="Nhập nội dung HTML..."
                                />
                            </div>
                            <div className={styles.previewSection}>
                                <label>Xem trước:</label>
                                <div
                                    className={styles.previewBox}
                                    dangerouslySetInnerHTML={{ __html: editForm.content }}
                                />
                            </div>
                        </div>
                        <div className={styles.modalFooter}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setEditingStep(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className={styles.saveBtn}
                                onClick={handleSaveStep}
                                disabled={isSaving}
                            >
                                {isSaving ? "Đang lưu..." : "💾 Lưu thay đổi"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

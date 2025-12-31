"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

interface EmailStep {
    id: string;
    step_order: number;
    delay_hours: number;
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
    const [editForm, setEditForm] = useState({ subject: "", content: "" });
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
            content: step.content,
        });
    };

    const handleSaveStep = async () => {
        if (!editingStep) return;
        setIsSaving(true);

        try {
            const res = await fetch(`/api/admin/sequences/steps/${editingStep.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
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

    const formatDelayHours = (hours: number) => {
        if (hours === 0) return "Gửi ngay";
        if (hours < 24) return `Sau ${hours} giờ`;
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        if (remainingHours === 0) return `Sau ${days} ngày`;
        return `Sau ${days} ngày ${remainingHours} giờ`;
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
                                                        ⏰ {formatDelayHours(step.delay_hours)}
                                                    </span>
                                                    <span className={step.is_active ? styles.stepActive : styles.stepInactive}>
                                                        {step.is_active ? "Bật" : "Tắt"}
                                                    </span>
                                                </div>
                                                <h3 className={styles.stepSubject}>{step.subject}</h3>
                                                <div
                                                    className={styles.stepPreview}
                                                    dangerouslySetInnerHTML={{
                                                        __html: step.content.substring(0, 150) + "...",
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

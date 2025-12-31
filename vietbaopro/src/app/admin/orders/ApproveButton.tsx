"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendCourseActivatedEmail } from "@/lib/email";
import styles from "./page.module.css";

interface ApproveButtonProps {
    orderId: string;
    userId: string | null;
    courseId: string;
    customerEmail: string;
    customerName: string;
    courseName: string;
    courseSlug: string;
}

export default function ApproveButton({
    orderId,
    userId,
    courseId,
    customerEmail,
    customerName,
    courseName,
    courseSlug,
}: ApproveButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleApprove = async () => {
        if (!userId) {
            setError("Đơn hàng này chưa có User ID. Không thể kích hoạt tự động.");
            return;
        }

        setIsLoading(true);
        setError("");

        const supabase = createClient();

        // Update order status to 'paid'
        // The database trigger will automatically create the enrollment
        const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", orderId);

        if (updateError) {
            setError("Lỗi: " + updateError.message);
            setIsLoading(false);
            return;
        }

        // Send course activation email
        if (customerEmail) {
            sendCourseActivatedEmail({
                email: customerEmail,
                customerName: customerName || "Khách hàng",
                courseName: courseName,
                courseSlug: courseSlug,
                orderNumber: orderId.slice(0, 8).toUpperCase(),
            });
        }

        // Refresh the page to show updated status
        router.refresh();
        setIsLoading(false);
    };

    const handleReject = async () => {
        setIsLoading(true);
        setError("");

        const supabase = createClient();

        const { error: updateError } = await supabase
            .from("orders")
            .update({ status: "cancelled" })
            .eq("id", orderId);

        if (updateError) {
            setError("Lỗi: " + updateError.message);
            setIsLoading(false);
            return;
        }

        router.refresh();
        setIsLoading(false);
    };

    return (
        <div className={styles.actionButtons}>
            <button
                onClick={handleApprove}
                disabled={isLoading}
                className={`${styles.btn} ${styles.btnApprove}`}
                title="Duyệt đơn hàng. Hệ thống sẽ tự động kích hoạt khóa học."
            >
                {isLoading ? "..." : "✓ Duyệt"}
            </button>
            <button
                onClick={handleReject}
                disabled={isLoading}
                className={`${styles.btn} ${styles.btnReject}`}
                title="Hủy đơn hàng"
            >
                ✗
            </button>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

interface DeleteCourseButtonProps {
    courseId: string;
    courseTitle: string;
    hasEnrollments: boolean;
}

export default function DeleteCourseButton({
    courseId,
    courseTitle,
    hasEnrollments,
}: DeleteCourseButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleDelete = async () => {
        if (hasEnrollments) {
            alert("Không thể xóa khóa học đã có học viên đăng ký!");
            setShowConfirm(false);
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        // Delete lessons first
        await supabase.from("lessons").delete().eq("course_id", courseId);

        // Then delete course
        const { error } = await supabase.from("courses").delete().eq("id", courseId);

        if (error) {
            alert("Lỗi: " + error.message);
        } else {
            router.refresh();
        }

        setIsLoading(false);
        setShowConfirm(false);
    };

    if (showConfirm) {
        return (
            <div className={styles.confirmBox}>
                <p>Xóa khóa học <strong>{courseTitle}</strong>?</p>
                {hasEnrollments && (
                    <p className={styles.warning}>⚠️ Khóa học có học viên, không thể xóa!</p>
                )}
                <div className={styles.confirmActions}>
                    <button
                        onClick={handleDelete}
                        disabled={isLoading || hasEnrollments}
                        className={styles.confirmBtn}
                    >
                        {isLoading ? "..." : "Xác nhận"}
                    </button>
                    <button onClick={() => setShowConfirm(false)} className={styles.cancelBtn}>
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button onClick={() => setShowConfirm(true)} className={styles.deleteBtn}>
            🗑️
        </button>
    );
}

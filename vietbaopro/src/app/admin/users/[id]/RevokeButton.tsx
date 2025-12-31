"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

interface RevokeButtonProps {
    enrollmentId: string;
    courseTitle: string;
}

export default function RevokeButton({ enrollmentId, courseTitle }: RevokeButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleRevoke = async () => {
        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase
            .from("enrollments")
            .delete()
            .eq("id", enrollmentId);

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
                <p>Thu hồi quyền truy cập <strong>{courseTitle}</strong>?</p>
                <div className={styles.confirmActions}>
                    <button
                        onClick={handleRevoke}
                        disabled={isLoading}
                        className={styles.confirmBtn}
                    >
                        {isLoading ? "..." : "Xác nhận"}
                    </button>
                    <button
                        onClick={() => setShowConfirm(false)}
                        className={styles.cancelBtn}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className={styles.revokeBtn}
        >
            Thu hồi
        </button>
    );
}

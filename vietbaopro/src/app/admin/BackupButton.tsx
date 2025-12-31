"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function BackupButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [isError, setIsError] = useState(false);

    const handleBackup = async () => {
        if (!confirm("Bạn có chắc chắn muốn thực hiện backup toàn bộ dữ liệu lên Google Drive ngay bây giờ?")) {
            return;
        }

        setIsLoading(true);
        setMessage("Đang thực hiện backup... Vui lòng không đóng trình duyệt.");
        setIsError(false);

        try {
            const response = await fetch("/api/admin/backup", {
                method: "POST",
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(`✅ Backup thành công! File: ${data.fileName}`);
                setIsError(false);
            } else {
                setMessage(`❌ Lỗi: ${data.error || "Không rõ nguyên nhân"}`);
                setIsError(true);
            }
        } catch (error: any) {
            setMessage(`❌ Lỗi kết nối: ${error.message}`);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.backupContainer}>
            <button
                className={`btn btn-secondary ${isLoading ? styles.loading : ""}`}
                onClick={handleBackup}
                disabled={isLoading}
            >
                {isLoading ? "⏳ Đang backup..." : "☁️ Backup lên Drive"}
            </button>
            {message && (
                <div className={`${styles.backupMessage} ${isError ? styles.errorText : styles.successText}`}>
                    {message}
                </div>
            )}
        </div>
    );
}

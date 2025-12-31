"use client";

import { useState, useRef } from "react";
import styles from "./ImageUpload.module.css";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    label?: string;
}

export default function ImageUpload({ value, onChange, label = "Hình ảnh" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [showLibrary, setShowLibrary] = useState(false);
    const [libraryFiles, setLibraryFiles] = useState<any[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLocalUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/admin/drive/upload", {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (data.success) {
                onChange(data.url);
            } else {
                alert("Upload thất bại: " + data.error);
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Có lỗi xảy ra khi upload");
        } finally {
            setIsUploading(false);
        }
    };

    const fetchLibrary = async () => {
        setIsLoadingLibrary(true);
        setShowLibrary(true);
        try {
            const res = await fetch("/api/admin/drive/files");
            const data = await res.json();
            if (data.success) {
                setLibraryFiles(data.files);
            }
        } catch (error) {
            console.error("Fetch library error:", error);
        } finally {
            setIsLoadingLibrary(false);
        }
    };

    return (
        <div className={styles.container}>
            <label className={styles.label}>{label}</label>

            <div className={styles.inputGroup}>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="URL hình ảnh (GDrive, Unsplash, ...)"
                    className={styles.urlInput}
                />
                <div className={styles.actions}>
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? "⌛ Đang lên..." : "📁 Từ máy tính"}
                    </button>
                    <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={fetchLibrary}
                        disabled={isLoadingLibrary}
                    >
                        {isLoadingLibrary ? "⌛ Đang tải..." : "🌤️ Thư viện Drive"}
                    </button>
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleLocalUpload}
                accept="image/*"
                style={{ display: "none" }}
            />

            {value && (
                <div className={styles.preview}>
                    <img src={value} alt="Preview" />
                    <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => onChange("")}
                    >
                        ✕
                    </button>
                </div>
            )}

            {showLibrary && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <div className={styles.modalHeader}>
                            <h3>Thư viện Drive</h3>
                            <button onClick={() => setShowLibrary(false)}>✕</button>
                        </div>
                        <div className={styles.modalBody}>
                            {isLoadingLibrary ? (
                                <p>Đang tải tệp từ Drive...</p>
                            ) : libraryFiles.length === 0 ? (
                                <p>Thư viện trống.</p>
                            ) : (
                                <div className={styles.libraryGrid}>
                                    {libraryFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className={styles.libraryItem}
                                            onClick={() => {
                                                onChange(`https://lh3.googleusercontent.com/u/0/d/${file.id}`);
                                                setShowLibrary(false);
                                            }}
                                        >
                                            <div className={styles.itemThumb}>
                                                {file.thumbnailLink ? (
                                                    <img src={file.thumbnailLink} alt={file.name} />
                                                ) : (
                                                    <span>🖼️</span>
                                                )}
                                            </div>
                                            <span className={styles.itemName}>{file.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

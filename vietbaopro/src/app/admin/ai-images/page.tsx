"use client";

import { useState } from "react";
import styles from "./page.module.css";

const STYLES = [
    { id: "realistic", label: "🎯 Realistic", desc: "Ảnh chân thực, chất lượng cao" },
    { id: "artistic", label: "🎨 Artistic", desc: "Nghệ thuật, sáng tạo" },
    { id: "minimal", label: "✨ Minimal", desc: "Tối giản, hiện đại" },
    { id: "illustration", label: "🖼️ Illustration", desc: "Minh họa, vector" },
    { id: "3d", label: "🔮 3D Render", desc: "Đồ họa 3D" },
];

interface GeneratedImage {
    base64?: string;
    mimeType?: string;
    text?: string;
    prompt: string;
    createdAt: Date;
}

export default function AIImagesPage() {
    const [prompt, setPrompt] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("realistic");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState("");
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError("Vui lòng nhập mô tả ảnh");
            return;
        }

        setIsGenerating(true);
        setError("");

        try {
            const res = await fetch("/api/admin/ai/generate-image", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt, style: selectedStyle }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to generate image");
            }

            const newImage: GeneratedImage = {
                prompt: data.prompt || prompt,
                createdAt: new Date(),
            };

            if (data.image) {
                newImage.base64 = data.image.base64;
                newImage.mimeType = data.image.mimeType;
            } else if (data.text) {
                newImage.text = data.text;
            }

            setGeneratedImages((prev) => [newImage, ...prev]);
            setPrompt("");
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Đã xảy ra lỗi";
            setError(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = (image: GeneratedImage) => {
        if (!image.base64) return;

        const link = document.createElement("a");
        link.href = `data:${image.mimeType};base64,${image.base64}`;
        link.download = `ai-image-${Date.now()}.png`;
        link.click();
    };

    const handleDelete = (index: number) => {
        setGeneratedImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>🎨 AI Image Generator</h1>
                <p>Tạo ảnh thumbnail và minh họa bằng Google AI</p>
            </header>

            {/* Generator Form */}
            <div className={styles.generatorCard}>
                <div className={styles.formGroup}>
                    <label>Mô tả ảnh bạn muốn tạo:</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="VD: A modern digital marketing workspace with laptop, coffee, and plants, professional photography, warm lighting..."
                        rows={4}
                        disabled={isGenerating}
                    />
                </div>

                <div className={styles.styleSection}>
                    <label>Chọn style:</label>
                    <div className={styles.styleGrid}>
                        {STYLES.map((style) => (
                            <button
                                key={style.id}
                                type="button"
                                className={`${styles.styleBtn} ${selectedStyle === style.id ? styles.selected : ""}`}
                                onClick={() => setSelectedStyle(style.id)}
                                disabled={isGenerating}
                            >
                                <span className={styles.styleLabel}>{style.label}</span>
                                <span className={styles.styleDesc}>{style.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                <button
                    className={styles.generateBtn}
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                >
                    {isGenerating ? (
                        <>⏳ Đang tạo ảnh...</>
                    ) : (
                        <>🎨 Tạo ảnh</>
                    )}
                </button>
            </div>

            {/* Results */}
            {generatedImages.length > 0 && (
                <div className={styles.resultsSection}>
                    <h2>📷 Kết quả</h2>
                    <div className={styles.resultsGrid}>
                        {generatedImages.map((image, index) => (
                            <div key={index} className={styles.resultCard}>
                                {image.base64 ? (
                                    <img
                                        src={`data:${image.mimeType};base64,${image.base64}`}
                                        alt={image.prompt}
                                        className={styles.resultImage}
                                    />
                                ) : (
                                    <div className={styles.textResult}>
                                        <p>{image.text}</p>
                                    </div>
                                )}
                                <div className={styles.resultInfo}>
                                    <p className={styles.resultPrompt}>{image.prompt}</p>
                                    <span className={styles.resultTime}>
                                        {image.createdAt.toLocaleTimeString("vi-VN")}
                                    </span>
                                </div>
                                <div className={styles.resultActions}>
                                    {image.base64 && (
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleDownload(image)}
                                        >
                                            💾 Download
                                        </button>
                                    )}
                                    <button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        onClick={() => handleDelete(index)}
                                    >
                                        🗑️ Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Info Box */}
            <div className={styles.infoBox}>
                <h3>💡 Mẹo tạo ảnh tốt:</h3>
                <ul>
                    <li>Mô tả chi tiết về đối tượng chính trong ảnh</li>
                    <li>Thêm thông tin về ánh sáng, góc chụp</li>
                    <li>Chỉ định màu sắc và không gian</li>
                    <li>Sử dụng tiếng Anh để kết quả tốt hơn</li>
                </ul>
            </div>
        </div>
    );
}

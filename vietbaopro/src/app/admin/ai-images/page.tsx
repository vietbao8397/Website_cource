"use client";

import { useState } from "react";
import styles from "./page.module.css";

const STYLES = [
    {
        id: "realistic",
        label: "📸 Cinematic Realistic",
        desc: "VIET BAO PRO Framework: Solid, Calm, Professional (8K)"
    },
    {
        id: "infographic",
        label: "📊 Brand Infographic",
        desc: "Elevated Warm Precision: Dark mode, Clean, Data-driven"
    },
];

interface GeneratedImage {
    base64?: string;
    mimeType?: string;
    text?: string;
    prompt: string;
    originalPrompt?: string;
    driveFile?: {
        id: string;
        link: string;
    };
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
                originalPrompt: data.originalPrompt,
                createdAt: new Date(),
                driveFile: data.driveFile,
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

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>🎨 AI Visual Creator (Pro)</h1>
                <p>Tạo ảnh chuẩn Brand Guideline với Google Gemini & Drive</p>
            </header>

            {/* Generator Form */}
            <div className={styles.generatorCard}>
                <div className={styles.formGroup}>
                    <label>Nội dung cần tạo (Ý tưởng thô):</label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="VD: Một người đàn ông đang làm việc tập trung trên bàn gỗ..."
                        rows={4}
                        disabled={isGenerating}
                    />
                </div>

                <div className={styles.styleSection}>
                    <label>Chọn phong cách (Brand Guideline):</label>
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
                        <>⏳ Đang xử lý Prompt & Tạo ảnh...</>
                    ) : (
                        <>🎨 Tạo ảnh & Lưu Drive</>
                    )}
                </button>
            </div>

            {/* Results */}
            {generatedImages.length > 0 && (
                <div className={styles.resultsSection}>
                    <h2>📷 Kết quả gần đây</h2>
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
                                    <div className={styles.promptSection}>
                                        <span className={styles.promptLabel}>Original Idea:</span>
                                        <p className={styles.promptText}>{image.originalPrompt || "N/A"}</p>
                                    </div>
                                    <div className={styles.promptSection}>
                                        <span className={styles.promptLabel}>Enhanced Prompt (Used):</span>
                                        <p className={styles.promptText}>{image.prompt}</p>
                                    </div>

                                    <div className={styles.metaInfo}>
                                        <span className={styles.resultTime}>
                                            {image.createdAt.toLocaleTimeString("vi-VN")}
                                        </span>
                                        {image.driveFile && (
                                            <a
                                                href={image.driveFile.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={styles.driveLink}
                                            >
                                                📂 Đã lưu Drive
                                            </a>
                                        )}
                                    </div>
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
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

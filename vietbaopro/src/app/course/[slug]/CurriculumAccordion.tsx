"use client";

import { useState } from "react";
import styles from "./page.module.css";

interface Lesson {
    id: string;
    title: string;
    duration_minutes: number;
    chapter_title: string;
    chapter_index: number;
    is_preview: boolean;
}

interface Chapter {
    title: string;
    lessons: Lesson[];
}

interface CurriculumAccordionProps {
    chapters: Chapter[];
}

export default function CurriculumAccordion({ chapters }: CurriculumAccordionProps) {
    const [expandedChapters, setExpandedChapters] = useState<number[]>([0]); // Expand first chapter by default

    const toggleChapter = (index: number) => {
        setExpandedChapters((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    return (
        <div className={styles.curriculum}>
            {chapters.map((module, moduleIndex) => {
                const isExpanded = expandedChapters.includes(moduleIndex);

                return (
                    <div
                        key={moduleIndex}
                        className={`${styles.module} ${isExpanded ? styles.moduleExpanded : ""}`}
                    >
                        <button
                            className={styles.moduleHeader}
                            onClick={() => toggleChapter(moduleIndex)}
                        >
                            <div className={styles.moduleTitle}>
                                <span className={styles.moduleNumber}>
                                    {String(moduleIndex + 1).padStart(2, "0")}
                                </span>
                                <div>
                                    <h3>{module.title}</h3>
                                </div>
                            </div>
                            <div className={styles.moduleMeta}>
                                <span className={styles.lessonCount}>
                                    {module.lessons.length} bài
                                </span>
                                <span className={styles.accordionIcon}>{isExpanded ? "−" : "+"}</span>
                            </div>
                        </button>

                        {isExpanded && (
                            <div className={styles.lessonList}>
                                {module.lessons.map((lesson, lessonIndex) => (
                                    <div key={lesson.id} className={styles.lessonItem}>
                                        <div className={styles.lessonInfo}>
                                            <span className={styles.lessonNumber}>
                                                {moduleIndex + 1}.{lessonIndex + 1}
                                            </span>
                                            <span className={styles.lessonTitle}>
                                                {lesson.title}
                                            </span>
                                            {lesson.is_preview && (
                                                <span className={styles.previewBadge}>
                                                    Xem miễn phí
                                                </span>
                                            )}
                                        </div>
                                        <span className={styles.lessonDuration}>
                                            {lesson.duration_minutes ? `${lesson.duration_minutes} phút` : ""}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

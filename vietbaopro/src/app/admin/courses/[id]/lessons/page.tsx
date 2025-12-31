"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./page.module.css";
import { extractYouTubeId } from "@/lib/youtube";

interface Lesson {
    id: string;
    title: string;
    chapter_title: string;
    chapter_index: number;
    lesson_index: number;
    duration_minutes: number | null;
    youtube_video_id: string | null;
    is_preview: boolean;
}

interface Course {
    id: string;
    title: string;
    slug: string;
}

export default function LessonsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const router = useRouter();
    const [courseId, setCourseId] = useState<string | null>(null);
    const [course, setCourse] = useState<Course | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    const [formData, setFormData] = useState({
        title: "",
        chapter_title: "",
        chapter_index: 1,
        lesson_index: 1,
        duration_minutes: "",
        youtube_video_id: "",
        is_preview: false,
    });
    const [isFetchingYoutube, setIsFetchingYoutube] = useState(false);

    useEffect(() => {
        async function loadData() {
            const { id } = await params;
            setCourseId(id);

            const supabase = createClient();

            // Load course
            const { data: courseData } = await supabase
                .from("courses")
                .select("id, title, slug")
                .eq("id", id)
                .single();

            if (courseData) setCourse(courseData);

            // Load lessons
            const { data: lessonData } = await supabase
                .from("lessons")
                .select("*")
                .eq("course_id", id)
                .order("chapter_index", { ascending: true })
                .order("lesson_index", { ascending: true });

            if (lessonData) setLessons(lessonData);
            setIsLoading(false);
        }

        loadData();
    }, [params]);

    const resetForm = () => {
        setFormData({
            title: "",
            chapter_title: lessons.length > 0 ? lessons[lessons.length - 1].chapter_title : "",
            chapter_index: lessons.length > 0 ? lessons[lessons.length - 1].chapter_index : 1,
            lesson_index: lessons.filter((l) => l.chapter_index === (lessons.length > 0 ? lessons[lessons.length - 1].chapter_index : 1)).length + 1,
            duration_minutes: "",
            youtube_video_id: "",
            is_preview: false,
        });
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleAddLesson = async () => {
        if (!courseId || !formData.title) return;

        const supabase = createClient();

        const { data, error } = await supabase
            .from("lessons")
            .insert({
                course_id: courseId,
                title: formData.title,
                chapter_title: formData.chapter_title,
                chapter_index: Number(formData.chapter_index),
                lesson_index: Number(formData.lesson_index),
                duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
                youtube_video_id: formData.youtube_video_id || null,
                is_preview: formData.is_preview,
            })
            .select()
            .single();

        if (error) {
            alert("Lỗi: " + error.message);
            return;
        }

        if (data) {
            setLessons((prev) =>
                [...prev, data].sort((a, b) =>
                    a.chapter_index !== b.chapter_index
                        ? a.chapter_index - b.chapter_index
                        : a.lesson_index - b.lesson_index
                )
            );
        }

        setShowAddForm(false);
        resetForm();
    };

    const fetchYouTubeInfo = async () => {
        const videoId = extractYouTubeId(formData.youtube_video_id);
        if (!videoId) return;

        setIsFetchingYoutube(true);
        try {
            const res = await fetch(`/api/admin/youtube/video-info?videoId=${videoId}`);
            const data = await res.json();

            if (data.error) {
                alert("Lỗi YouTube: " + data.error);
            } else {
                setFormData((prev) => ({
                    ...prev,
                    youtube_video_id: videoId,
                    title: prev.title || data.title || "",
                    duration_minutes: data.duration_minutes?.toString() || prev.duration_minutes,
                }));
            }
        } catch (error) {
            console.error("Fetch YouTube error:", error);
        } finally {
            setIsFetchingYoutube(false);
        }
    };

    const handleEditLesson = async () => {
        if (!editingLesson) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("lessons")
            .update({
                title: formData.title,
                chapter_title: formData.chapter_title,
                chapter_index: Number(formData.chapter_index),
                lesson_index: Number(formData.lesson_index),
                duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
                youtube_video_id: formData.youtube_video_id || null,
                is_preview: formData.is_preview,
            })
            .eq("id", editingLesson.id);

        if (error) {
            alert("Lỗi: " + error.message);
            return;
        }

        setLessons((prev) =>
            prev
                .map((l) =>
                    l.id === editingLesson.id
                        ? {
                            ...l,
                            ...formData,
                            chapter_index: Number(formData.chapter_index),
                            lesson_index: Number(formData.lesson_index),
                            duration_minutes: formData.duration_minutes ? Number(formData.duration_minutes) : null,
                        }
                        : l
                )
                .sort((a, b) =>
                    a.chapter_index !== b.chapter_index
                        ? a.chapter_index - b.chapter_index
                        : a.lesson_index - b.lesson_index
                )
        );

        setEditingLesson(null);
        resetForm();
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm("Xóa bài học này?")) return;

        const supabase = createClient();
        const { error } = await supabase.from("lessons").delete().eq("id", lessonId);

        if (error) {
            alert("Lỗi: " + error.message);
            return;
        }

        setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    };

    const startEdit = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setFormData({
            title: lesson.title,
            chapter_title: lesson.chapter_title,
            chapter_index: lesson.chapter_index,
            lesson_index: lesson.lesson_index,
            duration_minutes: lesson.duration_minutes?.toString() || "",
            youtube_video_id: lesson.youtube_video_id || "",
            is_preview: lesson.is_preview,
        });
        setShowAddForm(false);
    };

    // Group lessons by chapter
    const chapters = lessons.reduce((acc, lesson) => {
        const key = lesson.chapter_title;
        if (!acc[key]) {
            acc[key] = { index: lesson.chapter_index, lessons: [] };
        }
        acc[key].lessons.push(lesson);
        return acc;
    }, {} as Record<string, { index: number; lessons: Lesson[] }>);

    const sortedChapters = Object.entries(chapters).sort(
        ([, a], [, b]) => a.index - b.index
    );

    if (isLoading) {
        return <div className={styles.lessonsPage}>Đang tải...</div>;
    }

    return (
        <div className={styles.lessonsPage}>
            <header className={styles.header}>
                <Link href={`/admin/courses/${courseId}`} className={styles.backLink}>
                    ← Quay lại
                </Link>
                <div className={styles.headerInfo}>
                    <h1>Quản lý bài học</h1>
                    <p>{course?.title}</p>
                </div>
                <button
                    onClick={() => {
                        setShowAddForm(true);
                        setEditingLesson(null);
                        resetForm();
                    }}
                    className={styles.addBtn}
                >
                    + Thêm bài học
                </button>
            </header>

            {/* Add/Edit Form */}
            {(showAddForm || editingLesson) && (
                <div className={styles.formCard}>
                    <h3>{editingLesson ? "Sửa bài học" : "Thêm bài học mới"}</h3>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Tên bài học *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="VD: Giới thiệu khóa học"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Tên chương *</label>
                            <input
                                type="text"
                                name="chapter_title"
                                value={formData.chapter_title}
                                onChange={handleChange}
                                placeholder="VD: Module 1: Nền tảng"
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Thứ tự chương</label>
                            <input
                                type="number"
                                name="chapter_index"
                                value={formData.chapter_index}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Thứ tự bài</label>
                            <input
                                type="number"
                                name="lesson_index"
                                value={formData.lesson_index}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Thời lượng (phút)</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                value={formData.duration_minutes}
                                onChange={handleChange}
                                min={1}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>YouTube Video ID / URL</label>
                            <div className={styles.inputWithAction}>
                                <input
                                    type="text"
                                    name="youtube_video_id"
                                    value={formData.youtube_video_id}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setFormData(prev => ({ ...prev, youtube_video_id: val }));
                                    }}
                                    placeholder="VD: dQw4w9WgXcQ hoặclink URL"
                                />
                                <button
                                    type="button"
                                    onClick={fetchYouTubeInfo}
                                    className={styles.fetchBtn}
                                    disabled={!formData.youtube_video_id || isFetchingYoutube}
                                >
                                    {isFetchingYoutube ? "..." : "Lấy thông tin"}
                                </button>
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.checkboxLabel}>
                                <input
                                    type="checkbox"
                                    name="is_preview"
                                    checked={formData.is_preview}
                                    onChange={handleChange}
                                />
                                Cho phép xem miễn phí
                            </label>
                        </div>
                    </div>
                    <div className={styles.formActions}>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setEditingLesson(null);
                            }}
                            className={styles.cancelBtn}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={editingLesson ? handleEditLesson : handleAddLesson}
                            className={styles.submitBtn}
                        >
                            {editingLesson ? "Lưu thay đổi" : "Thêm bài học"}
                        </button>
                    </div>
                </div>
            )}

            {/* Lessons List */}
            <div className={styles.lessonsContainer}>
                {sortedChapters.length > 0 ? (
                    sortedChapters.map(([chapterTitle, { lessons: chapterLessons }]) => (
                        <div key={chapterTitle} className={styles.chapter}>
                            <h3 className={styles.chapterTitle}>{chapterTitle}</h3>
                            <div className={styles.lessonsList}>
                                {chapterLessons
                                    .sort((a, b) => a.lesson_index - b.lesson_index)
                                    .map((lesson) => (
                                        <div key={lesson.id} className={styles.lessonItem}>
                                            <div className={styles.lessonInfo}>
                                                <span className={styles.lessonNumber}>
                                                    {lesson.chapter_index}.{lesson.lesson_index}
                                                </span>
                                                <span className={styles.lessonTitle}>{lesson.title}</span>
                                                {lesson.is_preview && (
                                                    <span className={styles.previewBadge}>Xem miễn phí</span>
                                                )}
                                            </div>
                                            <div className={styles.lessonMeta}>
                                                {lesson.duration_minutes && (
                                                    <span>{lesson.duration_minutes} phút</span>
                                                )}
                                                {lesson.youtube_video_id && (
                                                    <span className={styles.hasVideo}>🎥</span>
                                                )}
                                            </div>
                                            <div className={styles.lessonActions}>
                                                <button
                                                    onClick={() => startEdit(lesson)}
                                                    className={styles.editBtn}
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteLesson(lesson.id)}
                                                    className={styles.deleteBtn}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        <p>Chưa có bài học nào.</p>
                        <button
                            onClick={() => {
                                setShowAddForm(true);
                                resetForm();
                            }}
                            className={styles.addBtn}
                        >
                            + Thêm bài học đầu tiên
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

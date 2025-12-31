"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

const testimonials = [
    {
        text: "Khóa học đã thay đổi hoàn toàn cách tôi làm Content. Từ 8 tiếng mỗi bài xuống còn chưa đầy 1 tiếng.",
        author: "Hương Ly",
        role: "Content Creator",
    },
    {
        text: "Kiến thức thực chiến, không lý thuyết suông. Tôi đã áp dụng ngay vào dự án và thấy hiệu quả rõ rệt.",
        author: "Đức Anh",
        role: "Digital Marketer",
    },
    {
        text: "Hệ thống hóa quy trình là điều tôi học được nhiều nhất. Cảm ơn Việt Bảo rất nhiều!",
        author: "Minh Trang",
        role: "Solopreneur",
    },
];

export default function AuthTestimonials() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % testimonials.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.testimonialsSlider}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className={styles.testimonialItem}
                >
                    <p className={styles.testimonialText}>"{testimonials[current].text}"</p>
                    <div className={styles.testimonialInfo}>
                        <strong>{testimonials[current].author}</strong>
                        <span>{testimonials[current].role}</span>
                    </div>
                </motion.div>
            </AnimatePresence>
            <div className={styles.sliderDots}>
                {testimonials.map((_, i) => (
                    <button
                        key={i}
                        className={`${styles.dot} ${i === current ? styles.dotActive : ""}`}
                        onClick={() => setCurrent(i)}
                    />
                ))}
            </div>
        </div>
    );
}

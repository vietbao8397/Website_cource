"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icons } from "@/components/ui/Icons";
import styles from "./ChatWidget.module.css";
import Image from "next/image";

interface Message {
    role: "user" | "model";
    parts: { text: string }[];
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Load history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await fetch("/api/chat/history");
                if (res.ok) {
                    const data = await res.json();
                    if (data.messages && data.messages.length > 0) {
                        setMessages(data.messages);
                    } else {
                        // Show welcome if no history
                        setMessages([
                            {
                                role: "model",
                                parts: [{ text: "Dạ Sophia chào anh/chị ạ! Em có thể giúp gì cho việc học của mình hôm nay hông nè? ^^" }]
                            }
                        ]);
                    }
                }
            } catch (error) {
                console.error("Failed to load history", error);
            }
        };
        loadHistory();
    }, []);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = inputValue.trim();
        setInputValue("");

        // Add user message
        const newMessages: Message[] = [
            ...messages,
            { role: "user", parts: [{ text: userMessage }] }
        ];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            const res = await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({
                        role: m.role,
                        parts: m.parts
                    }))
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            setMessages(prev => [
                ...prev,
                { role: "model", parts: [{ text: data.response }] }
            ]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [
                ...prev,
                { role: "model", parts: [{ text: "Hic, Sophia đang bị lỗi xíu. Anh/Chị thử lại lát nữa nha :(((" }] }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.widgetContainer}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={styles.chatWindow}
                    >
                        {/* Header */}
                        <div className={styles.header}>
                            <div className={styles.headerInfo}>
                                <div className={styles.avatar}>
                                    <Icons.Sparkles size={16} color="#fff" />
                                </div>
                                <div>
                                    <h3 className={styles.botName}>Sophia</h3>
                                    <span className={styles.botStatus}>Trợ lý ảo Vietbaopro</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className={styles.closeBtn}>
                                <Icons.X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className={styles.messagesArea}>
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.messageRow} ${msg.role === "user" ? styles.userRow : styles.botRow}`}
                                >
                                    {msg.role === "model" && (
                                        <div className={styles.msgAvatar}>S</div>
                                    )}
                                    <div className={`${styles.messageBubble} ${msg.role === "user" ? styles.userBubble : styles.botBubble}`}>
                                        {msg.parts[0].text}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className={`${styles.messageRow} ${styles.botRow}`}>
                                    <div className={styles.msgAvatar}>S</div>
                                    <div className={`${styles.messageBubble} ${styles.botBubble} ${styles.loadingBubble}`}>
                                        <div className={styles.typingDot}></div>
                                        <div className={styles.typingDot}></div>
                                        <div className={styles.typingDot}></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className={styles.inputArea}>
                            <textarea
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nhập câu hỏi..."
                                className={styles.input}
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className={styles.sendBtn}
                            >
                                <Icons.Send size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`${styles.toggleBtn} ${isOpen ? styles.active : ""}`}
            >
                {isOpen ? <Icons.Minimize2 size={24} /> : <Icons.MessageCircle size={24} />}
            </motion.button>
        </div>
    );
}

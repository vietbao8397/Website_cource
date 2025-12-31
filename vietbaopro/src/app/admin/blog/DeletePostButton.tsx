"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

interface DeletePostButtonProps {
    postId: string;
    postTitle: string;
}

export default function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Xóa bài viết "${postTitle}"?`)) return;

        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase.from("blog_posts").delete().eq("id", postId);

        if (error) {
            alert("Lỗi: " + error.message);
        } else {
            router.refresh();
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isLoading}
            className={styles.deleteBtn}
        >
            {isLoading ? "..." : "🗑️"}
        </button>
    );
}

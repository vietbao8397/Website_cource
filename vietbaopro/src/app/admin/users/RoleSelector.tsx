"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

interface RoleSelectorProps {
    userId: string;
    currentRole: string;
}

export default function RoleSelector({ userId, currentRole }: RoleSelectorProps) {
    const router = useRouter();
    const [role, setRole] = useState(currentRole);
    const [isLoading, setIsLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleRoleChange = async (newRole: string) => {
        if (newRole === role) {
            setShowDropdown(false);
            return;
        }

        setIsLoading(true);
        const supabase = createClient();

        const { error } = await supabase
            .from("profiles")
            .update({ role: newRole })
            .eq("id", userId);

        if (error) {
            alert("Lỗi: " + error.message);
        } else {
            setRole(newRole);
            router.refresh();
        }

        setIsLoading(false);
        setShowDropdown(false);
    };

    return (
        <div className={styles.roleSelector}>
            <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isLoading}
                className={styles.roleSelectorBtn}
            >
                {isLoading ? "..." : "Đổi vai trò ▾"}
            </button>

            {showDropdown && (
                <div className={styles.roleDropdown}>
                    <button
                        onClick={() => handleRoleChange("learner")}
                        className={role === "learner" ? styles.roleOptionActive : ""}
                    >
                        📚 Học viên
                    </button>
                    <button
                        onClick={() => handleRoleChange("admin")}
                        className={role === "admin" ? styles.roleOptionActive : ""}
                    >
                        👑 Admin
                    </button>
                </div>
            )}
        </div>
    );
}

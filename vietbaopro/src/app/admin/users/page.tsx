import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import RoleSelector from "./RoleSelector";
import styles from "./page.module.css";

interface UserWithStats {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string;
    created_at: string;
    enrollments_count: number;
    orders_count: number;
    total_spent: number;
}

export default async function AdminUsersPage({
    searchParams,
}: {
    searchParams: Promise<{ role?: string; search?: string }>;
}) {
    const { role: filterRole, search } = await searchParams;
    const supabase = await createClient();

    // Fetch all profiles
    let query = supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    // Apply role filter
    if (filterRole && filterRole !== "all") {
        query = query.eq("role", filterRole);
    }

    // Apply search filter
    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: profiles, error } = await query;

    if (error) {
        console.error("Error fetching profiles:", error);
    }

    // Fetch enrollment and order counts for each user
    const userIds = profiles?.map((p) => p.id) || [];

    let usersWithStats: UserWithStats[] = [];

    if (profiles && profiles.length > 0) {
        // Get enrollment counts
        const { data: enrollmentCounts } = await supabase
            .from("enrollments")
            .select("user_id")
            .in("user_id", userIds);

        // Get order counts and total spent
        const { data: orders } = await supabase
            .from("orders")
            .select("user_id, amount, status")
            .in("user_id", userIds)
            .eq("status", "paid");

        // Build user stats
        usersWithStats = profiles.map((profile) => {
            const userOrders = orders?.filter((o) => o.user_id === profile.id) || [];
            const totalSpent = userOrders.reduce((sum, o) => sum + (o.amount || 0), 0);

            return {
                ...profile,
                enrollments_count: enrollmentCounts?.filter((e) => e.user_id === profile.id).length || 0,
                orders_count: userOrders.length,
                total_spent: totalSpent,
            };
        });
    }

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const roleFilters = [
        { value: "all", label: "Tất cả" },
        { value: "learner", label: "Học viên" },
        { value: "admin", label: "Admin" },
    ];

    // Calculate totals
    const totalUsers = usersWithStats.length;
    const totalRevenue = usersWithStats.reduce((sum, u) => sum + u.total_spent, 0);

    return (
        <div className={styles.usersPage}>
            <header className={styles.header}>
                <h1>Quản lý người dùng</h1>
                <p>Xem và quản lý tài khoản người dùng</p>
            </header>

            {/* Summary Stats */}
            <div className={styles.summaryStats}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryValue}>{totalUsers}</span>
                    <span className={styles.summaryLabel}>Tổng người dùng</span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryValue}>{formatPrice(totalRevenue)}</span>
                    <span className={styles.summaryLabel}>Tổng doanh thu</span>
                </div>
            </div>

            {/* Filters */}
            <div className={styles.toolbar}>
                <div className={styles.filters}>
                    {roleFilters.map((filter) => (
                        <Link
                            key={filter.value}
                            href={`/admin/users${filter.value !== "all" ? `?role=${filter.value}` : ""}${search ? `${filter.value !== "all" ? "&" : "?"}search=${search}` : ""}`}
                            className={`${styles.filterBtn} ${(filterRole === filter.value || (!filterRole && filter.value === "all"))
                                    ? styles.filterActive
                                    : ""
                                }`}
                        >
                            {filter.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Người dùng</th>
                            <th>Email</th>
                            <th>Vai trò</th>
                            <th>Khóa học</th>
                            <th>Giá trị đơn hàng</th>
                            <th>Ngày tham gia</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersWithStats && usersWithStats.length > 0 ? (
                            usersWithStats.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div className={styles.userInfo}>
                                            <div className={styles.avatar}>
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.full_name || ""} />
                                                ) : (
                                                    <span>{(user.full_name || user.email || "U").charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <strong>{user.full_name || "Chưa đặt tên"}</strong>
                                        </div>
                                    </td>
                                    <td className={styles.email}>{user.email}</td>
                                    <td>
                                        <span className={`${styles.roleBadge} ${styles[`role_${user.role}`]}`}>
                                            {user.role === "admin" ? "👑 Admin" : "📚 Học viên"}
                                        </span>
                                    </td>
                                    <td className={styles.count}>{user.enrollments_count}</td>
                                    <td className={styles.amount}>
                                        {user.total_spent > 0 ? formatPrice(user.total_spent) : "-"}
                                    </td>
                                    <td className={styles.date}>{formatDate(user.created_at)}</td>
                                    <td>
                                        <div className={styles.actionGroup}>
                                            <Link href={`/admin/users/${user.id}`} className={styles.viewBtn}>
                                                Chi tiết
                                            </Link>
                                            <RoleSelector userId={user.id} currentRole={user.role} />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                                    Không tìm thấy người dùng nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

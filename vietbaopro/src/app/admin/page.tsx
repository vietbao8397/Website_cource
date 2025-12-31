import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import styles from "./page.module.css";
import BackupButton from "./BackupButton";
import RevenueChart from "./RevenueChart";

export default async function AdminDashboard() {
    const supabase = await createClient();

    // Calculate dates
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

    // Fetch statistics
    const [ordersResult, usersResult, enrollmentsResult, revenueResult, thirtyDayRevenueResult] =
        await Promise.all([
            supabase.from("orders").select("id, status", { count: "exact" }),
            supabase.from("profiles").select("id", { count: "exact" }),
            supabase.from("enrollments").select("id", { count: "exact" }),
            supabase
                .from("orders")
                .select("amount")
                .eq("status", "paid"),
            supabase
                .from("orders")
                .select("amount, created_at")
                .eq("status", "paid")
                .gte("created_at", thirtyDaysAgoStr)
                .order("created_at", { ascending: true }),
        ]);

    const totalOrders = ordersResult.count || 0;
    const pendingOrders =
        ordersResult.data?.filter((o) => o.status === "pending").length || 0;
    const totalUsers = usersResult.count || 0;
    const totalEnrollments = enrollmentsResult.count || 0;
    const totalRevenue =
        revenueResult.data?.reduce((sum, o) => sum + (o.amount || 0), 0) || 0;

    // Process 30-day revenue for chart
    const revenueMap = new Map<string, number>();
    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        revenueMap.set(dateStr, 0);
    }

    thirtyDayRevenueResult.data?.forEach(order => {
        const dateStr = new Date(order.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        if (revenueMap.has(dateStr)) {
            revenueMap.set(dateStr, (revenueMap.get(dateStr) || 0) + (order.amount || 0));
        }
    });

    const chartData = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
        date,
        revenue
    }));

    // Fetch recent orders
    const { data: recentOrders } = await supabase
        .from("orders")
        .select(`
          id,
          amount,
          status,
          created_at,
          customer_name,
          customer_email,
          courses (title)
        `)
        .order("created_at", { ascending: false })
        .limit(5);

    function formatPrice(price: number): string {
        return new Intl.NumberFormat("vi-VN").format(price) + "đ";
    }

    function formatDate(dateString: string): string {
        return new Date(dateString).toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>Tổng quan</h1>
                <p>Xin chào, Admin! Đây là tình hình hoạt động hôm nay.</p>
                <BackupButton />
            </header>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {/* ... existing stats cards ... */}
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>📦</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{totalOrders}</span>
                        <span className={styles.statLabel}>Tổng đơn hàng</span>
                    </div>
                </div>
                <div className={`${styles.statCard} ${styles.highlight}`}>
                    <div className={styles.statIcon}>⏳</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{pendingOrders}</span>
                        <span className={styles.statLabel}>Chờ duyệt</span>
                    </div>
                    {pendingOrders > 0 && (
                        <Link href="/admin/orders?status=pending" className={styles.statLink}>
                            Xem ngay →
                        </Link>
                    )}
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>👥</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{totalUsers}</span>
                        <span className={styles.statLabel}>Người dùng</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>🎓</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{totalEnrollments}</span>
                        <span className={styles.statLabel}>Học viên đã kích hoạt</span>
                    </div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statIcon}>💰</div>
                    <div className={styles.statInfo}>
                        <span className={styles.statValue}>{formatPrice(totalRevenue)}</span>
                        <span className={styles.statLabel}>Doanh thu</span>
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <section className={styles.section}>
                <RevenueChart data={chartData} />
            </section>

            {/* Recent Orders */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Đơn hàng gần đây</h2>
                    <Link href="/admin/orders" className={styles.viewAll}>
                        Xem tất cả →
                    </Link>
                </div>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Khách hàng</th>
                                <th>Khóa học</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders && recentOrders.length > 0 ? (
                                recentOrders.map((order) => (
                                    <tr key={order.id}>
                                        <td>
                                            <div className={styles.customerInfo}>
                                                <strong>{order.customer_name || "N/A"}</strong>
                                                <span>{order.customer_email}</span>
                                            </div>
                                        </td>
                                        <td>{(order.courses as unknown as { title: string })?.title || "N/A"}</td>
                                        <td>{formatPrice(order.amount)}</td>
                                        <td>
                                            <span
                                                className={`${styles.badge} ${styles[`badge_${order.status}`]
                                                    }`}
                                            >
                                                {order.status === "pending"
                                                    ? "Chờ duyệt"
                                                    : order.status === "paid"
                                                        ? "Đã thanh toán"
                                                        : order.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(order.created_at)}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                                        Chưa có đơn hàng nào
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

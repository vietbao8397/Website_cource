import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ApproveButton from "./ApproveButton";
import styles from "./page.module.css";

export default async function AdminOrdersPage({
    searchParams,
}: {
    searchParams: Promise<{ status?: string }>;
}) {
    const { status: filterStatus } = await searchParams;
    const supabase = await createClient();

    // Build query
    let query = supabase
        .from("orders")
        .select(
            `
      id,
      amount,
      status,
      payment_method,
      created_at,
      customer_name,
      customer_email,
      customer_phone,
      transaction_note,
      user_id,
      courses (id, title, slug),
      profiles (full_name, email)
    `
        )
        .order("created_at", { ascending: false });

    // Apply filter
    if (filterStatus && filterStatus !== "all") {
        query = query.eq("status", filterStatus);
    }

    const { data: orders, error } = await query;

    if (error) {
        console.error("Error fetching orders:", error);
    }

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

    const statusFilters = [
        { value: "all", label: "Tất cả" },
        { value: "pending", label: "Chờ duyệt" },
        { value: "paid", label: "Đã thanh toán" },
        { value: "cancelled", label: "Đã hủy" },
    ];

    return (
        <div className={styles.ordersPage}>
            <header className={styles.header}>
                <h1>Quản lý đơn hàng</h1>
                <p>Duyệt đơn hàng và kích hoạt khóa học cho học viên</p>
            </header>

            {/* Filters */}
            <div className={styles.filters}>
                {statusFilters.map((filter) => (
                    <Link
                        key={filter.value}
                        href={`/admin/orders${filter.value !== "all" ? `?status=${filter.value}` : ""}`}
                        className={`${styles.filterBtn} ${(filterStatus === filter.value || (!filterStatus && filter.value === "all"))
                            ? styles.filterActive
                            : ""
                            }`}
                    >
                        {filter.label}
                    </Link>
                ))}
            </div>

            {/* Orders Table */}
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Khách hàng</th>
                            <th>Khóa học</th>
                            <th>Số tiền</th>
                            <th>Trạng thái</th>
                            <th>Thời gian</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.length > 0 ? (
                            orders.map((order) => (
                                <tr key={order.id}>
                                    <td className={styles.orderId}>
                                        <code>{order.id.slice(0, 8)}...</code>
                                    </td>
                                    <td>
                                        <div className={styles.customerInfo}>
                                            <strong>{order.customer_name || (order.profiles as { full_name: string })?.full_name || "N/A"}</strong>
                                            <span>{order.customer_email || (order.profiles as { email: string })?.email}</span>
                                            {order.customer_phone && <span>📞 {order.customer_phone}</span>}
                                        </div>
                                    </td>
                                    <td>{(order.courses as { title: string })?.title || "N/A"}</td>
                                    <td className={styles.amount}>{formatPrice(order.amount)}</td>
                                    <td>
                                        <span
                                            className={`${styles.badge} ${styles[`badge_${order.status}`]
                                                }`}
                                        >
                                            {order.status === "pending"
                                                ? "⏳ Chờ duyệt"
                                                : order.status === "paid"
                                                    ? "✓ Đã thanh toán"
                                                    : order.status === "cancelled"
                                                        ? "✗ Đã hủy"
                                                        : order.status}
                                        </span>
                                    </td>
                                    <td className={styles.date}>{formatDate(order.created_at)}</td>
                                    <td>
                                        {order.status === "pending" && (
                                            <div className={styles.actions}>
                                                <ApproveButton
                                                    orderId={order.id}
                                                    userId={order.user_id}
                                                    courseId={(order.courses as { id: string; title: string; slug: string })?.id}
                                                    customerEmail={order.customer_email || (order.profiles as { email: string })?.email || ""}
                                                    customerName={order.customer_name || (order.profiles as { full_name: string })?.full_name || "Khách hàng"}
                                                    courseName={(order.courses as { title: string })?.title || "Khóa học"}
                                                    courseSlug={(order.courses as { slug: string })?.slug || ""}
                                                />
                                            </div>
                                        )}
                                        {order.status === "paid" && (
                                            <span className={styles.completedText}>Đã xử lý</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                                    {filterStatus ? `Không có đơn hàng "${filterStatus}"` : "Chưa có đơn hàng nào"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

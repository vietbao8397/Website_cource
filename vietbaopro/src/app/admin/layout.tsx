import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./layout.module.css";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // Check if user is logged in
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    // Not authorized - redirect to home
    redirect("/?error=unauthorized");
  }

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.logo}>
            <span className={styles.logoIcon}>⚙️</span>
            <span>Vietbaopro Admin</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navItem}>
            📊 Tổng quan
          </Link>
          <Link href="/admin/orders" className={styles.navItem}>
            📦 Đơn hàng
          </Link>
          <Link href="/admin/courses" className={styles.navItem}>
            📚 Khóa học & Tài nguyên
          </Link>
          <Link href="/admin/blog" className={styles.navItem}>
            ✍️ Blog
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            👥 Người dùng
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.navItem}>
            ← Về trang chính
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}

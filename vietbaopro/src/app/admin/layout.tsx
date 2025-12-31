import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Icons } from "@/components/ui/Icons";
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
            <span className={styles.logoIcon}>
              <Icons.Settings size={22} variant="gold" />
            </span>
            <span>Vietbaopro Admin</span>
          </Link>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin" className={styles.navItem}>
            <Icons.LayoutDashboard size={18} className={styles.navIcon} /> Tổng quan
          </Link>
          <Link href="/admin/orders" className={styles.navItem}>
            <Icons.ShoppingBag size={18} className={styles.navIcon} /> Đơn hàng
          </Link>
          <Link href="/admin/courses" className={styles.navItem}>
            <Icons.Course size={18} className={styles.navIcon} /> Khóa học & Tài nguyên
          </Link>
          <Link href="/admin/blog" className={styles.navItem}>
            <Icons.Blog size={18} className={styles.navIcon} /> Blog
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            <Icons.Users size={18} className={styles.navIcon} /> Người dùng
          </Link>
          <Link href="/admin/pipeline" className={styles.navItem}>
            <Icons.Stats size={18} className={styles.navIcon} /> Sales Pipeline
          </Link>
          <Link href="/admin/emails" className={styles.navItem}>
            <Icons.Mail size={18} className={styles.navIcon} /> Email Marketing
          </Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className={styles.navItem}>
            <Icons.Home size={18} className={styles.navIcon} /> Về trang chính
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}

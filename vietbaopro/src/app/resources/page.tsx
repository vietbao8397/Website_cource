import { Header, Footer } from "@/components/layout";
import { Motion, StaggerContainer } from "@/components/ui/Motion";
import styles from "./page.module.css";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ResourcesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login?redirect=/resources");
    }

    const resources = [
        {
            title: "Template Notion Workspace",
            description: "Hệ thống quản lý nội dung chuyên nghiệp được thiết lập sẵn trên Notion. Giúp bạn lên kế hoạch và theo dõi bài viết đa nền tảng.",
            icon: "📒",
            link: "#", // Placeholder
            color: "gold"
        },
        {
            title: "Checklist Lộ Trình 30 Ngày",
            description: "Bản đồ chi tiết từng bước để bạn bắt đầu từ con số 0 đến khi làm chủ kỹ năng Content AI. Checklist theo dõi tiến độ hàng ngày.",
            icon: "🎯",
            link: "#", // Placeholder
            color: "blue"
        }
    ];

    return (
        <>
            <Header />
            <main className={styles.resourcesPage}>
                <div className="container">
                    <header className={styles.header}>
                        <Motion type="slide-up">
                            <h1>Tài Nguyên Starter Kit</h1>
                        </Motion>
                        <Motion type="slide-up" delay={0.1}>
                            <p>Tất cả công cụ bạn cần để bắt đầu hành trình sáng tạo nội dung chuyên nghiệp bằng AI.</p>
                        </Motion>
                    </header>

                    <StaggerContainer className={styles.grid}>
                        {resources.map((resource, index) => (
                            <Motion key={index} type="zoom">
                                <div className={styles.resourceCard}>
                                    <div className={styles.icon}>{resource.icon}</div>
                                    <h3>{resource.title}</h3>
                                    <p>{resource.description}</p>
                                    <a href={resource.link} className={styles.downloadBtn} target="_blank" rel="noopener noreferrer">
                                        Truy cập tài nguyên →
                                    </a>
                                </div>
                            </Motion>
                        ))}
                    </StaggerContainer>
                </div>
            </main>
            <Footer />
        </>
    );
}

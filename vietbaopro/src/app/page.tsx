import { Header, Footer } from "@/components/layout";
import styles from "./page.module.css";
import Link from "next/link";
import { Motion, StaggerContainer } from "@/components/ui/Motion";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <>
      <Header />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroGlow}></div>
          <div className="container">
            <div className={styles.heroContent}>
              <Motion type="slide-up" delay={0.1}>
                <span className={styles.heroBadge}>🚀 Dành cho người mới</span>
              </Motion>
              <Motion type="slide-up" delay={0.2}>
                <h1 className={styles.heroTitle}>
                  Content AI:{" "}
                  <span className="gold-gradient">Cắt giảm 50% thời gian</span>,
                  <br />
                  nhân đôi Chất lượng.
                </h1>
              </Motion>
              <Motion type="slide-up" delay={0.3}>
                <p className={styles.heroSubtitle}>
                  Hệ thống hóa Quy trình Sáng tạo Nội dung bằng AI dành cho Marketers & Creators.
                  <br />
                  <strong>Biến sự hỗn loạn thành trật tự. Biến người mới thành Pro trong 30 ngày.</strong>
                </p>
              </Motion>
              <Motion type="slide-up" delay={0.4}>
                <div className={styles.heroCta}>
                  <Link href="/courses" className="btn btn-primary btn-lg">
                    Xem khóa học
                  </Link>
                  <Link href="/resources" className="btn btn-secondary btn-lg">
                    Tài nguyên miễn phí
                  </Link>
                </div>
              </Motion>
              <Motion type="fade" delay={0.6}>
                <div className={styles.heroStats}>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>1000+</span>
                    <span className={styles.statLabel}>Học viên</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>50+</span>
                    <span className={styles.statLabel}>Bài học</span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statNumber}>10+</span>
                    <span className={styles.statLabel}>Templates</span>
                  </div>
                </div>
              </Motion>
            </div>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className={`section ${styles.painSection}`}>
          <div className="container">
            <Motion type="slide-up">
              <h2 className={styles.sectionTitle}>
                Bạn có đang gặp những vấn đề này?
              </h2>
            </Motion>
            <StaggerContainer className={styles.painGrid}>
              <Motion type="zoom" className={styles.painCard}>
                <div className={styles.painIcon}>😰</div>
                <h3>Mông lung, không biết bắt đầu từ đâu</h3>
                <p>
                  Thị trường tràn ngập kiến thức, bạn học TikTok thì quên Facebook,
                  học viết thì quên thiết kế. Cảm giác không bao giờ học hết.
                </p>
              </Motion>
              <Motion type="zoom" className={styles.painCard}>
                <div className={styles.painIcon}>⏰</div>
                <h3>Ngồi cả tiếng không viết nổi 1 caption</h3>
                <p>
                  Hội chứng trang giấy trắng. Viết đi xóa lại, cuối cùng vẫn không
                  hài lòng với kết quả.
                </p>
              </Motion>
              <Motion type="zoom" className={styles.painCard}>
                <div className={styles.painIcon}>🤖</div>
                <h3>Dùng AI nhưng bài viết vô hồn</h3>
                <p>
                  ChatGPT viết nhanh đấy, nhưng đọc lên nghe như robot. Không có
                  cảm xúc, không có &quot;mùi&quot; của mình.
                </p>
              </Motion>
              <Motion type="zoom" className={styles.painCard}>
                <div className={styles.painIcon}>📊</div>
                <h3>Làm việc theo cảm hứng, kết quả bấp bênh</h3>
                <p>
                  Hôm nay có ý tưởng thì viết, mai không có thì nghỉ. Không có
                  quy trình, không đo lường được kết quả.
                </p>
              </Motion>
            </StaggerContainer>
          </div>
        </section>

        {/* Solution Section */}
        <section className={`section ${styles.solutionSection}`}>
          <div className="container">
            <Motion type="slide-up" className={styles.solutionHeader}>
              <span className="badge badge-gold">GIẢI PHÁP</span>
              <h2 className={styles.sectionTitle}>
                Đừng làm Content theo bản năng.
                <br />
                <span className="text-gold">Hãy làm theo Hệ thống.</span>
              </h2>
              <p className={styles.solutionSubtitle}>
                Vietbaopro không dạy bạn thủ thuật ngắn hạn. Chúng tôi trang bị cho bạn
                một HỆ THỐNG làm việc chuẩn chỉnh để tạo ra kết quả lâu dài.
              </p>
            </Motion>
            <StaggerContainer className={styles.solutionGrid}>
              <Motion type="slide-right" className={styles.solutionCard}>
                <div className={styles.solutionNumber}>01</div>
                <h3>Quy trình đã kiểm chứng</h3>
                <p>
                  Các Framework & SOPs được đúc kết từ hàng ngàn giờ làm việc thực tế.
                  Công cụ thay đổi, nhưng tư duy gốc rễ vẫn giữ nguyên giá trị.
                </p>
              </Motion>
              <Motion type="slide-right" className={styles.solutionCard}>
                <div className={styles.solutionNumber}>02</div>
                <h3>Thực hành ngay lập tức</h3>
                <p>
                  Mỗi bài học đều có bài tập thực hành. Kết thúc khóa học, bạn sở hữu
                  Portfolio thực tế chứ không phải chỉ là lý thuyết.
                </p>
              </Motion>
              <Motion type="slide-right" className={styles.solutionCard}>
                <div className={styles.solutionNumber}>03</div>
                <h3>AI là thực tập sinh, bạn là Editor</h3>
                <p>
                  Học cách điều khiển AI để nó viết đúng &quot;giọng&quot; của bạn.
                  Thổi hồn cảm xúc vào máy móc để nội dung không bị phát hiện là AI.
                </p>
              </Motion>
            </StaggerContainer>
          </div>
        </section>

        {/* Featured Course Section */}
        <section className={`section ${styles.courseSection}`}>
          <div className="container">
            <Motion type="slide-up" className={styles.courseHeader}>
              <span className="badge badge-gold">KHÓA HỌC NỔI BẬT</span>
              <h2 className={styles.sectionTitle}>
                Pro Content System
              </h2>
              <p className={styles.courseSubtitle}>
                Hệ Thống Làm Chủ Content A-Z cho Marketers & Creators mới vào nghề
              </p>
            </Motion>
            <Motion type="zoom">
              <div className={styles.courseCard}>
                <div className={styles.coursePreview}>
                  <div className={styles.courseThumbnail}>
                    <div className={styles.playButton}>▶</div>
                  </div>
                </div>
                <div className={styles.courseInfo}>
                  <div className={styles.courseModules}>
                    <div className={styles.moduleItem}>
                      <span className={styles.moduleIcon}>📚</span>
                      <span>10 Module chuyên sâu</span>
                    </div>
                    <div className={styles.moduleItem}>
                      <span className={styles.moduleIcon}>🎥</span>
                      <span>50+ Video bài giảng</span>
                    </div>
                    <div className={styles.moduleItem}>
                      <span className={styles.moduleIcon}>📝</span>
                      <span>Templates & Prompts</span>
                    </div>
                    <div className={styles.moduleItem}>
                      <span className={styles.moduleIcon}>🎯</span>
                      <span>Bài tập thực hành</span>
                    </div>
                  </div>
                  <div className={styles.coursePrice}>
                    <div className={styles.priceOriginal}>2.500.000đ</div>
                    <div className={styles.priceSale}>1.890.000đ</div>
                  </div>
                  <Link href="/courses/pro-content-system" className="btn btn-primary btn-lg btn-full">
                    Xem chi tiết khóa học
                  </Link>
                </div>
              </div>
            </Motion>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className={`section ${styles.testimonialSection}`}>
          <div className="container">
            <Motion type="slide-up">
              <h2 className={styles.sectionTitle}>
                Học viên nói gì về Vietbaopro?
              </h2>
            </Motion>
            <StaggerContainer className={styles.testimonialGrid}>
              <Motion type="zoom" className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>
                    &quot;Trước đây mình mất cả ngày để viết 1 bài. Giờ chỉ cần 30 phút là xong,
                    mà chất lượng còn tốt hơn trước rất nhiều.&quot;
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>TL</div>
                  <div className={styles.authorInfo}>
                    <strong>Thanh Lan</strong>
                    <span>Chủ shop online</span>
                  </div>
                </div>
              </Motion>
              <Motion type="zoom" className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>
                    &quot;Khóa học rất chi tiết, dành cho người mới như mình. Không cần biết
                    code vẫn dùng được AI một cách chuyên nghiệp.&quot;
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>MH</div>
                  <div className={styles.authorInfo}>
                    <strong>Minh Hoàng</strong>
                    <span>Freelancer Marketing</span>
                  </div>
                </div>
              </Motion>
              <Motion type="zoom" className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <p>
                    &quot;Quy trình rõ ràng, template sẵn sàng. Mình áp dụng ngay vào công việc
                    và thấy hiệu quả rõ rệt.&quot;
                  </p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorAvatar}>NA</div>
                  <div className={styles.authorInfo}>
                    <strong>Ngọc Anh</strong>
                    <span>Content Creator</span>
                  </div>
                </div>
              </Motion>
            </StaggerContainer>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`section ${styles.ctaSection}`}>
          <div className="container">
            <Motion type="zoom" className={styles.ctaCard}>
              <h2>Sẵn sàng trở thành Pro?</h2>
              <p>
                Bắt đầu hành trình từ Zero đến Pro trong 30 ngày.
                Miễn phí tài nguyên starter kit khi đăng ký hôm nay.
              </p>
              <div className={styles.ctaButtons}>
                <Link href={user ? "/my-learning" : "/register"} className="btn btn-primary btn-lg">
                  {user ? "Tiếp tục học" : "Đăng ký ngay"}
                </Link>
                <Link href={user ? "/resources" : "/courses"} className="btn btn-secondary btn-lg">
                  {user ? "Tài nguyên miễn phí" : "Xem tất cả khóa học"}
                </Link>
              </div>
            </Motion>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

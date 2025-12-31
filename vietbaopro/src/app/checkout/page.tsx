"use client";

import { Header, Footer } from "@/components/layout";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendOrderConfirmationEmail, sendCourseActivatedEmail } from "@/lib/email";
import styles from "./page.module.css";

function formatPrice(price: number): string {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
}

// Bank info for QR payment
const bankInfo = {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "NGUYEN VIET BAO",
    branch: "Chi nhánh TP.HCM",
};

interface Course {
    id: string;
    title: string;
    price: number;
    sale_price: number | null;
    slug: string;
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const courseSlug = searchParams.get("course");
    const courseId = searchParams.get("courseId");

    const [course, setCourse] = useState<Course | null>(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        note: "",
    });
    const [step, setStep] = useState<"info" | "payment" | "success">("info");
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);
    const [error, setError] = useState("");
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCourse() {
            if (!courseSlug && !courseId) {
                setIsLoadingCourse(false);
                return;
            }

            const supabase = createClient();
            let query = supabase
                .from("courses")
                .select("id, title, price, sale_price, slug");

            if (courseId) {
                query = query.eq("id", courseId);
            } else {
                query = query.eq("slug", courseSlug);
            }

            const { data, error } = await query.single();

            if (data) {
                setCourse(data);
            }
            setIsLoadingCourse(false);

            // Pre-fill user data if logged in
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    email: user.email || "",
                    fullName: user.user_metadata?.full_name || ""
                }));
            }
        }

        fetchCourse();
    }, [courseSlug]);


    if (isLoadingCourse) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                        Loading...
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    if (!course) {
        return (
            <>
                <Header />
                <main className={styles.main}>
                    <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
                        <h2>Không tìm thấy khóa học</h2>
                        <Link href="/courses" className="btn btn-primary">Xem danh sách khóa học</Link>
                    </div>
                </main>
                <Footer />
            </>
        )
    }

    const finalPrice = course.sale_price || course.price;

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmitInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        // Automatically proceed to payment step (or finish if free)
        setStep("payment");
        setIsLoading(false);
    };

    const handleConfirmPayment = async () => {
        setIsLoading(true);
        setError("");
        const supabase = createClient();

        // Check user (create guest user if needed? For now require login or create pending order linked to email)
        // Actually, let's check if we have a user.
        const { data: { user } } = await supabase.auth.getUser();
        let userId = user?.id;

        if (!userId) {
            // If no user, we might need them to register first or store order with null user_id?
            // For MVP simplify: Require login would be best, but let's allow unauthenticated order creation 
            // and handle mapping later? Or prompt login?
            // Let's create the order with null user_id but save email.
        }

        // 1. Create Order
        const { data: order, error: orderError } = await supabase
            .from("orders")
            .insert({
                user_id: userId || null, // Allow null for guest checkout
                course_id: course.id,
                amount: finalPrice,
                status: finalPrice === 0 ? "paid" : "pending", // Auto-complete if free
                payment_method: finalPrice === 0 ? "free" : "bank_transfer",
                customer_name: formData.fullName,
                customer_email: formData.email,
                customer_phone: formData.phone,
                transaction_note: formData.note,
            })
            .select()
            .single();

        if (orderError) {
            setError("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại: " + orderError.message);
            setIsLoading(false);
            return;
        }

        setOrderId(order.id);

        // Format order date
        const orderDate = new Date().toLocaleDateString("vi-VN");

        // 2. Send confirmation email
        if (finalPrice > 0) {
            // Paid order - send order confirmation
            sendOrderConfirmationEmail({
                email: formData.email,
                customerName: formData.fullName,
                orderNumber: order.id.slice(0, 8).toUpperCase(),
                courseName: course.title,
                coursePrice: finalPrice,
                orderDate: orderDate,
                paymentMethod: "Chuyển khoản ngân hàng",
            });
        }

        // 3. If free, auto-enroll and send activation email
        if (finalPrice === 0 && userId) {
            const { error: enrollError } = await supabase
                .from("enrollments")
                .insert({
                    user_id: userId,
                    course_id: course.id,
                    order_id: order.id
                });

            if (enrollError) {
                console.error("Auto enrollment failed", enrollError);
            } else {
                // Send course activation email for free course
                sendCourseActivatedEmail({
                    email: formData.email,
                    customerName: formData.fullName,
                    courseName: course.title,
                    courseSlug: course.slug,
                    orderNumber: order.id.slice(0, 8).toUpperCase(),
                });
            }
        }

        setStep("success");
        setIsLoading(false);
    };

    return (
        <>
            <Header />
            <main className={styles.main}>
                <div className="container">
                    <div className={styles.checkoutGrid}>
                        {/* Left - Form/Payment */}
                        <div className={styles.formSection}>
                            {/* Progress Steps */}
                            <div className={styles.steps}>
                                <div
                                    className={`${styles.step} ${step === "info" ? styles.stepActive : ""
                                        } ${step !== "info" ? styles.stepCompleted : ""}`}
                                >
                                    <span className={styles.stepNumber}>1</span>
                                    <span>Thông tin</span>
                                </div>
                                <div className={styles.stepLine}></div>
                                <div
                                    className={`${styles.step} ${step === "payment" ? styles.stepActive : ""
                                        } ${step === "success" ? styles.stepCompleted : ""}`}
                                >
                                    <span className={styles.stepNumber}>2</span>
                                    <span>Thanh toán</span>
                                </div>
                                <div className={styles.stepLine}></div>
                                <div
                                    className={`${styles.step} ${step === "success" ? styles.stepActive : ""
                                        }`}
                                >
                                    <span className={styles.stepNumber}>3</span>
                                    <span>Hoàn tất</span>
                                </div>
                            </div>

                            {/* Step 1: Info Form */}
                            {step === "info" && (
                                <div className={styles.stepContent}>
                                    <h2>Thông tin đặt hàng</h2>
                                    <form onSubmit={handleSubmitInfo} className={styles.form}>
                                        <div className="form-group">
                                            <label htmlFor="fullName" className="form-label">
                                                Họ và tên *
                                            </label>
                                            <input
                                                type="text"
                                                id="fullName"
                                                name="fullName"
                                                className="form-input"
                                                placeholder="Nguyễn Văn A"
                                                value={formData.fullName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="email" className="form-label">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                className="form-input"
                                                placeholder="your@email.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                            <p className={styles.hint}>
                                                Email sẽ được dùng để nhận thông tin khóa học.
                                            </p>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="phone" className="form-label">
                                                Số điện thoại *
                                            </label>
                                            <input
                                                type="tel"
                                                id="phone"
                                                name="phone"
                                                className="form-input"
                                                placeholder="0901234567"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="note" className="form-label">
                                                Ghi chú (tùy chọn)
                                            </label>
                                            <textarea
                                                id="note"
                                                name="note"
                                                className="form-input"
                                                placeholder="Ghi chú thêm nếu có..."
                                                value={formData.note}
                                                onChange={handleInputChange}
                                                rows={3}
                                                style={{ resize: "vertical" }}
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="btn btn-primary btn-lg"
                                            disabled={isLoading}
                                            style={{ width: "100%" }}
                                        >
                                            {isLoading ? "Đang xử lý..." : finalPrice === 0 ? "Nhận khóa học miễn phí" : "Tiếp tục thanh toán"}
                                        </button>
                                    </form>
                                </div>
                            )}

                            {/* Step 2: Payment */}
                            {step === "payment" && (
                                <div className={styles.stepContent}>
                                    {finalPrice > 0 ? (
                                        <>
                                            <h2>Thanh toán chuyển khoản</h2>

                                            <div className={styles.paymentInfo}>
                                                <div className={styles.qrSection}>
                                                    <div className={styles.qrPlaceholder}>
                                                        <span>QR Code</span>
                                                        <p>Quét mã để thanh toán</p>
                                                    </div>
                                                </div>

                                                <div className={styles.bankInfo}>
                                                    <h3>Thông tin chuyển khoản</h3>
                                                    <div className={styles.bankRow}>
                                                        <span className={styles.bankLabel}>Ngân hàng:</span>
                                                        <span className={styles.bankValue}>
                                                            {bankInfo.bankName}
                                                        </span>
                                                    </div>
                                                    <div className={styles.bankRow}>
                                                        <span className={styles.bankLabel}>Số tài khoản:</span>
                                                        <span className={styles.bankValue}>
                                                            {bankInfo.accountNumber}
                                                        </span>
                                                    </div>
                                                    <div className={styles.bankRow}>
                                                        <span className={styles.bankLabel}>Chủ tài khoản:</span>
                                                        <span className={styles.bankValue}>
                                                            {bankInfo.accountName}
                                                        </span>
                                                    </div>
                                                    <div className={styles.bankRow}>
                                                        <span className={styles.bankLabel}>Nội dung CK:</span>
                                                        <span className={styles.bankValue}>
                                                            VBP {formData.phone}
                                                        </span>
                                                    </div>
                                                    <div className={styles.bankRow}>
                                                        <span className={styles.bankLabel}>Số tiền:</span>
                                                        <span
                                                            className={styles.bankValue}
                                                            style={{ color: "var(--color-accent-gold)" }}
                                                        >
                                                            {formatPrice(finalPrice)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={styles.paymentNote}>
                                                <p>
                                                    ⏱️ Đơn hàng sẽ được xác nhận trong vòng <strong>5-30 phút</strong>{" "}
                                                    sau khi chuyển khoản thành công.
                                                </p>
                                                <p>
                                                    📧 Bạn sẽ nhận email xác nhận và hướng dẫn truy cập khóa
                                                    học tại: <strong>{formData.email}</strong>
                                                </p>
                                            </div>

                                            {error && <div className={styles.error} style={{ marginBottom: "1rem", color: "var(--color-error)" }}>{error}</div>}

                                            <div className={styles.paymentActions}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setStep("info")}
                                                >
                                                    ← Quay lại
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleConfirmPayment}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        // Confirmation for Free course
                                        <>
                                            <h2>Xác nhận đăng ký</h2>
                                            <p>Bạn đang đăng ký khóa học miễn phí. Vui lòng xác nhận để hoàn tất.</p>

                                            {error && <div className={styles.error} style={{ marginBottom: "1rem", color: "var(--color-error)" }}>{error}</div>}

                                            <div className={styles.paymentActions}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => setStep("info")}
                                                >
                                                    ← Quay lại
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={handleConfirmPayment}
                                                    disabled={isLoading}
                                                >
                                                    {isLoading ? "Đang xử lý..." : "Xác nhận đăng ký"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Step 3: Success */}
                            {step === "success" && (
                                <div className={styles.stepContent}>
                                    <div className={styles.successBox}>
                                        <div className={styles.successIcon}>✓</div>
                                        <h2>{finalPrice === 0 ? "Đăng ký thành công!" : "Đặt hàng thành công!"}</h2>
                                        <p>
                                            {finalPrice === 0
                                                ? "Bạn đã được kích hoạt khóa học này. Hãy bắt đầu học ngay!"
                                                : "Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xác nhận thanh toán và kích hoạt khóa học cho bạn trong thời gian sớm nhất."}
                                        </p>
                                        <div className={styles.successInfo}>
                                            <p>
                                                <strong>Email:</strong> {formData.email}
                                            </p>
                                            <p>
                                                <strong>Khóa học:</strong> {course.title}
                                            </p>
                                            {orderId && (
                                                <p>
                                                    <strong>Mã đơn hàng:</strong> {orderId}
                                                </p>
                                            )}
                                        </div>
                                        <div className={styles.successActions}>
                                            {finalPrice === 0 ? (
                                                <Link href={`/learn/${course.slug}`} className="btn btn-primary">
                                                    Vào học ngay
                                                </Link>
                                            ) : (
                                                <Link href="/" className="btn btn-primary">
                                                    Về trang chủ
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right - Order Summary */}
                        <div className={styles.orderSummary}>
                            <div className={styles.summaryCard}>
                                <h3>Đơn hàng của bạn</h3>
                                <div className={styles.summaryItem}>
                                    <div className={styles.itemThumbnail}>📚</div>
                                    <div className={styles.itemInfo}>
                                        <h4>{course.title}</h4>
                                        <p>Truy cập trọn đời</p>
                                    </div>
                                </div>
                                <div className={styles.divider}></div>
                                <div className={styles.summaryRow}>
                                    <span>Giá gốc:</span>
                                    <span
                                        style={
                                            course.sale_price
                                                ? {
                                                    textDecoration: "line-through",
                                                    color: "var(--color-text-muted)",
                                                }
                                                : {}
                                        }
                                    >
                                        {formatPrice(course.price)}
                                    </span>
                                </div>
                                {course.sale_price && (
                                    <div className={styles.summaryRow}>
                                        <span>Giảm giá:</span>
                                        <span style={{ color: "#22c55e" }}>
                                            -{formatPrice(course.price - course.sale_price)}
                                        </span>
                                    </div>
                                )}
                                <div className={styles.divider}></div>
                                <div className={styles.summaryTotal}>
                                    <span>Tổng cộng:</span>
                                    <span>{formatPrice(finalPrice)}</span>
                                </div>

                                <div className={styles.trustBadges}>
                                    <div className={styles.trustItem}>
                                        <span className={styles.trustIcon}>🛡️</span>
                                        <span>Bảo mật SSL 256-bit</span>
                                    </div>
                                    <div className={styles.trustItem}>
                                        <span className={styles.trustIcon}>✅</span>
                                        <span>Kích hoạt tự động</span>
                                    </div>
                                    <div className={styles.trustItem}>
                                        <span className={styles.trustIcon}>❤️</span>
                                        <span>Hỗ trợ 24/7</span>
                                    </div>
                                </div>

                                <div className={styles.guaranteeBox}>
                                    <div className={styles.guaranteeBadge}>100%</div>
                                    <div className={styles.guaranteeContent}>
                                        <strong>Cam kết hài lòng</strong>
                                        <p>Hoàn tiền trong 7 ngày nếu không đúng cam kết</p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.safeCheckout}>
                                <p>🔒 Thanh toán an toàn tuyệt đối</p>
                                <div className={styles.paymentIcons}>
                                    <span>🏦</span>
                                    <span>💳</span>
                                    <span>📱</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div
                    style={{
                        minHeight: "100vh",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <p>Đang tải...</p>
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}

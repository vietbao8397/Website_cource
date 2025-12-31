import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

interface CourseActivatedEmailProps {
    customerName: string;
    courseName: string;
    courseSlug: string;
    orderNumber: string;
}

export default function CourseActivatedEmail({
    customerName = "Khách hàng",
    courseName = "Khóa học AI",
    courseSlug = "ai-co-ban",
    orderNumber = "ORD-001",
}: CourseActivatedEmailProps) {
    const courseUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://vietbaopro.com"}/learn/${courseSlug}`;

    return (
        <Html>
            <Head />
            <Preview>🎉 Khóa học đã được kích hoạt - Bắt đầu học ngay!</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* Header */}
                    <Section style={header}>
                        <Text style={logo}>
                            Vietbao<span style={logoAccent}>Pro</span>
                        </Text>
                    </Section>

                    {/* Main Content */}
                    <Section style={content}>
                        <Text style={celebrationEmoji}>🎉</Text>
                        <Heading style={heading}>Chúc mừng! Khóa học đã được kích hoạt</Heading>

                        <Text style={paragraph}>
                            Xin chào <strong>{customerName}</strong>,
                        </Text>

                        <Text style={paragraph}>
                            Thanh toán cho đơn hàng <strong>#{orderNumber}</strong> đã được xác nhận.
                            Khóa học của bạn đã được kích hoạt thành công!
                        </Text>

                        {/* Course Info Box */}
                        <Section style={courseBox}>
                            <Text style={courseLabel}>Khóa học của bạn</Text>
                            <Text style={courseNameStyle}>{courseName}</Text>
                        </Section>


                        {/* CTA Button */}
                        <Section style={buttonSection}>
                            <Button style={button} href={courseUrl}>
                                🚀 Bắt đầu học ngay
                            </Button>
                        </Section>

                        <Text style={tipText}>
                            💡 <strong>Mẹo:</strong> Hãy bắt đầu với bài học đầu tiên và học theo thứ tự
                            để đạt hiệu quả tốt nhất!
                        </Text>

                        <Hr style={hr} />

                        {/* What's Next */}
                        <Section style={whatsNextSection}>
                            <Text style={whatsNextTitle}>Tiếp theo là gì?</Text>
                            <Text style={whatsNextItem}>✅ Truy cập "Khóa học của tôi" để xem tiến độ</Text>
                            <Text style={whatsNextItem}>✅ Hoàn thành các bài học theo thứ tự</Text>
                            <Text style={whatsNextItem}>✅ Thực hành ngay sau mỗi bài học</Text>
                            <Text style={whatsNextItem}>✅ Liên hệ hỗ trợ nếu gặp khó khăn</Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={paragraph}>
                            Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua email{" "}
                            <Link href="mailto:support@vietbaopro.com" style={link}>
                                support@vietbaopro.com
                            </Link>
                        </Text>

                        <Text style={signature}>
                            Chúc bạn học tập hiệu quả! 🎓<br />
                            <strong>Đội ngũ Vietbaopro</strong>
                        </Text>
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Text style={footerText}>
                            © 2024 Vietbaopro. All rights reserved.
                        </Text>
                        <Text style={footerText}>
                            <Link href="https://vietbaopro.com" style={footerLink}>
                                vietbaopro.com
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
}

// Styles
const main = {
    backgroundColor: "#0a0a0a",
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    margin: "0 auto",
    padding: "20px 0 48px",
    maxWidth: "600px",
};

const header = {
    padding: "24px",
    textAlign: "center" as const,
};

const logo = {
    fontSize: "24px",
    fontWeight: "bold",
    color: "#ffffff",
    margin: "0",
};

const logoAccent = {
    color: "#b89a5a",
};

const content = {
    backgroundColor: "#1a1a1a",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #2a2a2a",
    textAlign: "center" as const,
};

const celebrationEmoji = {
    fontSize: "48px",
    margin: "0 0 16px",
};

const heading = {
    color: "#22c55e",
    fontSize: "24px",
    fontWeight: "bold",
    margin: "0 0 24px",
};

const paragraph = {
    color: "#e0e0e0",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px",
    textAlign: "left" as const,
};

const courseBox = {
    backgroundColor: "rgba(34, 197, 94, 0.1)",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    border: "1px solid rgba(34, 197, 94, 0.3)",
};

const courseLabel = {
    color: "#22c55e",
    fontSize: "12px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "0 0 8px",
};

const courseNameStyle = {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0",
};


const buttonSection = {
    margin: "32px 0",
};

const button = {
    backgroundColor: "#b89a5a",
    borderRadius: "8px",
    color: "#000000",
    fontWeight: "bold",
    fontSize: "16px",
    textDecoration: "none",
    padding: "16px 32px",
    display: "inline-block",
};

const tipText = {
    backgroundColor: "rgba(184, 154, 90, 0.1)",
    borderRadius: "8px",
    padding: "12px 16px",
    color: "#e0e0e0",
    fontSize: "14px",
    textAlign: "left" as const,
    border: "1px solid rgba(184, 154, 90, 0.3)",
};

const whatsNextSection = {
    textAlign: "left" as const,
    margin: "24px 0",
};

const whatsNextTitle = {
    color: "#b89a5a",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "0 0 12px",
};

const whatsNextItem = {
    color: "#e0e0e0",
    fontSize: "14px",
    margin: "0 0 8px",
};

const hr = {
    borderColor: "#2a2a2a",
    margin: "24px 0",
};

const link = {
    color: "#b89a5a",
};

const signature = {
    color: "#888888",
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "24px 0 0",
    textAlign: "left" as const,
};

const footer = {
    textAlign: "center" as const,
    padding: "24px",
};

const footerText = {
    color: "#666666",
    fontSize: "12px",
    margin: "0 0 8px",
};

const footerLink = {
    color: "#888888",
    textDecoration: "none",
};

import {
    Body,
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

interface OrderConfirmationEmailProps {
    customerName: string;
    orderNumber: string;
    courseName: string;
    coursePrice: number;
    orderDate: string;
    paymentMethod: string;
}

export default function OrderConfirmationEmail({
    customerName = "Khách hàng",
    orderNumber = "ORD-001",
    courseName = "Khóa học AI",
    coursePrice = 499000,
    orderDate = "31/12/2024",
    paymentMethod = "Chuyển khoản ngân hàng",
}: OrderConfirmationEmailProps) {
    const formattedPrice = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(coursePrice);

    return (
        <Html>
            <Head />
            <Preview>Xác nhận đơn hàng #{orderNumber} - Vietbaopro</Preview>
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
                        <Heading style={heading}>Xác nhận đơn hàng</Heading>

                        <Text style={paragraph}>
                            Xin chào <strong>{customerName}</strong>,
                        </Text>

                        <Text style={paragraph}>
                            Cảm ơn bạn đã đặt mua khóa học tại Vietbaopro! Đơn hàng của bạn đã được ghi nhận và đang chờ xử lý.
                        </Text>

                        {/* Order Details Box */}
                        <Section style={orderBox}>
                            <Text style={orderTitle}>Chi tiết đơn hàng</Text>

                            <table style={orderTable}>
                                <tbody>
                                    <tr>
                                        <td style={labelCell}>Mã đơn hàng:</td>
                                        <td style={valueCell}><strong>#{orderNumber}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Ngày đặt:</td>
                                        <td style={valueCell}>{orderDate}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Khóa học:</td>
                                        <td style={valueCell}><strong>{courseName}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Giá tiền:</td>
                                        <td style={valueCell}><strong style={priceText}>{formattedPrice}</strong></td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Thanh toán:</td>
                                        <td style={valueCell}>{paymentMethod}</td>
                                    </tr>
                                    <tr>
                                        <td style={labelCell}>Trạng thái:</td>
                                        <td style={valueCell}><span style={statusPending}>⏳ Chờ thanh toán</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </Section>

                        {/* Payment Instructions */}
                        <Section style={instructionBox}>
                            <Text style={instructionTitle}>💡 Hướng dẫn thanh toán</Text>
                            <Text style={instructionText}>
                                Vui lòng chuyển khoản đúng số tiền và ghi nội dung chuyển khoản là mã đơn hàng <strong>#{orderNumber}</strong> để chúng tôi xác nhận nhanh nhất.
                            </Text>
                            <Text style={instructionText}>
                                Sau khi thanh toán thành công, bạn sẽ nhận được email xác nhận và có thể bắt đầu học ngay!
                            </Text>
                        </Section>

                        <Hr style={hr} />

                        <Text style={paragraph}>
                            Nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ với chúng tôi qua email{" "}
                            <Link href="mailto:support@vietbaopro.com" style={link}>
                                support@vietbaopro.com
                            </Link>
                        </Text>

                        <Text style={signature}>
                            Trân trọng,<br />
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
};

const heading = {
    color: "#b89a5a",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "0 0 24px",
};

const paragraph = {
    color: "#e0e0e0",
    fontSize: "16px",
    lineHeight: "1.6",
    margin: "0 0 16px",
};

const orderBox = {
    backgroundColor: "#0a0a0a",
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
    border: "1px solid #2a2a2a",
};

const orderTitle = {
    color: "#b89a5a",
    fontSize: "14px",
    fontWeight: "bold",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "0 0 16px",
};

const orderTable = {
    width: "100%",
    borderCollapse: "collapse" as const,
};

const labelCell = {
    color: "#888888",
    fontSize: "14px",
    padding: "8px 0",
    verticalAlign: "top" as const,
    width: "40%",
};

const valueCell = {
    color: "#ffffff",
    fontSize: "14px",
    padding: "8px 0",
    verticalAlign: "top" as const,
};

const priceText = {
    color: "#b89a5a",
    fontSize: "16px",
};

const statusPending = {
    backgroundColor: "rgba(251, 191, 36, 0.2)",
    color: "#fbbf24",
    padding: "4px 12px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "bold",
};

const instructionBox = {
    backgroundColor: "rgba(184, 154, 90, 0.1)",
    borderRadius: "8px",
    padding: "16px",
    margin: "24px 0",
    border: "1px solid rgba(184, 154, 90, 0.3)",
};

const instructionTitle = {
    color: "#b89a5a",
    fontSize: "14px",
    fontWeight: "bold",
    margin: "0 0 8px",
};

const instructionText = {
    color: "#e0e0e0",
    fontSize: "14px",
    lineHeight: "1.6",
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

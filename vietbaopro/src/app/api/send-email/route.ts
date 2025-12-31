import { NextRequest, NextResponse } from "next/server";
import { resend, FROM_EMAIL } from "@/lib/resend";
import OrderConfirmationEmail from "@/emails/OrderConfirmationEmail";
import CourseActivatedEmail from "@/emails/CourseActivatedEmail";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, data } = body;

        if (!type || !data) {
            return NextResponse.json(
                { error: "Missing type or data" },
                { status: 400 }
            );
        }

        let emailResult;

        switch (type) {
            case "order_confirmation":
                emailResult = await resend.emails.send({
                    from: FROM_EMAIL,
                    to: data.email,
                    subject: `Xác nhận đơn hàng #${data.orderNumber} - Vietbaopro`,
                    react: OrderConfirmationEmail({
                        customerName: data.customerName,
                        orderNumber: data.orderNumber,
                        courseName: data.courseName,
                        coursePrice: data.coursePrice,
                        orderDate: data.orderDate,
                        paymentMethod: data.paymentMethod || "Chuyển khoản ngân hàng",
                    }),
                });
                break;

            case "course_activated":
                emailResult = await resend.emails.send({
                    from: FROM_EMAIL,
                    to: data.email,
                    subject: `🎉 Khóa học "${data.courseName}" đã được kích hoạt - Vietbaopro`,
                    react: CourseActivatedEmail({
                        customerName: data.customerName,
                        courseName: data.courseName,
                        courseSlug: data.courseSlug,
                        orderNumber: data.orderNumber,
                    }),
                });
                break;

            default:
                return NextResponse.json(
                    { error: "Unknown email type" },
                    { status: 400 }
                );
        }

        if (emailResult.error) {
            console.error("Email send error:", emailResult.error);
            return NextResponse.json(
                { error: emailResult.error.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, id: emailResult.data?.id });
    } catch (error) {
        console.error("API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

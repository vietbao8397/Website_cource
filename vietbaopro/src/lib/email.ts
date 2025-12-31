// Email sending helper functions

interface OrderConfirmationData {
    email: string;
    customerName: string;
    orderNumber: string;
    courseName: string;
    coursePrice: number;
    orderDate: string;
    paymentMethod?: string;
}

interface CourseActivatedData {
    email: string;
    customerName: string;
    courseName: string;
    courseSlug: string;
    orderNumber: string;
}

const API_URL = "/api/send-email";

export async function sendOrderConfirmationEmail(data: OrderConfirmationData): Promise<boolean> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "order_confirmation",
                data,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to send order confirmation email:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error sending order confirmation email:", error);
        return false;
    }
}

export async function sendCourseActivatedEmail(data: CourseActivatedData): Promise<boolean> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "course_activated",
                data,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to send course activated email:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error sending course activated email:", error);
        return false;
    }
}

interface AutomatedEmailData {
    to: string;
    subject: string;
    html: string;
}

export async function sendAutomatedEmail(data: AutomatedEmailData): Promise<boolean> {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: "automated",
                data,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error("Failed to send automated email:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error sending automated email:", error);
        return false;
    }
}

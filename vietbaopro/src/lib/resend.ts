import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
    console.warn("Warning: RESEND_API_KEY is not set. Email sending will fail.");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender - using verified domain bbaoviet.click
export const FROM_EMAIL = process.env.FROM_EMAIL || "Vietbaopro <hello@bbaoviet.click>";

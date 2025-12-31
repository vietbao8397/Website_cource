import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vietbaopro - Content AI: Cắt giảm 50% thời gian, nhân đôi Chất lượng",
  description:
    "Hệ thống hóa Quy trình Sáng tạo Nội dung bằng AI dành cho Marketers & Creators. Biến sự hỗn loạn thành trật tự. Biến người mới thành Pro trong 30 ngày.",
  keywords: [
    "AI Content",
    "Marketing",
    "Khóa học AI",
    "Content Marketing",
    "ChatGPT",
    "Vietbaopro",
  ],
  authors: [{ name: "Vietbaopro" }],
  openGraph: {
    title: "Vietbaopro - Content AI: Cắt giảm 50% thời gian, nhân đôi Chất lượng",
    description:
      "Hệ thống hóa Quy trình Sáng tạo Nội dung bằng AI dành cho Marketers & Creators.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

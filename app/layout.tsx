import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MagicBackground from "@/components/MagicBackground"; // 引入新组件

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notra - Notes for a New Era",
  description: "Your AI copilot for academic excellence. Upload lectures, slides, or papers, and instantly generate structured notes, flashcards, and summaries.",
  icons: {
    icon: '/notra-logo-v4.png',
    apple: '/notra-logo-v4.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 全局魔法星空背景，层级最底 */}
        <MagicBackground />
        
        {/* 页面内容 */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}

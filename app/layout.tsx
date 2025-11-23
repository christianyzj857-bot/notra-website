import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-purple-50 via-indigo-50 to-pink-50`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono, Cairo } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/ui/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "نظام إدارة النقل - UmzugsManager",
  description: "نظام شامل لإدارة شركات النقل والفواتير",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} font-sans antialiased`}
      >
        <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}

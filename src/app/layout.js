import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { GamificationProvider } from "@/components/GamificationProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TasksPro — Ultimate Academic Platform",
  description: "A modern, high-engagement academic management system for students, teachers, and CRs",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <GamificationProvider>
            {children}
          </GamificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

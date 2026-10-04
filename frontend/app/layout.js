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

export const metadata = {
  title: "Mission 2K38 | Elite Football Upliftment",
  description: "An Indian Football Upliftment Platform. Empowering players, coaches, and scouts with data-driven analytics and world-class management.",
};

import SmoothScroll from "@/components/ui/SmoothScroll";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <SmoothScroll>
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ResearchProvider } from "@/lib/ResearchContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pulse — Autonomous Research Agent",
  description: "Your personal AI research analyst. Automated research, weekly digests, shareable reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <ResearchProvider>
          {children}
        </ResearchProvider>
      </body>
    </html>
  );
}

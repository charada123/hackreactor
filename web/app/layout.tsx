import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "GreenPass — AI USCIS Green Card Interview Practice",
  description:
    "Practice your USCIS I-485 green card interview with realistic AI simulations, instant feedback, and a personalized readiness score. Educational tool — not legal advice.",
};

export const viewport: Viewport = {
  themeColor: "#356CF0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        <main className="min-h-[70vh]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

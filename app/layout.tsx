import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const sarabun = Sarabun({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sarabun",
});

export const metadata: Metadata = {
  title: "Politigraph Thailand - Visual Analytics",
  description: "ติดตามการทำงานของสมาชิกสภาผู้แทนราษฎร ปี 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.variable} antialiased`}>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "./ThemeRegistry";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-sukhumvit",
});

export const metadata: Metadata = {
  title: 'คนที่คุณเลือก "ทำอะไร?" ในสภา',
  description: "ติดตามการลงมติของสมาชิกสภาผู้แทนราษฎร (แบ่งเขต) ในปี 2025",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${prompt.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}

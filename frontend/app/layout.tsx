import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TeachSmarter - AI Co-pilot for Teachers",
  description: "Serverless, event-driven, multi-agent AI assistant with Human-in-the-Loop oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}


import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "TeachSmarter - AI Co-pilot for Teachers | Greenwood Academy, Lagos",
  description: "Serverless, event-driven, multi-agent AI assistant with Human-in-the-Loop oversight localized for Nigerian secondary schools (NERDC / BECE curriculum).",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className="notranslate">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased text-slate-900 notranslate">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

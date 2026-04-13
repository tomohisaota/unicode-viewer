import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HtmlLangSetter from "./components/HtmlLangSetter";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";
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
  title: "Unicode Viewer",
  description:
    "Unicode code point viewer — view encodings, categories, and details for each character",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <HtmlLangSetter />
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}

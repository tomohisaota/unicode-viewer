import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import HtmlLangSetter from "./components/HtmlLangSetter";
import ServiceWorkerRegistrar from "./components/ServiceWorkerRegistrar";
import "./globals.css";
import "./cjk-ivs-font.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://unicode-viewer.appbatake.com";
const DESCRIPTION =
  "Analyze Unicode strings — grapheme clusters, code points, UTF-8/UTF-16 bytes, legacy encodings (Shift_JIS, Big5, GBK, EUC-KR, and 20+ more), CJK IRG sources, and normalization comparison.";

export const metadata: Metadata = {
  title: "Unicode Viewer — Character Encoding Inspector",
  description: DESCRIPTION,
  manifest: "/manifest.json",
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Unicode Viewer",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Unicode Viewer",
    type: "website",
    locale: "en",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Unicode Viewer — Character Encoding Inspector",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unicode Viewer",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-512.png",
  },
  keywords: [
    "Unicode",
    "code point",
    "UTF-8",
    "UTF-16",
    "character encoding",
    "Shift_JIS",
    "CP932",
    "Big5",
    "GBK",
    "GB18030",
    "EUC-KR",
    "EUC-JP",
    "ISO-2022-JP",
    "CJK",
    "Unihan",
    "IRG source",
    "grapheme cluster",
    "normalization",
    "NFC",
    "NFD",
    "NFKC",
    "NFKD",
  ],
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
      translate="no"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased notranslate`}
      suppressHydrationWarning
    >
      <head>
        <meta name="google" content="notranslate" />
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.lang=/^\\/ja(\\/|$)/.test(location.pathname)?"ja":"en"`,
          }}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Math&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <HtmlLangSetter />
        <ServiceWorkerRegistrar />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Unicode Viewer",
              url: SITE_URL,
              description: DESCRIPTION,
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              browserRequirements: "Requires a modern web browser",
              inLanguage: ["en", "ja"],
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}

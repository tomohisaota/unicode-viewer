import type { Metadata } from "next";
import LearnIndex from "./components/LearnIndex";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const metadata: Metadata = {
  title: "Learn Unicode",
  description:
    "Interactive guides to Unicode — grapheme clusters, normalization, encoding, CJK ideographs, emoji, and more.",
  alternates: {
    canonical: "/learn",
    languages: {
      en: "/learn",
      ja: "/ja/learn",
      "x-default": "/learn",
    },
  },
  openGraph: {
    title: "Learn Unicode",
    description:
      "Interactive guides to Unicode — grapheme clusters, normalization, encoding, CJK ideographs, emoji, and more.",
    type: "website",
    url: `${SITE_URL}/learn`,
    locale: "en",
    alternateLocale: "ja",
  },
};

export default function LearnIndexEn() {
  return <LearnIndex locale="en" />;
}

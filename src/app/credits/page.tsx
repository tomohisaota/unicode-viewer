import type { Metadata } from "next";
import CreditsContent from "../components/CreditsContent";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const metadata: Metadata = {
  title: "Credits & Licenses | Unicode Viewer",
  description:
    "Fonts, data, and upstream projects that make the Unicode Viewer possible.",
  alternates: {
    canonical: "/credits",
    languages: {
      en: "/credits",
      ja: "/ja/credits",
      "x-default": "/credits",
    },
  },
  openGraph: {
    title: "Credits & Licenses",
    description:
      "Fonts, data, and upstream projects that make the Unicode Viewer possible.",
    type: "website",
    url: `${SITE_URL}/credits`,
    locale: "en",
    alternateLocale: "ja",
  },
};

export default function CreditsPage() {
  return <CreditsContent locale="en" />;
}

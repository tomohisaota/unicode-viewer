import type { Metadata } from "next";
import CreditsContent from "../../components/CreditsContent";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const metadata: Metadata = {
  title: "クレジットとライセンス | Unicode Viewer",
  description:
    "Unicode Viewer を成り立たせているフォント・データ・上流プロジェクトへの謝辞。",
  alternates: {
    canonical: "/ja/credits",
    languages: {
      en: "/credits",
      ja: "/ja/credits",
      "x-default": "/credits",
    },
  },
  openGraph: {
    title: "クレジットとライセンス",
    description:
      "Unicode Viewer を成り立たせているフォント・データ・上流プロジェクトへの謝辞。",
    type: "website",
    url: `${SITE_URL}/ja/credits`,
    locale: "ja",
    alternateLocale: "en",
  },
};

export default function CreditsPageJa() {
  return <CreditsContent locale="ja" />;
}

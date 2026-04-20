import type { Metadata } from "next";
import LearnIndex from "../../learn/components/LearnIndex";

const SITE_URL = "https://unicode-viewer.appbatake.com";

const DESCRIPTION =
  "Unicode の基礎から CJK・エンコーディング・セキュリティまで、書記素クラスタ、正規化、異体字セレクタ、絵文字の構造などを実例付きで学べるガイド集。";

export const metadata: Metadata = {
  title: "Unicode を学ぶ",
  description: DESCRIPTION,
  alternates: {
    canonical: "/ja/learn",
    languages: {
      en: "/learn",
      ja: "/ja/learn",
      "x-default": "/learn",
    },
  },
  openGraph: {
    title: "Unicode を学ぶ",
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/ja/learn`,
    locale: "ja",
    alternateLocale: "en",
  },
};

export default function LearnIndexJa() {
  return <LearnIndex locale="ja" />;
}

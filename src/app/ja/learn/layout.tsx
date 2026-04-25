import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import LearnFooter from "../../learn/components/LearnFooter";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const metadata: Metadata = {
  title: {
    template: "%s | Unicode Viewer Learn",
    default: "Unicode を学ぶ | Unicode Viewer",
  },
  metadataBase: new URL(SITE_URL),
};

export default function JaLearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader currentPage="learn" locale="ja" />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
      <LearnFooter locale="ja" />
    </div>
  );
}

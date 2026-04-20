import type { Metadata } from "next";
import LearnHeader from "../../learn/components/LearnHeader";

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
    <div className="min-h-screen">
      <LearnHeader locale="ja" />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

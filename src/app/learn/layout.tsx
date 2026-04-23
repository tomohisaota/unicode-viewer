import type { Metadata } from "next";
import LearnHeader from "./components/LearnHeader";
import LearnFooter from "./components/LearnFooter";

const SITE_URL = "https://unicode-viewer.appbatake.com";

export const metadata: Metadata = {
  title: {
    template: "%s | Unicode Viewer Learn",
    default: "Learn Unicode | Unicode Viewer",
  },
  metadataBase: new URL(SITE_URL),
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <LearnHeader locale="en" />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
      <LearnFooter locale="en" />
    </div>
  );
}

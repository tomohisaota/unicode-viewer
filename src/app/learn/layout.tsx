import type { Metadata } from "next";
import LocaleSwitch from "./components/LocaleSwitch";

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
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
          boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        }}
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="text-sm font-medium no-underline transition-colors"
              style={{ color: "var(--gray-500)" }}
            >
              Unicode Viewer
            </a>
            <span style={{ color: "var(--gray-300)" }}>/</span>
            <a
              href="/learn"
              className="text-sm font-semibold no-underline"
              style={{ color: "var(--gray-900)" }}
            >
              <LocaleSwitch en="Learn" ja="学ぶ" />
            </a>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium no-underline transition-colors"
            style={{
              boxShadow: "0px 0px 0px 1px var(--shadow-border)",
              color: "var(--gray-600)",
            }}
          >
            <LocaleSwitch en="Open Tool" ja="ツールを開く" />
          </a>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}

import LanguageSwitch from "./LanguageSwitch";
import ShareButton from "./ShareButton";

export default function LearnHeader({ locale }: { locale: "en" | "ja" }) {
  const basePath = locale === "ja" ? "/ja/learn" : "/learn";
  return (
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
            href={basePath}
            className="text-sm font-semibold no-underline"
            style={{ color: "var(--gray-900)" }}
          >
            {locale === "ja" ? "学ぶ" : "Learn"}
          </a>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <LanguageSwitch locale={locale} />
          <ShareButton locale={locale} />
          <a
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium no-underline transition-colors"
            style={{
              boxShadow: "0px 0px 0px 1px var(--shadow-border)",
              color: "var(--gray-600)",
            }}
          >
            {locale === "ja" ? "ツールを開く" : "Open Tool"}
          </a>
        </div>
      </div>
    </header>
  );
}

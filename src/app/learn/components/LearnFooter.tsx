export default function LearnFooter({ locale }: { locale: "en" | "ja" }) {
  const creditsHref = locale === "ja" ? "/ja/credits" : "/credits";
  const creditsLabel = locale === "ja" ? "クレジットとライセンス" : "Credits & licenses";
  return (
    <footer
      className="mt-12 sm:mt-16 py-6 sm:py-8"
      style={{ borderTop: "1px solid var(--gray-100)" }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
        <a
          href={creditsHref}
          className="text-xs no-underline"
          style={{ color: "var(--gray-500)" }}
        >
          {creditsLabel}
        </a>
        <span className="text-xs" style={{ color: "var(--gray-400)" }}>
          © Unicode Viewer
        </span>
      </div>
    </footer>
  );
}

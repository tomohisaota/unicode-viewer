"use client";

import { useMessages } from "@/lib/i18n";

export default function ShareButton() {
  const t = useMessages();

  return (
    <button
      type="button"
      onClick={() => {
        const url = window.location.href;
        const title = document.title;
        const tweet = `${title} 🔍 #Unicode #UnicodeViewer\n${url}`;
        window.open(
          `https://x.com/intent/tweet?text=${encodeURIComponent(tweet)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        color: "var(--gray-600)",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = "var(--gray-50)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = "transparent")
      }
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      <span className="hidden sm:inline">{t.shareOnX}</span>
    </button>
  );
}

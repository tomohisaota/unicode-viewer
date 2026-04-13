"use client";

import { useState, useRef, useEffect } from "react";
import { useMessages } from "@/lib/i18n";
import type { HelpSection } from "@/lib/i18n";

export default function PageHeader() {
  const t = useMessages();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--background) 85%, transparent)",
          boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <h1
            className="text-base sm:text-xl font-semibold truncate"
            style={{ letterSpacing: "-0.96px", color: "var(--gray-900)" }}
          >
            {t.siteTitle}
          </h1>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <a
              href="https://github.com/tomohisaota/unicode-viewer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors"
              style={{
                boxShadow: "0px 0px 0px 1px var(--shadow-border)",
                color: "var(--gray-600)",
                textDecoration: "none",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--gray-50)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <button
              type="button"
              onClick={() => {
                const url = window.location.href;
                const params = new URLSearchParams(window.location.search);
                const inputText = params.get("text") || "";
                const body = inputText
                  ? `「${inputText}」${t.shareTextWithInput}`
                  : t.shareTextEmpty;
                const tweet = body + "\n" + url;
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
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="hidden sm:inline">{t.help}</span>
            </button>
          </div>
        </div>
      </header>

      {helpOpen && (
        <HelpDialog
          title={t.helpTitle}
          sections={t.helpSections}
          closeLabel={t.close}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </>
  );
}

function HelpDialog({
  title,
  sections,
  closeLabel,
  onClose,
}: {
  title: string;
  sections: readonly HelpSection[];
  closeLabel: string;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="w-[calc(100vw-1rem)] max-w-2xl rounded-xl overflow-hidden p-0 backdrop:bg-black/40"
      style={{
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        boxShadow:
          "0px 0px 0px 1px var(--shadow-border), 0px 16px 32px rgba(0,0,0,0.16)",
        margin: "auto",
        inset: 0,
        position: "fixed",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4"
        style={{
          borderBottom: "1px solid var(--gray-100)",
          backgroundColor: "var(--gray-50)",
        }}
      >
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--gray-900)", letterSpacing: "-0.5px" }}
        >
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2.5 py-1 text-xs font-medium cursor-pointer transition-colors"
          style={{ color: "var(--gray-500)" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--gray-100)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          {closeLabel}
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-6 sm:gap-8">
        {sections.map((section, i) => (
          <div key={i}>
            <h3
              className="text-sm font-semibold mb-2"
              style={{ color: "var(--gray-900)" }}
            >
              {section.title}
            </h3>
            <p
              className="text-sm"
              style={{
                color: "var(--gray-600)",
                lineHeight: 1.85,
              }}
            >
              {section.body}
            </p>
          </div>
        ))}
      </div>
    </dialog>
  );
}

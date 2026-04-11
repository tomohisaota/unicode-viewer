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
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1
            className="text-xl font-semibold"
            style={{ letterSpacing: "-0.96px", color: "var(--gray-900)" }}
          >
            {t.siteTitle}
          </h1>
          <div className="flex items-center gap-2">
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
              {t.shareOnX}
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
              {t.help}
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
      className="w-full max-w-2xl rounded-xl overflow-hidden p-0 backdrop:bg-black/40"
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
        className="flex items-center justify-between px-6 py-4"
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
      <div className="overflow-y-auto max-h-[65vh] px-6 py-6 flex flex-col gap-8">
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

"use client";

import { useEffect, useRef } from "react";
import type { HelpSection } from "@/lib/i18n";

export default function HelpDialog({
  title,
  sections,
  closeLabel,
  learnMoreLabel,
  learnHref,
  creditsHref,
  creditsLabel,
  onClose,
}: {
  title: string;
  sections: readonly HelpSection[];
  closeLabel: string;
  learnMoreLabel: string;
  learnHref: string;
  creditsHref: string;
  creditsLabel: string;
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
      className="w-[calc(100vw-1rem)] max-w-md rounded-xl overflow-hidden p-0 backdrop:bg-black/40"
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
      <div className="overflow-y-auto max-h-[70vh] px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        {sections.map((section, i) => (
          <div key={i}>
            <h3
              className="text-sm font-semibold mb-1"
              style={{ color: "var(--gray-900)" }}
            >
              {section.title}
            </h3>
            <p
              className="text-xs sm:text-sm"
              style={{ color: "var(--gray-600)", lineHeight: 1.75 }}
            >
              {section.body}
            </p>
          </div>
        ))}

        {/* Learn more / Credits links */}
        <div
          className="pt-4 flex flex-col gap-2"
          style={{ borderTop: "1px solid var(--gray-100)" }}
        >
          <a
            href={learnHref}
            className="inline-flex items-center gap-1.5 text-sm font-medium no-underline"
            style={{ color: "var(--accent-blue-text)" }}
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
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            {learnMoreLabel}
          </a>
          <a
            href={creditsHref}
            className="inline-flex items-center gap-1.5 text-xs no-underline"
            style={{ color: "var(--gray-500)" }}
          >
            {creditsLabel}
          </a>
        </div>
      </div>
    </dialog>
  );
}

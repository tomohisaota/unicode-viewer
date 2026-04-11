"use client";

import { useMessages } from "@/lib/i18n";

export default function PageHeader() {
  const t = useMessages();

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
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "var(--accent-blue-bg)",
              color: "var(--accent-blue-text)",
            }}
          >
            v1.0
          </span>
        </div>
      </header>
    </>
  );
}

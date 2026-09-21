"use client";

import { useEffect, useState } from "react";
import UnicodeViewer from "./UnicodeViewer";

function checkBrowserSupport(): string | null {
  if (typeof Intl === "undefined" || !("Segmenter" in Intl)) {
    return "Intl.Segmenter";
  }
  if (typeof HTMLDialogElement === "undefined") {
    return "HTMLDialogElement";
  }
  return null;
}

/**
 * The interactive half of the home page.
 *
 * The feature check can only run in the browser, so this stays a client
 * component and renders nothing until it has. The prose around it lives in
 * the server-rendered page so that the exported HTML is never empty —
 * crawlers that do not execute JavaScript still get the page.
 */
export default function ToolGate() {
  const [ready, setReady] = useState(false);
  const [unsupported, setUnsupported] = useState<string | null>(null);
  useEffect(() => {
    setUnsupported(checkBrowserSupport());
    setReady(true);
  }, []);

  if (!ready) return null;

  if (unsupported) {
    return (
      <div className="flex items-center justify-center py-16">
        <div
          className="max-w-md w-full rounded-xl p-6 sm:p-8 text-center"
          style={{ boxShadow: "0px 0px 0px 1px var(--shadow-border, #e5e5e5), 0px 4px 12px rgba(0,0,0,0.08)" }}
        >
          <p style={{ fontSize: "48px", lineHeight: 1 }}>&#x26A0;&#xFE0F;</p>
          <h2 className="text-lg font-semibold mt-4" style={{ color: "#171717" }}>
            Browser Not Supported
          </h2>
          <p className="text-sm mt-2" style={{ color: "#666", lineHeight: 1.7 }}>
            This application requires <code className="font-mono text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "#f5f5f5" }}>{unsupported}</code> which
            is not available in your browser.
          </p>
          <p className="text-sm mt-3" style={{ color: "#666", lineHeight: 1.7 }}>
            Please update to a recent version of Chrome, Edge, Safari, or Firefox.
          </p>
        </div>
      </div>
    );
  }

  return <UnicodeViewer />;
}

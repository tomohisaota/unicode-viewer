"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { analyzeString, formatByte, formatUtf16 } from "@/lib/unicode";
import { useLocale, useMessages } from "@/lib/i18n";
import { getLegacyEncoding, LANGUAGE_ENCODINGS, getAutoGroups, detectScript } from "@/lib/encodings";
import { getCjkIrgFlags } from "@/lib/cjk-irg-data";
import { getIvsCount, getSvsCount, getIvsVariants, getSvsVariants, hasFontGlyph, isAliasedToDefault } from "@/lib/ivd-data";
import HelpDialog from "./HelpDialog";
import { getJisLevel, getJisKuten, formatJisKuten } from "@/lib/jis-level";
import { getAnnotationKey } from "@/lib/annotations";
import type { GraphemeCluster, CodePointInfo } from "@/lib/unicode";
import type { Messages } from "@/lib/i18n";
import type { LanguageGroup, MappingVariant } from "@/lib/encodings";

type NormForm = "NFC" | "NFD" | "NFKC" | "NFKD";
const NORM_FORMS: NormForm[] = ["NFC", "NFD", "NFKC", "NFKD"];

/** Convert U+XXXX sequences (e.g. "U+1F44DU+1F3FD") to actual characters */
function convertCodePointNotation(text: string): string {
  return text.replace(/U\+([0-9A-Fa-f]{4,6})/g, (_, hex) => {
    const cp = parseInt(hex, 16);
    if (cp >= 0 && cp <= 0x10ffff) {
      return String.fromCodePoint(cp);
    }
    return _;
  });
}

/**
 * Encode a string so that combining marks are represented as U+XXXX.
 * This prevents the browser/IME from recomposing decomposed characters.
 */
function toSafeNotation(text: string): string {
  const codePoints = Array.from(text);
  return codePoints
    .map((ch) => {
      // Encode combining marks (Unicode category M) as U+XXXX
      if (/\p{M}/u.test(ch)) {
        const cp = ch.codePointAt(0)!;
        return "U+" + cp.toString(16).toUpperCase().padStart(4, "0");
      }
      return ch;
    })
    .join("");
}

/** Convert \uXXXX / \u{XXXXX} sequences to actual characters */
function convertEscapeNotation(text: string): string {
  return text.replace(/\\u\{([0-9A-Fa-f]{1,6})\}|\\u([0-9A-Fa-f]{4})/g, (_, braced, plain) => {
    const hex = braced ?? plain;
    const cp = parseInt(hex, 16);
    if (cp >= 0 && cp <= 0x10ffff) {
      return String.fromCodePoint(cp);
    }
    return _;
  });
}

interface AnalyzedString {
  text: string;
  clusters: GraphemeCluster[];
  /** Per-cluster: true if this cluster's code points differ from the input */
  diffMask: boolean[];
}

function buildDiffMask(
  inputClusters: GraphemeCluster[],
  normClusters: GraphemeCluster[]
): boolean[] {
  return normClusters.map((nc, i) => {
    if (i >= inputClusters.length) return true;
    const ic = inputClusters[i];
    if (nc.codePoints.length !== ic.codePoints.length) return true;
    return nc.codePoints.some(
      (cp, j) => cp.codePoint !== ic.codePoints[j].codePoint
    );
  });
}

export default function UnicodeViewer() {
  const t = useMessages();
  const [rawInput, setRawInput] = useState("");
  const [convertCP, setConvertCP] = useState(true);
  const [convertEsc, setConvertEsc] = useState(true);
  const [mappingVariant, setMappingVariant] = useState<MappingVariant>("whatwg");
  const [selected, setSelected] = useState<{
    section: string;
    index: number;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [showNormalization, setShowNormalization] = useState(false);
  const locale = useLocale();
  const learnHref = locale === "ja" ? "/ja/learn" : "/learn";
  const creditsHref = locale === "ja" ? "/ja/credits" : "/credits";
  const creditsLabel = locale === "ja" ? "クレジットとライセンス" : "Credits & licenses";

  // Read URL params on mount (client only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text");
    if (text !== null) setRawInput(text);
    if (params.get("cp") === "0") setConvertCP(false);
    if (params.get("esc") === "0") setConvertEsc(false);
    if (params.get("map") === "unicode.org") setMappingVariant("unicode.org");
    if (params.get("norm") === "1") setShowNormalization(true);
  }, []);

  // Sync state to URL query parameters
  useEffect(() => {
    const url = new URL(window.location.href);
    const set = (key: string, value: string | null) => {
      if (value) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    };
    set("text", rawInput || null);
    set("cp", convertCP ? null : "0");
    set("esc", convertEsc ? null : "0");
    set("map", mappingVariant === "unicode.org" ? "unicode.org" : null);
    set("norm", showNormalization ? "1" : null);
    window.history.replaceState(null, "", url.toString());
  }, [rawInput, convertCP, convertEsc, mappingVariant, showNormalization]);

  const input = useMemo(() => {
    let text = rawInput;
    if (convertCP) text = convertCodePointNotation(text);
    if (convertEsc) text = convertEscapeNotation(text);
    return text;
  }, [rawInput, convertCP, convertEsc]);
  const inputClusters = useMemo(() => analyzeString(input), [input]);

  const sections = useMemo(() => {
    const result: { key: string; label: string; desc: string; data: AnalyzedString }[] = [
      {
        key: "input",
        label: t.inputLabel,
        desc: "",
        data: {
          text: input,
          clusters: inputClusters,
          diffMask: inputClusters.map(() => false),
        },
      },
    ];
    if (showNormalization) {
      for (const form of NORM_FORMS) {
        const text = input.normalize(form);
        const clusters = analyzeString(text);
        const desc = t[`${form.toLowerCase()}Desc` as keyof typeof t] as string;
        result.push({
          key: form,
          label: form,
          desc,
          data: {
            text,
            clusters,
            diffMask: buildDiffMask(inputClusters, clusters),
          },
        });
      }
    }
    return result;
  }, [input, inputClusters, t, showNormalization]);

  // When normalization comparison is off, auto-select the first cluster of the
  // input section so the detail panel is always visible.
  useEffect(() => {
    if (showNormalization) return;
    if (inputClusters.length === 0) return;
    if (selected !== null) return;
    setSelected({ section: "input", index: 0 });
  }, [showNormalization, inputClusters.length, selected]);

  return (
    <div className="w-full">
      {/* Input Area */}
      <div className="flex items-center gap-2 sm:gap-3 mb-2">
        <label
          className="text-xs font-medium"
          style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
        >
          {t.inputLabel}
        </label>
        <SampleMenu
          t={t}
          onSelect={(value) => {
            setRawInput(value);
            setSelected(null);
          }}
        />
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors"
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
        <button
          type="button"
          onClick={() => setSettingsOpen(true)}
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="hidden sm:inline">{t.settings}</span>
        </button>
      </div>
      <textarea
        value={rawInput}
        onChange={(e) => {
          setRawInput(e.target.value);
          setSelected(null);
        }}
        placeholder={t.inputPlaceholder}
        className="w-full rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 text-base sm:text-base leading-relaxed resize-y focus:outline-none transition-shadow"
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--gray-900)",
          border: "1.5px solid var(--input-border)",
          fontFamily: "var(--font-cjk), var(--font-geist-mono), ui-monospace, monospace",
        }}
        onFocus={(e) => {
          e.currentTarget.style.border = "1.5px solid var(--accent-blue)";
          e.currentTarget.style.boxShadow =
            "0 0 0 3px var(--input-focus-ring)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.border = "1.5px solid var(--input-border)";
          e.currentTarget.style.boxShadow = "none";
        }}
        rows={2}
      />

      {/* Empty state tagline (shown only when no input) */}
      {input.length === 0 && (
        <div
          className="mt-6 sm:mt-8 rounded-xl px-4 sm:px-6 py-5 sm:py-6"
          style={{
            backgroundColor: "var(--gray-50)",
            boxShadow: "0px 0px 0px 1px var(--shadow-border)",
          }}
        >
          <p
            className="text-sm sm:text-base"
            style={{ color: "var(--gray-600)", lineHeight: 1.75 }}
          >
            {t.tagline}
          </p>
        </div>
      )}

      {/* All sections */}
      <div className="mt-6 sm:mt-8 flex flex-col gap-6 sm:gap-8">
        {sections.map(({ key, label, desc, data }) => {
          const isInput = key === "input";
          const identical = !isInput && data.text === input;
          return (
            <StringSection
              key={key}
              t={t}
              sectionKey={key}
              label={label}
              desc={desc}
              data={data}
              identical={identical}
              mappingVariant={mappingVariant}
              selectedIndex={
                selected?.section === key ? selected.index : null
              }
              onSelect={(i) => {
                const sameAsCurrent =
                  selected?.section === key && selected.index === i;
                if (sameAsCurrent && showNormalization) {
                  setSelected(null);
                } else {
                  setSelected({ section: key, index: i });
                }
              }}
              onDeselect={
                showNormalization ? () => setSelected(null) : undefined
              }
              onCopyToInput={
                !isInput
                  ? () => {
                      setRawInput(toSafeNotation(data.text));
                      setSelected(null);
                    }
                  : undefined
              }
              onSetInput={(text) => {
                setRawInput(text);
                setSelected(null);
              }}
            />
          );
        })}
      </div>

      {settingsOpen && (
        <SettingsDialog
          t={t}
          convertCP={convertCP}
          convertEsc={convertEsc}
          mappingVariant={mappingVariant}
          onConvertCPChange={(v) => {
            setConvertCP(v);
            setSelected(null);
          }}
          onConvertEscChange={(v) => {
            setConvertEsc(v);
            setSelected(null);
          }}
          onMappingVariantChange={(v) => {
            setMappingVariant(v);
            setSelected(null);
          }}
          showNormalization={showNormalization}
          onShowNormalizationChange={(v) => {
            setShowNormalization(v);
            setSelected(null);
          }}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {helpOpen && (
        <HelpDialog
          title={t.helpTitle}
          sections={t.helpSections}
          closeLabel={t.close}
          learnMoreLabel={t.helpLearnMore}
          learnHref={learnHref}
          creditsHref={creditsHref}
          creditsLabel={creditsLabel}
          onClose={() => setHelpOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Settings Dialog ─── */

function SettingsDialog({
  t,
  convertCP,
  convertEsc,
  mappingVariant,
  showNormalization,
  onConvertCPChange,
  onConvertEscChange,
  onMappingVariantChange,
  onShowNormalizationChange,
  onClose,
}: {
  t: Messages;
  convertCP: boolean;
  convertEsc: boolean;
  mappingVariant: MappingVariant;
  showNormalization: boolean;
  onConvertCPChange: (v: boolean) => void;
  onConvertEscChange: (v: boolean) => void;
  onMappingVariantChange: (v: MappingVariant) => void;
  onShowNormalizationChange: (v: boolean) => void;
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
          {t.settingsTitle}
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
          {t.close}
        </button>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-5">
        {/* Input processing */}
        <section>
          <h3
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
          >
            {t.inputProcessing}
          </h3>
          <div className="flex flex-col gap-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={convertCP}
                onChange={(e) => onConvertCPChange(e.target.checked)}
                className="accent-[var(--accent-blue)]"
              />
              <span className="text-sm" style={{ color: "var(--gray-700)" }}>
                {t.convertCodePoints}
              </span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={convertEsc}
                onChange={(e) => onConvertEscChange(e.target.checked)}
                className="accent-[var(--accent-blue)]"
              />
              <span className="text-sm" style={{ color: "var(--gray-700)" }}>
                {t.convertEscape}
              </span>
            </label>
          </div>
        </section>

        {/* Mapping variant */}
        <section>
          <h3
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
          >
            {t.mappingVariant}
          </h3>
          <div className="flex flex-col gap-2">
            {(["whatwg", "unicode.org"] as const).map((v) => (
              <label
                key={v}
                className="inline-flex items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="settingsMappingVariant"
                  value={v}
                  checked={mappingVariant === v}
                  onChange={() => onMappingVariantChange(v)}
                  className="accent-[var(--accent-blue)]"
                />
                <span className="text-sm" style={{ color: "var(--gray-700)" }}>
                  {v === "whatwg" ? t.mappingWhatwg : t.mappingUnicodeOrg}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* Display */}
        <section>
          <h3
            className="text-xs font-semibold uppercase mb-2"
            style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
          >
            {t.display}
          </h3>
          <label className="inline-flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showNormalization}
              onChange={(e) => onShowNormalizationChange(e.target.checked)}
              className="accent-[var(--accent-blue)] mt-0.5"
            />
            <span className="text-sm" style={{ color: "var(--gray-700)" }}>
              {t.showNormalization}
            </span>
          </label>
        </section>
      </div>
    </dialog>
  );
}

/* ─── String Section ─── */

function StringSection({
  t,
  sectionKey,
  label,
  desc,
  data,
  identical,
  selectedIndex,
  onSelect,
  onDeselect,
  onCopyToInput,
  onSetInput,
  mappingVariant,
}: {
  t: Messages;
  sectionKey: string;
  label: string;
  desc: string;
  data: AnalyzedString;
  identical: boolean;
  mappingVariant: MappingVariant;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  onDeselect?: () => void;
  onCopyToInput?: () => void;
  onSetInput?: (text: string) => void;
}) {
  const selectedCluster =
    selectedIndex !== null ? data.clusters[selectedIndex] : null;
  const totalCodePoints = data.clusters.reduce(
    (sum, c) => sum + c.codePoints.length,
    0
  );
  const totalUtf8Bytes = data.clusters.reduce(
    (sum, c) =>
      sum + c.codePoints.reduce((s, cp) => s + cp.utf8Bytes.length, 0),
    0
  );
  const totalUtf16Units = data.clusters.reduce(
    (sum, c) =>
      sum + c.codePoints.reduce((s, cp) => s + cp.utf16Units.length, 0),
    0
  );

  const hideLabel = sectionKey === "input" && data.clusters.length === 0;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        {!hideLabel && (
          <span
            className="text-sm font-semibold font-mono"
            style={{ color: "var(--gray-900)" }}
          >
            {label}
          </span>
        )}
        {data.clusters.length > 0 && (
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium gap-2"
            style={{
              backgroundColor: "var(--gray-50)",
              color: "var(--gray-700)",
              boxShadow: "0px 0px 0px 1px var(--shadow-border)",
            }}
          >
            <StatSegment label={t.statCharacter} value={data.clusters.length} />
            <span style={{ opacity: 0.4 }}>·</span>
            <StatSegment label={t.statCodePoint} value={totalCodePoints} />
            <span style={{ opacity: 0.4 }}>·</span>
            <StatSegment label={t.statUtf16} value={totalUtf16Units} />
            <span style={{ opacity: 0.4 }}>·</span>
            <StatSegment label={t.statUtf8} value={totalUtf8Bytes} />
          </span>
        )}
        {desc && (
          <span className="text-xs" style={{ color: "var(--gray-400)" }}>
            {desc}
          </span>
        )}
        {identical && (
          <span
            className="text-xs rounded-full px-2 py-0.5"
            style={{
              color: "var(--gray-400)",
              backgroundColor: "var(--gray-50)",
              boxShadow: "0px 0px 0px 1px var(--shadow-border)",
            }}
          >
            = {t.inputLabel}
          </span>
        )}
        {onCopyToInput && !identical && (
          <button
            type="button"
            onClick={onCopyToInput}
            className="text-xs rounded-full px-2 py-0.5 cursor-pointer transition-colors"
            style={{
              color: "var(--accent-blue-text)",
              backgroundColor: "var(--accent-blue-bg)",
              boxShadow: "0px 0px 0px 1px var(--accent-blue)",
            }}
          >
            {t.copyToInput}
          </button>
        )}
      </div>

      {/* Grid */}
      {data.clusters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.clusters.map((cluster, i) => (
            <CharCell
              key={i}
              cluster={cluster}
              isSelected={selectedIndex === i}
              isDiff={data.diffMask[i]}
              onClick={() => onSelect(i)}
            />
          ))}
        </div>
      )}

      {/* Detail */}
      {selectedCluster && selectedIndex !== null && (
        <DetailPanel
          t={t}
          cluster={selectedCluster}
          onClose={onDeselect}
          mappingVariant={mappingVariant}
          onSetInput={onSetInput}
        />
      )}
    </div>
  );
}

/* ─── CharCell ─── */

function CharCell({
  cluster,
  isSelected,
  isDiff,
  onClick,
}: {
  cluster: GraphemeCluster;
  isSelected: boolean;
  isDiff: boolean;
  onClick: () => void;
}) {
  const cp0 = cluster.codePoints[0];
  const isControl =
    cp0.codePoint <= 0x1f ||
    cp0.codePoint === 0x7f ||
    (cp0.codePoint >= 0x80 && cp0.codePoint <= 0x9f);
  const isWhitespace =
    cp0.codePoint === 0x20 ||
    cp0.codePoint === 0x3000 ||
    cp0.codePoint === 0xa0 ||
    cp0.codePoint === 0x09;

  const displayChar = isControl
    ? `\\u{${cp0.codePoint.toString(16)}}`
    : isWhitespace
      ? "␣"
      : cluster.grapheme;

  const cpCount = cluster.codePoints.length;

  // Detect variation selector: base char + single VS
  const hasVS = cpCount === 2 && (() => {
    const vs = cluster.codePoints[1].codePoint;
    return (vs >= 0xE0100 && vs <= 0xE01EF) || (vs >= 0xFE00 && vs <= 0xFE0F);
  })();
  const vsCodePoint = hasVS ? cluster.codePoints[1].codePoint : 0;
  const isSvs = hasVS && vsCodePoint >= 0xFE00 && vsCodePoint <= 0xFE0F;
  const vsHasFont = hasVS && hasFontGlyph(cp0.codePoint, vsCodePoint);
  const vsAliased = hasVS && !vsHasFont && isAliasedToDefault(cp0.codePoint, vsCodePoint);
  const vsLabel = hasVS
    ? isSvs
      ? `VS${vsCodePoint - 0xFE00 + 1}`    // VS1-VS16
      : `VS${vsCodePoint - 0xE0100 + 17}`   // VS17-VS256
    : "";

  const cpLabel = hasVS
    ? cp0.codePoint.toString(16).toUpperCase()
    : cpCount === 1
      ? cp0.codePoint.toString(16).toUpperCase()
      : `${cpCount} CP`;

  let bgColor = "transparent";
  let shadowStyle = "0px 0px 0px 1px var(--shadow-border)";
  let labelColor = "var(--gray-400)";

  if (isSelected) {
    bgColor = "var(--accent-blue-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--accent-blue)";
    labelColor = "var(--accent-blue)";
  } else if (isDiff) {
    bgColor = "var(--diff-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--diff-border)";
    labelColor = "var(--diff-text)";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center rounded transition-all cursor-pointer relative"
      style={{
        backgroundColor: bgColor,
        boxShadow: shadowStyle,
        width: "3.25rem",
        height: "3.125rem",
        padding: "3px 0 4px",
        gap: "3px",
      }}
    >
      {hasVS && (
        <span
          className="absolute font-mono font-semibold"
          style={{
            top: "2px",
            right: "2px",
            fontSize: "9px",
            lineHeight: 1,
            color: vsHasFont
              ? isSvs ? "var(--diff-text)" : "var(--accent-blue-text)"
              : vsAliased ? "var(--aliased-text)" : "var(--gray-400)",
            backgroundColor: vsHasFont
              ? isSvs ? "var(--diff-bg)" : "var(--accent-blue-bg)"
              : vsAliased ? "var(--aliased-bg)" : "var(--gray-50)",
            borderRadius: "3px",
            padding: "1px 3px",
          }}
        >
          {vsLabel}
        </span>
      )}
      <span
        className={`flex-1 flex items-center leading-none ${
          isControl || isWhitespace ? "font-mono" : ""
        }`}
        style={{
          color:
            isControl || isWhitespace
              ? "var(--accent-blue-text)"
              : "var(--gray-900)",
          fontSize: isControl || isWhitespace ? "9px" : "18px",
          fontFamily: !(isControl || isWhitespace) ? "var(--font-cjk)" : undefined,
          paddingTop: "6px",
        }}
      >
        {displayChar}
      </span>
      <span
        className="font-mono tabular-nums"
        style={{ fontSize: "10px", color: labelColor, lineHeight: 1 }}
      >
        {cpLabel}
      </span>
    </button>
  );
}

/* ─── DetailGlyphPreview ─── */

function DetailGlyphPreview({
  cluster,
}: {
  cluster: GraphemeCluster;
}) {
  const cps = cluster.codePoints;
  const isVarSeq =
    cps.length === 2 &&
    ((cps[1].codePoint >= 0xe0100 && cps[1].codePoint <= 0xe01ef) ||
      (cps[1].codePoint >= 0xfe00 && cps[1].codePoint <= 0xfe0f));
  const baseChar = isVarSeq ? String.fromCodePoint(cps[0].codePoint) : null;

  const glyphFontStyle = {
    fontFamily: "var(--font-cjk)",
    fontSize: "clamp(72px, 12vw, 96px)",
    lineHeight: 1,
  } as const;

  // Vertical padding around the em-box so that typical combining marks
  // / accents have somewhere to overflow without jiggling the row
  // height between clusters. Keep it small — extreme stacks (Zalgo)
  // will still overflow visibly, which is the honest visualisation.
  const PAD_Y = "0.2em";

  // 1em × 1em dotted reference box, absolutely positioned at the top-left
  // of the line-box (after the wrapper's vertical padding). Visualises
  // the font's em-square — whatever extends past it is overflow
  // (combining marks, descenders, etc.).
  const emFrame = (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        top: PAD_Y,
        left: 0,
        width: "1em",
        height: "1em",
        boxSizing: "border-box",
        border: "1px dotted var(--gray-400)",
        pointerEvents: "none",
      }}
    />
  );

  // Wrap the rendered glyph so the em-frame and a separate advance-frame
  // can both sit on top of it. The advance-frame stretches to whatever
  // the wrapper's natural width is — that width equals the cluster's
  // actual advance (≈1em for CJK, <1em for proportional Latin glyphs,
  // ~2em for emoji). Em-frame is fixed at 1em, so the two frames
  // coincide for full-width CJK and reveal advance differences for
  // anything else.
  const wrapGlyph = (content: React.ReactNode) => (
    <span
      style={{
        ...glyphFontStyle,
        display: "inline-block",
        position: "relative",
        paddingTop: PAD_Y,
        paddingBottom: PAD_Y,
      }}
    >
      {emFrame}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: PAD_Y,
          left: 0,
          right: 0,
          height: "1em",
          boxSizing: "border-box",
          border: "1px dashed var(--gray-500)",
          pointerEvents: "none",
        }}
      />
      <span
        style={{
          display: "inline-block",
          height: "1em",
          lineHeight: 1,
        }}
      >
        {content}
      </span>
    </span>
  );

  // Skip the SVG mask comparison for emoji presentation selectors
  // (VS15 = U+FE0E text style, VS16 = U+FE0F emoji style). Those VSes
  // toggle colour vs monochrome rendering, which means the bare base
  // and the variant draw entirely different glyph shapes (filled
  // colour emoji vs outline). The diff/common visualisation makes no
  // sense in that case — anti-aliased edge mismatches show up as
  // spurious blue/red flicker even where the two glyphs visually
  // match. Just show the static variant glyph.
  const isEmojiVs =
    isVarSeq && (cps[1].codePoint === 0xfe0e || cps[1].codePoint === 0xfe0f);

  if (!isVarSeq || !baseChar || isEmojiVs) {
    return wrapGlyph(cluster.grapheme);
  }

  const baseCp = cps[0].codePoint;
  const vsCp = cps[1].codePoint;
  const isSvs = vsCp >= 0xfe00 && vsCp <= 0xfe0f;
  const vsLabel = isSvs
    ? `VS${vsCp - 0xfe00 + 1}`
    : `VS${vsCp - 0xe0100 + 17}`;
  const vsHasFont = hasFontGlyph(baseCp, vsCp);
  const vsAliased = !vsHasFont && isAliasedToDefault(baseCp, vsCp);
  const badgeColor = vsHasFont
    ? isSvs
      ? "var(--diff-text)"
      : "var(--accent-blue-text)"
    : vsAliased
    ? "var(--aliased-text)"
    : "var(--gray-400)";
  const badgeBg = vsHasFont
    ? isSvs
      ? "var(--diff-bg)"
      : "var(--accent-blue-bg)"
    : vsAliased
    ? "var(--aliased-bg)"
    : "var(--gray-50)";

  // Animation classes are defined in globals.css. Using classes (rather
  // than inline style) lets @media print override them with !important
  // so all three colour layers stay visible on paper.
  const maskId = `vfm-${baseCp.toString(16)}-${vsCp.toString(16)}`;

  const badgeStyle = {
    fontSize: "10px",
    lineHeight: 1,
    color: badgeColor,
    backgroundColor: badgeBg,
    borderRadius: "4px",
    padding: "2px 5px",
  } as const;
  const renderBadge = (fadingIn = false) => (
    <span
      className={`font-mono font-semibold ${fadingIn ? "variant-fade-in" : ""}`}
      style={badgeStyle}
    >
      {vsLabel}
    </span>
  );

  return (
    <span
      className="inline-flex items-end"
      style={{ gap: "1.25em" }}
    >
      {/* Left: the variant as actually rendered (static reference). */}
      <span
        className="inline-flex flex-col gap-1"
        style={{
          ...glyphFontStyle,
          width: "1em",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        {renderBadge(false)}
        <span style={{ alignSelf: "flex-start" }}>
          {wrapGlyph(cluster.grapheme)}
        </span>
      </span>
      {/* Right: an SVG that does the comparison. Two alternating layers
          (base in blue / variant in red) crossfade underneath; on top,
          the variant is rendered through a mask cut from the base glyph
          so only the common (intersection) pixels show in the default
          colour. The intersection layer is static, so the shared
          strokes never blink — only the diff pulses. */}
      <span
        className="inline-flex flex-col gap-1"
        aria-hidden="true"
        style={{
          ...glyphFontStyle,
          width: "1em",
          alignItems: "flex-end",
          flexShrink: 0,
        }}
      >
        {renderBadge(true)}
        {/* Match the wrapGlyph wrapper's vertical padding so this SVG's
            em-frame and the left-side HTML em-frame land at the same
            vertical position when the outer flex aligns by baseline. */}
        <span
          style={{
            display: "inline-block",
            paddingTop: PAD_Y,
            paddingBottom: PAD_Y,
            alignSelf: "flex-start",
          }}
        >
        <svg
          width="1em"
          height="1em"
          viewBox="0 0 1024 1024"
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: "block",
            overflow: "visible",
            color: "var(--gray-900)",
          }}
        >
          <defs>
            <mask id={maskId}>
              <rect width="1024" height="1024" fill="black" />
              <text
                x="512"
                y="880"
                textAnchor="middle"
                fontSize="1024"
                fontFamily="var(--font-cjk)"
                fill="white"
                textLength="1024"
                lengthAdjust="spacingAndGlyphs"
              >
                {baseChar}
              </text>
            </mask>
          </defs>
          {/* Em-square reference frame */}
          <rect
            x="0"
            y="0"
            width="1024"
            height="1024"
            fill="none"
            stroke="var(--gray-400)"
            strokeWidth="2"
            strokeDasharray="8 8"
          />
          {/* Alternating base (blue), fades out during variant phase */}
          <text
            x="512"
            y="880"
            textAnchor="middle"
            fontSize="1024"
            fontFamily="var(--font-cjk)"
            fill="var(--variant-base-color)"
            className="variant-fade-out"
          >
            {baseChar}
          </text>
          {/* Alternating variant in red, fades in during variant phase.
              The static common-parts overlay below paints intersection
              pixels in the default colour, so only variant-only strokes
              remain red. */}
          <text
            x="512"
            y="880"
            textAnchor="middle"
            fontSize="1024"
            fontFamily="var(--font-cjk)"
            fill="var(--variant-only-color)"
            className="variant-fade-in"
          >
            {cluster.grapheme}
          </text>
          {/* Common-parts overlay: variant masked through the base shape,
              so only pixels that exist in both glyphs are drawn — always
              visible in the default text colour. */}
          <text
            x="512"
            y="880"
            textAnchor="middle"
            fontSize="1024"
            fontFamily="var(--font-cjk)"
            fill="currentColor"
            mask={`url(#${maskId})`}
          >
            {cluster.grapheme}
          </text>
        </svg>
        </span>
      </span>
    </span>
  );
}

/* ─── DetailPanel ─── */

function DetailPanel({
  t,
  cluster,
  onClose,
  mappingVariant,
  onSetInput,
}: {
  t: Messages;
  cluster: GraphemeCluster;
  onClose?: () => void;
  mappingVariant: MappingVariant;
  onSetInput?: (text: string) => void;
}) {
  const utf8ByteCount = cluster.codePoints.reduce(
    (sum, cp) => sum + cp.utf8Bytes.length,
    0
  );
  const utf16UnitCount = cluster.codePoints.reduce(
    (sum, cp) => sum + cp.utf16Units.length,
    0
  );

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{
        boxShadow:
          "0px 0px 0px 1px var(--shadow-border), 0px 4px 8px var(--shadow-subtle)",
      }}
    >
      <div
        className="flex items-center justify-between gap-2 px-3 sm:px-5 py-2.5 sm:py-3"
        style={{
          backgroundColor: "var(--gray-50)",
          borderBottom: "1px solid var(--gray-100)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-wrap">
          <DetailGlyphPreview cluster={cluster} />

          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium gap-2"
            style={{
              backgroundColor: "var(--accent-blue-bg)",
              color: "var(--accent-blue-text)",
            }}
          >
            <StatSegment label={t.statCodePoint} value={cluster.codePoints.length} />
            <span style={{ opacity: 0.4 }}>·</span>
            <StatSegment label={t.statUtf16} value={utf16UnitCount} />
            <span style={{ opacity: 0.4 }}>·</span>
            <StatSegment label={t.statUtf8} value={utf8ByteCount} />
          </span>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs transition-colors cursor-pointer flex-shrink-0"
            style={{ color: "var(--gray-500)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "var(--gray-100)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            {t.close}
          </button>
        )}
      </div>

      {/* Code point details */}
      <div className="overflow-x-auto">
        <AllCodePointsTable t={t} codePoints={cluster.codePoints} mappingVariant={mappingVariant} onSetInput={onSetInput} />
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function BytePills({ bytes }: { bytes: number[] }) {
  return (
    <span className="inline-flex gap-1">
      {bytes.map((b, i) => (
        <code
          key={i}
          className="rounded px-1 py-0.5"
          style={{ backgroundColor: "var(--gray-50)", fontSize: "11px" }}
        >
          {formatByte(b)}
        </code>
      ))}
    </span>
  );
}

function AllCodePointsTable({
  t,
  codePoints,
  mappingVariant,
  onSetInput,
}: {
  t: Messages;
  codePoints: CodePointInfo[];
  mappingVariant: MappingVariant;
  onSetInput?: (text: string) => void;
}) {
  const langLabelMap: Record<LanguageGroup, string> = {
    auto: "",
    ja: t.langJapanese,
    "zh-Hant": t.langChineseTraditional,
    "zh-Hans": t.langChineseSimplified,
    ko: t.langKorean,
    "Latn-WE": t.langWestern,
    "Latn-CE": t.langCentralEuropean,
    "Latn-Baltic": t.langBaltic,
    Cyrl: t.langCyrillic,
    el: t.langGreek,
    tr: t.langTurkish,
    he: t.langHebrew,
    ar: t.langArabic,
    vi: t.langVietnamese,
    th: t.langThai,
  };

  type Row = { kind: "data"; label: string; cells: React.ReactNode[] }
    | { kind: "separator"; label: string; colSpan: number };

  const rows: Row[] = [
    {
      kind: "data",
      label: t.thCodePoint,
      cells: codePoints.map((cp) => {
        const isVisible =
          cp.codePoint > 0x20 &&
          cp.codePoint !== 0x7f &&
          !(cp.codePoint >= 0x80 && cp.codePoint <= 0x9f) &&
          cp.codePoint !== 0xa0 &&
          cp.codePoint !== 0x3000;
        return (
          <span key={cp.hex} className="inline-flex items-center gap-2">
            {isVisible && (
              <span style={{ fontSize: "16px", fontFamily: "var(--font-cjk)" }}>{cp.char}</span>
            )}
            <span className="font-mono font-medium" style={{ color: "var(--accent-blue)" }}>
              {cp.hex}
            </span>
          </span>
        );
      }),
    },
    {
      kind: "data",
      label: t.thName,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ fontFamily: "var(--font-sans)" }}>{cp.name}</span>
      )),
    },
  ];

  // Conditionally add Note row if any code point has an annotation
  const annotationKeys = codePoints.map((cp) => getAnnotationKey(cp.codePoint));
  if (annotationKeys.some((k) => k !== null)) {
    rows.push({
      kind: "data",
      label: t.thNote,
      cells: codePoints.map((cp, i) => {
        const key = annotationKeys[i];
        if (!key) return <span key={i} style={{ color: "var(--gray-300)" }}>—</span>;
        const text = t.annotations[key];
        const lines = text.split("\n");
        return (
          <span key={i} className="flex flex-col" style={{ fontFamily: "var(--font-sans)", fontSize: "11px" }}>
            <span style={{ color: "var(--gray-700)", fontWeight: 500 }}>{lines[0]}</span>
            {lines[1] && <span style={{ color: "var(--gray-400)" }}>{lines[1]}</span>}
          </span>
        );
      }),
    });
  }

  rows.push(
    {
      kind: "data",
      label: t.thCategory,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ color: "var(--gray-500)", fontFamily: "var(--font-sans)" }}>{cp.category}</span>
      )),
    },
    {
      kind: "data",
      label: t.thBlock,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ color: "var(--gray-500)", fontFamily: "var(--font-sans)" }}>{cp.blockName}</span>
      )),
    },
  );

  // IRG Source row — only if any code point has IRG data
  const irgFlags = codePoints.map((cp) => getCjkIrgFlags(cp.codePoint));
  if (irgFlags.some((f) => f > 0)) {
    const IRG_LABELS: [number, string][] = [
      [1, "🇯🇵"],
      [2, "🇨🇳"],
      [4, "🇹🇼"],
      [8, "🇰🇷"],
    ];
    rows.push({
      kind: "data",
      label: t.thIrgSource,
      cells: codePoints.map((cp, i) => {
        const f = irgFlags[i];
        if (f === 0) return <span key={i} style={{ color: "var(--gray-300)" }}>—</span>;
        const labels = IRG_LABELS.filter(([bit]) => f & bit).map(([, label]) => label);
        return (
          <span key={i} className="inline-flex gap-1" style={{ fontFamily: "var(--font-sans)", fontSize: "13px" }}>
            {labels.join(" ")}
          </span>
        );
      }),
    });
  }

  // IVS row — only if any code point has 2+ IVS variants
  // (1 IVS = default glyph registration only, no visual difference)
  const ivsCounts = codePoints.map((cp) => getIvsCount(cp.codePoint));
  const ivsBreakdown = codePoints.map((cp) => {
    const variants = getIvsVariants(cp.codePoint);
    let distinct = 0;
    let aliased = 0;
    for (const vs of variants) {
      if (hasFontGlyph(cp.codePoint, vs)) distinct++;
      else if (isAliasedToDefault(cp.codePoint, vs)) aliased++;
    }
    return { distinct, aliased };
  });
  if (ivsCounts.some((n) => n >= 2)) {
    rows.push({
      kind: "data",
      label: t.thIvs,
      cells: codePoints.map((cp, i) => {
        const count = ivsCounts[i];
        const { distinct, aliased } = ivsBreakdown[i];
        if (count < 2) return <span key={i} style={{ color: "var(--gray-300)" }}>—</span>;
        return (
          <span key={i} className="inline-flex items-center gap-1.5 flex-wrap" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="text-xs" style={{ color: distinct > 0 ? "var(--gray-600)" : "var(--gray-400)" }}>{t.ivsVariants(count, distinct, aliased)}</span>
            {onSetInput && (
              <button
                type="button"
                onClick={() => {
                  const base = String.fromCodePoint(cp.codePoint);
                  const variants = getIvsVariants(cp.codePoint);
                  const text = base + variants.map((vs) => base + String.fromCodePoint(vs)).join("");
                  onSetInput(text);
                }}
                className="text-xs rounded-full px-2 py-0.5 cursor-pointer transition-colors"
                style={{
                  color: "var(--accent-blue-text)",
                  backgroundColor: "var(--accent-blue-bg)",
                  boxShadow: "0px 0px 0px 1px var(--accent-blue)",
                }}
              >
                {t.vsShowAll}
              </button>
            )}
          </span>
        );
      }),
    });
  }

  // SVS row — only if any code point has SVS variants
  const svsCounts = codePoints.map((cp) => getSvsCount(cp.codePoint));
  if (svsCounts.some((n) => n > 0)) {
    rows.push({
      kind: "data",
      label: t.thSvs,
      cells: codePoints.map((cp, i) => {
        const count = svsCounts[i];
        if (count === 0) return <span key={i} style={{ color: "var(--gray-300)" }}>—</span>;
        // Categorise SVS variants: distinct-glyph vs aliased-to-default
        const variants = getSvsVariants(cp.codePoint);
        let distinct = 0;
        let aliased = 0;
        for (const vs of variants) {
          if (hasFontGlyph(cp.codePoint, vs)) distinct++;
          else if (isAliasedToDefault(cp.codePoint, vs)) aliased++;
        }
        return (
          <span key={i} className="inline-flex items-center gap-1.5 flex-wrap" style={{ fontFamily: "var(--font-sans)" }}>
            <span className="text-xs" style={{ color: distinct > 0 ? "var(--gray-600)" : "var(--gray-400)" }}>{t.svsVariants(count, distinct, aliased)}</span>
            {onSetInput && (
              <button
                type="button"
                onClick={() => {
                  const base = String.fromCodePoint(cp.codePoint);
                  const variants = getSvsVariants(cp.codePoint);
                  const text = base + variants.map((vs) => base + String.fromCodePoint(vs)).join("");
                  onSetInput(text);
                }}
                className="text-xs rounded-full px-2 py-0.5 cursor-pointer transition-colors"
                style={{
                  color: "var(--diff-text)",
                  backgroundColor: "var(--diff-bg)",
                  boxShadow: "0px 0px 0px 1px var(--diff-border)",
                }}
              >
                {t.vsShowAll}
              </button>
            )}
          </span>
        );
      }),
    });
  }

  rows.push(
    {
      kind: "data",
      label: t.thUtf8,
      cells: codePoints.map((cp, i) => <BytePills key={i} bytes={cp.utf8Bytes} />),
    },
    {
      kind: "data",
      label: t.thUtf16,
      cells: codePoints.map((cp, i) => {
        const isSurrogatePair = cp.utf16Units.length === 2;
        return (
          <span
            key={i}
            className="inline-flex gap-1 items-start"
            title={isSurrogatePair ? t.surrogatePairLabel : undefined}
          >
            {cp.utf16Units.map((u, j) => (
              <span key={j} className="inline-flex flex-col items-center gap-0.5">
                <code
                  className="rounded px-1 py-0.5"
                  style={{ backgroundColor: "var(--gray-50)", fontSize: "11px" }}
                >
                  {formatUtf16(u)}
                </code>
                {isSurrogatePair && (
                  <span style={{ fontSize: "9px", color: "var(--gray-500)" }}>
                    {j === 0 ? t.surrogateHigh : t.surrogateLow}
                  </span>
                )}
              </span>
            ))}
          </span>
        );
      }),
    },
  );

  // Language-specific sections (auto-detected)
  const activeGroups = getAutoGroups(codePoints.map((cp) => cp.codePoint), mappingVariant);

  for (const group of activeGroups) {
    const groupEncodings = LANGUAGE_ENCODINGS[group];
    if (!groupEncodings || groupEncodings.length === 0) continue;
    const groupLabel = langLabelMap[group];

    rows.push({
      kind: "separator",
      label: groupLabel,
      colSpan: codePoints.length + 1,
    });

    // JIS level row — only for Japanese
    if (group === "ja") {
      rows.push({
        kind: "data",
        label: t.thJisLevel,
        cells: codePoints.map((cp, i) => {
          const level = getJisLevel(cp.codePoint);
          const kuten = getJisKuten(cp.codePoint, mappingVariant);
          if (level === null && kuten === null) {
            return <span key={i} style={{ color: "var(--gray-300)" }}>—</span>;
          }
          const labels: Record<number, string> = {
            1: "第一水準",
            2: "第二水準",
            3: "第三水準",
            4: "第四水準",
          };
          return (
            <span key={i} className="inline-flex items-center gap-2" style={{ fontFamily: "var(--font-sans)" }}>
              {level !== null && (
                <span style={{ color: "var(--gray-500)" }}>{labels[level]}</span>
              )}
              {kuten && (
                <code
                  className="rounded px-1 py-0.5"
                  style={{ backgroundColor: "var(--gray-50)", color: "var(--gray-600)", fontSize: "11px" }}
                >
                  {formatJisKuten(kuten)}
                </code>
              )}
            </span>
          );
        }),
      });
    }

    // Encoding byte rows
    for (const enc of groupEncodings) {
      rows.push({
        kind: "data",
        label: enc.label,
        cells: codePoints.map((cp, i) => {
          const result = getLegacyEncoding(cp.codePoint, enc.value, mappingVariant);
          return result.encodable && result.bytes ? (
            <BytePills key={i} bytes={result.bytes} />
          ) : (
            <span key={i} style={{ color: "var(--unencodable-text)" }}>—</span>
          );
        }),
      });
    }
  }

  // Script detection: show script label when no encoding groups matched
  if (activeGroups.every((g) => LANGUAGE_ENCODINGS[g].length === 0)) {
    const script = detectScript(codePoints.map((cp) => cp.codePoint));
    if (script) {
      rows.push({
        kind: "separator",
        label: script,
        colSpan: codePoints.length + 1,
      });
    }
  }

  return (
    <table
      className="w-full text-sm"
      style={{ borderCollapse: "separate", borderSpacing: 0 }}
    >
      <tbody>
        {rows.map((row, i) => {
          if (row.kind === "separator") {
            return (
              <tr key={`sep-${row.label}`}>
                <td
                  colSpan={row.colSpan}
                  className="px-3 sm:px-4 pt-3 pb-1 text-xs font-semibold uppercase"
                  style={{
                    color: "var(--gray-500)",
                    letterSpacing: "0.04em",
                    borderTop: "2px solid var(--gray-200)",
                    backgroundColor: "var(--background)",
                  }}
                >
                  {row.label}
                </td>
              </tr>
            );
          }
          return (
          <tr
            key={row.label}
            style={{
              borderBottom:
                i < rows.length - 1 && rows[i + 1].kind !== "separator"
                  ? "1px solid var(--gray-100)"
                  : "none",
            }}
          >
            <td
              className="px-3 sm:px-4 py-1.5 text-xs font-medium whitespace-nowrap sticky left-0 z-10"
              style={{
                color: "var(--gray-500)",
                width: "5.5rem",
                minWidth: "5.5rem",
                backgroundColor: "var(--background)",
                boxShadow: "1px 0 0 var(--gray-100)",
              }}
            >
              {row.label}
            </td>
            {row.cells.map((cell, j) => (
              <td
                key={j}
                className="px-3 sm:px-4 py-1.5 font-mono text-xs whitespace-nowrap"
                style={{ color: "var(--gray-600)", minWidth: "5rem" }}
              >
                {cell}
              </td>
            ))}
          </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function StatSegment({ label, value }: { label: string; value: number }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-mono font-semibold tabular-nums">{value}</span>
      <span className="opacity-70" style={{ fontSize: "11px" }}>
        {label}
      </span>
    </span>
  );
}

function SampleMenu({
  t,
  onSelect,
}: {
  t: Messages;
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs cursor-pointer transition-colors"
        style={{ color: "var(--accent-blue)" }}
      >
        {t.samples} ▾
      </button>
      {open && (
        <div
          className="absolute left-0 top-full mt-1 z-20 rounded-lg py-1 overflow-hidden max-w-[calc(100vw-2rem)]"
          style={{
            backgroundColor: "var(--background)",
            boxShadow:
              "0px 0px 0px 1px var(--shadow-border), 0px 8px 16px rgba(0,0,0,0.12)",
            minWidth: "min(20rem, calc(100vw - 2rem))",
          }}
        >
          {t.sampleList.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(sample.value);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs cursor-pointer transition-colors"
              style={{ color: "var(--gray-600)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--gray-50)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "transparent")
              }
            >
              {sample.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  align,
  width,
}: {
  children: React.ReactNode;
  align?: "center" | "left";
  width?: string;
}) {
  return (
    <th
      className="px-5 py-2 text-xs font-medium whitespace-nowrap"
      style={{
        textAlign: align || "left",
        width,
        color: "var(--gray-500)",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </th>
  );
}

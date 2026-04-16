"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { analyzeString, formatByte, formatUtf16 } from "@/lib/unicode";
import { useMessages } from "@/lib/i18n";
import { getLegacyEncoding, LANGUAGE_ENCODINGS } from "@/lib/encodings";
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
  const [languageGroup, setLanguageGroup] = useState<LanguageGroup>("none");
  const [mappingVariant, setMappingVariant] = useState<MappingVariant>("whatwg");
  const [selected, setSelected] = useState<{
    section: string;
    index: number;
  } | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showNormalization, setShowNormalization] = useState(false);

  // Read URL param on mount (client only)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get("text");
    if (text !== null) setRawInput(text);
  }, []);

  // Sync rawInput to URL query parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    if (rawInput) {
      url.searchParams.set("text", rawInput);
    } else {
      url.searchParams.delete("text");
    }
    window.history.replaceState(null, "", url.toString());
  }, [rawInput]);

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
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <select
            value={languageGroup}
            onChange={(e) => {
              setLanguageGroup(e.target.value as LanguageGroup);
              setSelected(null);
            }}
            className="rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors appearance-none"
            style={{
              boxShadow: "0px 0px 0px 1px var(--shadow-border)",
              color: "var(--gray-600)",
              backgroundColor: "transparent",
              paddingRight: "1.5rem",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 0.5rem center",
            }}
          >
            <option value="none">{t.langNone}</option>
            <option value="japanese">{t.langJapanese}</option>
            <option value="chinese-traditional">{t.langChineseTraditional}</option>
            <option value="chinese-simplified">{t.langChineseSimplified}</option>
            <option value="korean">{t.langKorean}</option>
            <option value="western">{t.langWestern}</option>
            <option value="central-european">{t.langCentralEuropean}</option>
            <option value="baltic">{t.langBaltic}</option>
            <option value="cyrillic">{t.langCyrillic}</option>
            <option value="greek">{t.langGreek}</option>
            <option value="turkish">{t.langTurkish}</option>
            <option value="hebrew">{t.langHebrew}</option>
            <option value="arabic">{t.langArabic}</option>
            <option value="vietnamese">{t.langVietnamese}</option>
            <option value="thai">{t.langThai}</option>
          </select>
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
      </div>
      <textarea
        value={rawInput}
        onChange={(e) => {
          setRawInput(e.target.value);
          setSelected(null);
        }}
        placeholder={t.inputPlaceholder}
        className="w-full rounded-lg px-2.5 py-2 sm:px-4 sm:py-3 text-base sm:text-base font-mono leading-relaxed resize-y focus:outline-none transition-shadow"
        style={{
          backgroundColor: "var(--input-bg)",
          color: "var(--gray-900)",
          border: "1.5px solid var(--input-border)",
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
              languageGroup={languageGroup}
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
  languageGroup,
  mappingVariant,
}: {
  t: Messages;
  sectionKey: string;
  label: string;
  desc: string;
  data: AnalyzedString;
  identical: boolean;
  languageGroup: LanguageGroup;
  mappingVariant: MappingVariant;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  onDeselect?: () => void;
  onCopyToInput?: () => void;
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
          languageGroup={languageGroup}
          mappingVariant={mappingVariant}
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

  let bgColor = "transparent";
  let shadowStyle = "0px 0px 0px 1px var(--shadow-border)";

  if (isSelected) {
    bgColor = "var(--accent-blue-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--accent-blue)";
  } else if (isDiff) {
    bgColor = "var(--diff-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--diff-border)";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center rounded transition-all cursor-pointer"
      style={{
        backgroundColor: bgColor,
        boxShadow: shadowStyle,
        width: "2.5rem",
        height: "2.5rem",
      }}
    >
      <span
        className={`leading-none ${
          isControl || isWhitespace ? "font-mono" : ""
        }`}
        style={{
          color:
            isControl || isWhitespace
              ? "var(--accent-blue-text)"
              : "var(--gray-900)",
          fontSize: isControl || isWhitespace ? "7px" : "14px",
        }}
      >
        {displayChar}
      </span>
    </button>
  );
}

/* ─── DetailPanel ─── */

function DetailPanel({
  t,
  cluster,
  onClose,
  languageGroup,
  mappingVariant,
}: {
  t: Messages;
  cluster: GraphemeCluster;
  onClose?: () => void;
  languageGroup: LanguageGroup;
  mappingVariant: MappingVariant;
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
          <span className="text-xl sm:text-2xl">{cluster.grapheme}</span>
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
        <AllCodePointsTable t={t} codePoints={cluster.codePoints} languageGroup={languageGroup} mappingVariant={mappingVariant} />
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
  languageGroup,
  mappingVariant,
}: {
  t: Messages;
  codePoints: CodePointInfo[];
  languageGroup: LanguageGroup;
  mappingVariant: MappingVariant;
}) {
  const encodings = LANGUAGE_ENCODINGS[languageGroup];
  const langLabelMap: Record<LanguageGroup, string> = {
    none: "",
    japanese: t.langJapanese,
    "chinese-traditional": t.langChineseTraditional,
    "chinese-simplified": t.langChineseSimplified,
    korean: t.langKorean,
    western: t.langWestern,
    "central-european": t.langCentralEuropean,
    baltic: t.langBaltic,
    cyrillic: t.langCyrillic,
    greek: t.langGreek,
    turkish: t.langTurkish,
    hebrew: t.langHebrew,
    arabic: t.langArabic,
    vietnamese: t.langVietnamese,
    thai: t.langThai,
  };
  const langLabel = langLabelMap[languageGroup];

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
              <span style={{ fontSize: "16px" }}>{cp.char}</span>
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

  // Language-specific section
  if (languageGroup !== "none") {
    rows.push({
      kind: "separator",
      label: langLabel,
      colSpan: codePoints.length + 1,
    });

    // JIS level row — only for Japanese
    if (languageGroup === "japanese") {
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
    for (const enc of encodings) {
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
      <span className="opacity-70" style={{ fontSize: "10px" }}>
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

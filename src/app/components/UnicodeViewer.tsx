"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { analyzeString, formatByte, formatUtf16 } from "@/lib/unicode";
import { useMessages } from "@/lib/i18n";
import { getLegacyEncoding, getLegacyByteCount, ENCODING_OPTIONS, ALL_LEGACY_ENCODINGS } from "@/lib/encodings";
import type { GraphemeCluster, CodePointInfo } from "@/lib/unicode";
import type { Messages } from "@/lib/i18n";
import type { EncodingMode, LegacyEncoding } from "@/lib/encodings";

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
  const [encodingMode, setEncodingMode] = useState<EncodingMode>("unicode");
  const [selected, setSelected] = useState<{
    section: string;
    index: number;
  } | null>(null);

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
    return result;
  }, [input, inputClusters, t]);

  return (
    <div className="w-full">
      {/* Input Area */}
      <div className="flex items-center gap-3 mb-2">
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
      </div>
      <textarea
        value={rawInput}
        onChange={(e) => {
          setRawInput(e.target.value);
          setSelected(null);
        }}
        placeholder={t.inputPlaceholder}
        className="w-full rounded-lg px-5 py-4 text-lg font-mono leading-relaxed resize-y focus:outline-none transition-shadow"
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
        rows={3}
      />

      {/* Options */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={convertCP}
            onChange={(e) => {
              setConvertCP(e.target.checked);
              setSelected(null);
            }}
            className="accent-[var(--accent-blue)]"
          />
          <span className="text-xs" style={{ color: "var(--gray-600)" }}>
            {t.convertCodePoints}
          </span>
        </label>
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={convertEsc}
            onChange={(e) => {
              setConvertEsc(e.target.checked);
              setSelected(null);
            }}
            className="accent-[var(--accent-blue)]"
          />
          <span className="text-xs" style={{ color: "var(--gray-600)" }}>
            {t.convertEscape}
          </span>
        </label>
      </div>

      {/* Encoding selector */}
      <div className="mt-3 flex items-center gap-2">
        <span
          className="text-xs font-medium"
          style={{ color: "var(--gray-500)" }}
        >
          {t.encoding}
        </span>
        <select
          value={encodingMode}
          onChange={(e) => {
            setEncodingMode(e.target.value as EncodingMode);
            setSelected(null);
          }}
          className="text-xs rounded-md px-2 py-1 cursor-pointer"
          style={{
            backgroundColor: "var(--input-bg)",
            color: "var(--gray-900)",
            border: "1.5px solid var(--input-border)",
          }}
        >
          {ENCODING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* All sections */}
      <div className="mt-8 flex flex-col gap-8">
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
              encodingMode={encodingMode}
              selectedIndex={
                selected?.section === key ? selected.index : null
              }
              onSelect={(i) =>
                setSelected(
                  selected?.section === key && selected.index === i
                    ? null
                    : { section: key, index: i }
                )
              }
              onDeselect={() => setSelected(null)}
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
    </div>
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
  encodingMode,
}: {
  t: Messages;
  sectionKey: string;
  label: string;
  desc: string;
  data: AnalyzedString;
  identical: boolean;
  encodingMode: EncodingMode;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  onDeselect: () => void;
  onCopyToInput?: () => void;
}) {
  const utf8Size = new Blob([data.text]).size;
  const totalCodePoints = data.clusters.reduce(
    (sum, c) => sum + c.codePoints.length,
    0
  );
  const allCPs = data.clusters.flatMap((c) => c.codePoints.map((p) => p.codePoint));
  const isLegacy = encodingMode !== "unicode";
  const legacyStats = isLegacy
    ? getLegacyByteCount(allCPs, encodingMode as LegacyEncoding)
    : null;
  const selectedCluster =
    selectedIndex !== null ? data.clusters[selectedIndex] : null;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        <span
          className="text-sm font-semibold font-mono"
          style={{ color: "var(--gray-900)" }}
        >
          {label}
        </span>
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
        <div className="flex flex-wrap gap-2 ml-auto">
          <StatPill label={t.codePoints} value={totalCodePoints} />
          {isLegacy && legacyStats ? (
            <>
              <StatPill
                label={t.encBytes(
                  ENCODING_OPTIONS.find((o) => o.value === encodingMode)?.label ?? ""
                )}
                value={legacyStats.total}
              />
              {legacyStats.unencodable > 0 && (
                <StatPill
                  label={t.nUnencodable(legacyStats.unencodable)}
                  value={legacyStats.unencodable}
                  warn
                />
              )}
            </>
          ) : (
            <StatPill label={t.utf8Bytes} value={utf8Size} />
          )}
        </div>
      </div>

      {/* Grid */}
      {data.clusters.length > 0 && (() => {
        const maxCPs = Math.max(...data.clusters.map(c => c.codePoints.length));
        return (
          <div className="flex flex-wrap gap-1">
            {data.clusters.map((cluster, i) => (
              <CharCell
                key={i}
                cluster={cluster}
                isSelected={selectedIndex === i}
                isDiff={data.diffMask[i]}
                maxCodePoints={maxCPs}
                encodingMode={encodingMode}
                onClick={() => onSelect(i)}
              />
            ))}
          </div>
        );
      })()}

      {/* Detail */}
      {selectedCluster && selectedIndex !== null && (
        <DetailPanel
          t={t}
          index={selectedIndex}
          cluster={selectedCluster}
          onClose={onDeselect}
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
  maxCodePoints,
  encodingMode,
  onClick,
}: {
  cluster: GraphemeCluster;
  isSelected: boolean;
  isDiff: boolean;
  maxCodePoints: number;
  encodingMode: EncodingMode;
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

  const isLegacy = encodingMode !== "unicode";

  // Check if any code point in this cluster is unencodable
  const unencodable =
    isLegacy &&
    cluster.codePoints.some(
      (cp) => !getLegacyEncoding(cp.codePoint, encodingMode as LegacyEncoding).encodable
    );

  // Build label lines
  const labelLines: string[] = isLegacy
    ? cluster.codePoints.map((cp) => {
        const result = getLegacyEncoding(cp.codePoint, encodingMode as LegacyEncoding);
        if (result.encodable && result.bytes) {
          return result.bytes.map((b) => formatByte(b)).join(" ");
        }
        return "—";
      })
    : cluster.codePoints.map((c) => c.hex);

  let bgColor = "transparent";
  let shadowStyle = "0px 0px 0px 1px var(--shadow-border)";
  let labelColor = "var(--gray-400)";

  if (isSelected) {
    bgColor = "var(--accent-blue-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--accent-blue)";
    labelColor = "var(--accent-blue)";
  } else if (unencodable) {
    bgColor = "var(--unencodable-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--unencodable-border)";
    labelColor = "var(--unencodable-text)";
  } else if (isDiff) {
    bgColor = "var(--diff-bg)";
    shadowStyle = "0px 0px 0px 1.5px var(--diff-border)";
    labelColor = "var(--diff-text)";
  }

  // 18px char + 10px per code point line + 8px padding
  const cellHeight = 18 + maxCodePoints * 10 + 8;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded transition-all cursor-pointer relative"
      style={{
        backgroundColor: bgColor,
        boxShadow: shadowStyle,
        width: "3rem",
        height: `${cellHeight}px`,
      }}
    >
      {unencodable && (
        <span
          className="absolute font-bold"
          style={{
            color: "var(--unencodable-border)",
            fontSize: "24px",
            opacity: 0.3,
          }}
        >
          ✕
        </span>
      )}
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
      <span
        className="font-mono tabular-nums flex flex-col items-center"
        style={{
          fontSize: "7px",
          color: labelColor,
          lineHeight: 1.2,
          marginTop: "1px",
        }}
      >
        {labelLines.map((line, i) => (
          <span key={i}>{line}</span>
        ))}
      </span>
    </button>
  );
}

/* ─── DetailPanel ─── */

function DetailPanel({
  t,
  index,
  cluster,
  onClose,
}: {
  t: Messages;
  index: number;
  cluster: GraphemeCluster;
  onClose: () => void;
}) {
  const isMulti = cluster.codePoints.length > 1;

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{
        boxShadow:
          "0px 0px 0px 1px var(--shadow-border), 0px 4px 8px var(--shadow-subtle)",
      }}
    >
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{
          backgroundColor: "var(--gray-50)",
          borderBottom: "1px solid var(--gray-100)",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-mono"
            style={{ color: "var(--gray-400)" }}
          >
            #{index}
          </span>
          <span className="text-2xl">{cluster.grapheme}</span>
          {isMulti && (
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "var(--accent-blue-bg)",
                color: "var(--accent-blue-text)",
              }}
            >
              {t.nCodePoints(cluster.codePoints.length)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md px-2 py-1 text-xs transition-colors cursor-pointer"
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

      {/* Code point details */}
      <div className="overflow-x-auto">
        <AllCodePointsTable t={t} codePoints={cluster.codePoints} />
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
}: {
  t: Messages;
  codePoints: CodePointInfo[];
}) {
  const rows: { label: string; cells: React.ReactNode[] }[] = [
    {
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
      label: t.thName,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ fontFamily: "var(--font-sans)" }}>{cp.name}</span>
      )),
    },
    {
      label: t.thCategory,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ color: "var(--gray-500)", fontFamily: "var(--font-sans)" }}>{cp.category}</span>
      )),
    },
    {
      label: t.thBlock,
      cells: codePoints.map((cp, i) => (
        <span key={i} style={{ color: "var(--gray-500)", fontFamily: "var(--font-sans)" }}>{cp.blockName}</span>
      )),
    },
    {
      label: t.thUtf8,
      cells: codePoints.map((cp, i) => <BytePills key={i} bytes={cp.utf8Bytes} />),
    },
    {
      label: t.thUtf16,
      cells: codePoints.map((cp, i) => (
        <span key={i} className="inline-flex gap-1">
          {cp.utf16Units.map((u, j) => (
            <code
              key={j}
              className="rounded px-1 py-0.5"
              style={{ backgroundColor: "var(--gray-50)", fontSize: "11px" }}
            >
              {formatUtf16(u)}
            </code>
          ))}
        </span>
      )),
    },
    ...ALL_LEGACY_ENCODINGS.map((enc) => ({
      label: enc.label,
      cells: codePoints.map((cp, i) => {
        const result = getLegacyEncoding(cp.codePoint, enc.value);
        return result.encodable && result.bytes ? (
          <BytePills key={i} bytes={result.bytes} />
        ) : (
          <span key={i} style={{ color: "var(--unencodable-text)" }}>—</span>
        );
      }),
    })),
  ];

  return (
    <table
      className="w-full text-sm"
      style={{ borderCollapse: "separate", borderSpacing: 0 }}
    >
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.label}
            style={{
              borderBottom:
                i < rows.length - 1 ? "1px solid var(--gray-100)" : "none",
            }}
          >
            <td
              className="px-4 py-1.5 text-xs font-medium whitespace-nowrap sticky left-0 z-10"
              style={{
                color: "var(--gray-500)",
                width: "7.5rem",
                minWidth: "7.5rem",
                backgroundColor: "var(--background)",
              }}
            >
              {row.label}
            </td>
            {row.cells.map((cell, j) => (
              <td
                key={j}
                className="px-4 py-1.5 font-mono text-xs whitespace-nowrap"
                style={{ color: "var(--gray-600)", minWidth: "6rem" }}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatPill({
  label,
  value,
  warn,
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        boxShadow: warn
          ? "0px 0px 0px 1px var(--unencodable-border)"
          : "0px 0px 0px 1px var(--shadow-border)",
        color: warn ? "var(--unencodable-text)" : "var(--gray-600)",
        backgroundColor: warn ? "var(--unencodable-bg)" : "var(--background)",
      }}
    >
      <span
        className="font-mono font-semibold tabular-nums"
        style={{
          color: warn ? "var(--unencodable-text)" : "var(--gray-900)",
          fontSize: "12px",
        }}
      >
        {value}
      </span>
      {label}
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
          className="absolute left-0 top-full mt-1 z-20 rounded-lg py-1 overflow-hidden"
          style={{
            backgroundColor: "var(--background)",
            boxShadow:
              "0px 0px 0px 1px var(--shadow-border), 0px 8px 16px rgba(0,0,0,0.12)",
            minWidth: "20rem",
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

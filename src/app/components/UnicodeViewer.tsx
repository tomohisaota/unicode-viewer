"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { analyzeString, formatByte, formatUtf16 } from "@/lib/unicode";
import { useMessages } from "@/lib/i18n";
import type { GraphemeCluster, CodePointInfo } from "@/lib/unicode";
import type { Messages } from "@/lib/i18n";

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
      <label
        className="block text-xs font-medium mb-2"
        style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
      >
        {t.inputLabel}
      </label>
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
}: {
  t: Messages;
  sectionKey: string;
  label: string;
  desc: string;
  data: AnalyzedString;
  identical: boolean;
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
  const hasDiff = data.diffMask.some(Boolean);
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
          <StatPill label={t.utf8Bytes} value={utf8Size} />
        </div>
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

  const codePointHexes = cluster.codePoints.map((c) => c.hex);

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
      className="flex flex-col items-center justify-center rounded transition-all cursor-pointer"
      style={{
        backgroundColor: bgColor,
        boxShadow: shadowStyle,
        width: "3rem",
        height: "3rem",
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
      <span
        className="font-mono tabular-nums flex flex-col items-center"
        style={{
          fontSize: "7px",
          color: labelColor,
          lineHeight: 1.2,
          marginTop: "1px",
        }}
      >
        {codePointHexes.map((hex, i) => (
          <span key={i}>{hex}</span>
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

      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <Th width="6.5rem">{t.thCodePoint}</Th>
              <Th>{t.thName}</Th>
              <Th width="9rem">{t.thUtf8}</Th>
              <Th width="7.5rem">{t.thUtf16}</Th>
              <Th>{t.thCategory}</Th>
              <Th>{t.thBlock}</Th>
            </tr>
          </thead>
          <tbody>
            {cluster.codePoints.map((info, j) => (
              <CodePointRow
                key={j}
                info={info}
                isLast={j === cluster.codePoints.length - 1}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

function CodePointRow({
  info,
  isLast,
}: {
  info: CodePointInfo;
  isLast: boolean;
}) {
  return (
    <tr style={{ borderBottom: isLast ? "none" : "1px solid var(--gray-100)" }}>
      <td
        className="px-5 py-2.5 font-mono text-xs font-medium"
        style={{ color: "var(--accent-blue)" }}
      >
        {info.hex}
      </td>
      <td
        className="px-5 py-2.5 text-xs truncate max-w-56"
        style={{ color: "var(--gray-600)" }}
      >
        {info.name}
      </td>
      <td className="px-5 py-2.5 font-mono text-xs" style={{ color: "var(--gray-600)" }}>
        <span className="inline-flex gap-1">
          {info.utf8Bytes.map((b, i) => (
            <code
              key={i}
              className="rounded px-1 py-0.5"
              style={{ backgroundColor: "var(--gray-50)", fontSize: "11px" }}
            >
              {formatByte(b)}
            </code>
          ))}
        </span>
      </td>
      <td className="px-5 py-2.5 font-mono text-xs" style={{ color: "var(--gray-600)" }}>
        <span className="inline-flex gap-1">
          {info.utf16Units.map((u, i) => (
            <code
              key={i}
              className="rounded px-1 py-0.5"
              style={{ backgroundColor: "var(--gray-50)", fontSize: "11px" }}
            >
              {formatUtf16(u)}
            </code>
          ))}
        </span>
      </td>
      <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: "var(--gray-500)" }}>
        {info.category}
      </td>
      <td className="px-5 py-2.5 text-xs whitespace-nowrap" style={{ color: "var(--gray-500)" }}>
        {info.blockName}
      </td>
    </tr>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        color: "var(--gray-600)",
        backgroundColor: "var(--background)",
      }}
    >
      <span
        className="font-mono font-semibold tabular-nums"
        style={{ color: "var(--gray-900)", fontSize: "12px" }}
      >
        {value}
      </span>
      {label}
    </span>
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

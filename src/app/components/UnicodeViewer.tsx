"use client";

import { useState } from "react";
import { analyzeString, formatByte, formatUtf16 } from "@/lib/unicode";
import type { GraphemeCluster, CodePointInfo } from "@/lib/unicode";

export default function UnicodeViewer() {
  const [input, setInput] = useState("Hello! こんにちは 👍🏽");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const clusters = analyzeString(input);
  const utf8Size = new Blob([input]).size;
  const totalCodePoints = clusters.reduce(
    (sum, c) => sum + c.codePoints.length,
    0
  );

  const selected = selectedIndex !== null ? clusters[selectedIndex] : null;

  return (
    <div className="w-full">
      {/* Input Area */}
      <label
        className="block text-xs font-medium mb-2"
        style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
      >
        INPUT
      </label>
      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setSelectedIndex(null);
        }}
        placeholder="文字列を入力してください…"
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

      {/* Stats Bar */}
      <div className="mt-5 flex flex-wrap gap-3">
        <StatPill label="Characters" value={clusters.length} />
        <StatPill label="Code Points" value={totalCodePoints} />
        <StatPill label="UTF-8 Bytes" value={utf8Size} />
        <StatPill label="UTF-16 Units" value={input.length} />
      </div>

      {/* Character Grid */}
      {clusters.length > 0 && (
        <div
          className="mt-8 rounded-xl p-3 flex flex-wrap gap-2"
          style={{
            boxShadow:
              "0px 0px 0px 1px var(--shadow-border), 0px 2px 2px var(--shadow-subtle)",
          }}
        >
          {clusters.map((cluster, i) => (
            <CharCell
              key={i}
              index={i}
              cluster={cluster}
              isSelected={selectedIndex === i}
              onClick={() =>
                setSelectedIndex(selectedIndex === i ? null : i)
              }
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && selectedIndex !== null && (
        <DetailPanel
          index={selectedIndex}
          cluster={selected}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </div>
  );
}

function CharCell({
  index,
  cluster,
  isSelected,
  onClick,
}: {
  index: number;
  cluster: GraphemeCluster;
  isSelected: boolean;
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

  const codePointLabel =
    cluster.codePoints.length === 1
      ? cp0.hex
      : cluster.codePoints.map((c) => c.hex).join(" + ");

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all cursor-pointer"
      style={{
        backgroundColor: isSelected
          ? "var(--accent-blue-bg)"
          : "transparent",
        boxShadow: isSelected
          ? "0px 0px 0px 1.5px var(--accent-blue)"
          : "0px 0px 0px 1px var(--shadow-border)",
        minWidth: "4.5rem",
      }}
    >
      <span
        className={`text-xl leading-none ${
          isControl || isWhitespace ? "font-mono text-xs" : ""
        }`}
        style={{
          color:
            isControl || isWhitespace
              ? "var(--accent-blue-text)"
              : "var(--gray-900)",
          height: "1.75rem",
          display: "flex",
          alignItems: "center",
        }}
      >
        {displayChar}
      </span>
      <span
        className="font-mono tabular-nums"
        style={{
          fontSize: "10px",
          color: isSelected ? "var(--accent-blue)" : "var(--gray-400)",
          lineHeight: 1.2,
        }}
      >
        {codePointLabel}
      </span>
    </button>
  );
}

function DetailPanel({
  index,
  cluster,
  onClose,
}: {
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
      {/* Header */}
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
              {cluster.codePoints.length} code points
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
          Close
        </button>
      </div>

      {/* Code point details */}
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"
          style={{ borderCollapse: "separate", borderSpacing: 0 }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--gray-100)" }}>
              <Th width="6.5rem">Code Point</Th>
              <Th>Name</Th>
              <Th width="9rem">UTF-8</Th>
              <Th width="7.5rem">UTF-16</Th>
              <Th>Category</Th>
              <Th>Block</Th>
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

function CodePointRow({
  info,
  isLast,
}: {
  info: CodePointInfo;
  isLast: boolean;
}) {
  return (
    <tr
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--gray-100)",
      }}
    >
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
      <td
        className="px-5 py-2.5 font-mono text-xs"
        style={{ color: "var(--gray-600)" }}
      >
        <span className="inline-flex gap-1">
          {info.utf8Bytes.map((b, i) => (
            <code
              key={i}
              className="rounded px-1 py-0.5"
              style={{
                backgroundColor: "var(--gray-50)",
                fontSize: "11px",
              }}
            >
              {formatByte(b)}
            </code>
          ))}
        </span>
      </td>
      <td
        className="px-5 py-2.5 font-mono text-xs"
        style={{ color: "var(--gray-600)" }}
      >
        <span className="inline-flex gap-1">
          {info.utf16Units.map((u, i) => (
            <code
              key={i}
              className="rounded px-1 py-0.5"
              style={{
                backgroundColor: "var(--gray-50)",
                fontSize: "11px",
              }}
            >
              {formatUtf16(u)}
            </code>
          ))}
        </span>
      </td>
      <td
        className="px-5 py-2.5 text-xs whitespace-nowrap"
        style={{ color: "var(--gray-500)" }}
      >
        {info.category}
      </td>
      <td
        className="px-5 py-2.5 text-xs whitespace-nowrap"
        style={{ color: "var(--gray-500)" }}
      >
        {info.blockName}
      </td>
    </tr>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium"
      style={{
        boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        color: "var(--gray-600)",
        backgroundColor: "var(--background)",
      }}
    >
      <span
        className="font-mono font-semibold tabular-nums"
        style={{ color: "var(--gray-900)", fontSize: "13px" }}
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

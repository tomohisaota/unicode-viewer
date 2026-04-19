"use client";

export default function TryItButton({
  text,
  norm,
  map,
  cp,
  children,
}: {
  text: string;
  norm?: boolean;
  map?: "unicode.org";
  cp?: boolean;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  params.set("text", text);
  if (norm) params.set("norm", "1");
  if (map) params.set("map", map);
  if (cp === false) params.set("cp", "0");

  return (
    <a
      href={`/?${params.toString()}`}
      className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors no-underline"
      style={{
        color: "var(--accent-blue-text)",
        backgroundColor: "var(--accent-blue-bg)",
        boxShadow: "0px 0px 0px 1px var(--accent-blue)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      {children}
    </a>
  );
}

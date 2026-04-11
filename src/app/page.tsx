import UnicodeViewer from "./components/UnicodeViewer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <header
        className="sticky top-0 z-10 backdrop-blur-sm"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
          boxShadow: "0px 0px 0px 1px var(--shadow-border)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-xl font-semibold"
              style={{ letterSpacing: "-0.96px", color: "var(--gray-900)" }}
            >
              Unicode Viewer
            </h1>
          </div>
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
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h2
            className="text-4xl font-semibold"
            style={{ letterSpacing: "-2.4px", color: "var(--gray-900)" }}
          >
            文字列を解析する
          </h2>
          <p
            className="mt-3 text-lg"
            style={{ color: "var(--gray-600)", lineHeight: 1.8 }}
          >
            入力した文字列の各コードポイントを、エンコーディングやカテゴリとともに表示します
          </p>
        </div>
        <UnicodeViewer />
      </main>
    </div>
  );
}

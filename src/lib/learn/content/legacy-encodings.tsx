import TryItButton from "@/app/learn/components/TryItButton";
import LocaleSwitch from "@/app/learn/components/LocaleSwitch";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (<section><h2 className="text-lg sm:text-xl font-semibold mb-3" style={{ color: "var(--gray-900)", letterSpacing: "-0.5px" }}>{title}</h2><div className="text-sm sm:text-base" style={{ lineHeight: 1.85 }}>{children}</div></section>);
}
function C({ children }: { children: React.ReactNode }) {
  return <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--gray-50)", color: "var(--gray-900)" }}>{children}</code>;
}
function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (<div className="overflow-x-auto my-4"><table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}><thead><tr>{headers.map((h, i) => <th key={i} className="text-left px-3 py-2 text-xs font-semibold" style={{ color: "var(--gray-500)", borderBottom: "1px solid var(--gray-100)" }}>{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="px-3 py-2 font-mono" style={{ color: "var(--gray-700)", borderBottom: "1px solid var(--gray-100)" }}>{cell}</td>)}</tr>)}</tbody></table></div>);
}

function En() {
  return (<>
    <Section title="The Encoding Family Tree">
      <p>Before Unicode, every language needed its own encoding. The result was a tangled tree of standards, each solving the same problem differently:</p>
      <Table headers={["Era", "Encoding", "Characters"]} rows={[
        ["1963", "ASCII", "128 (English only)"],
        ["1987", "ISO 8859-1 (Latin-1)", "256 (Western European)"],
        ["1990s", "Windows code pages", "256 per page (regional)"],
        ["1978+", "CJK double-byte", "6,000-20,000 (East Asian)"],
        ["1991+", "Unicode (UTF-8/16)", "150,000+ (all languages)"],
      ]} />
      <p className="mt-3">This tool shows encoding bytes for 20+ legacy encodings simultaneously, letting you compare how the same character is represented across different systems.</p>
      <div className="mt-4"><TryItButton text="漢字">See encoding bytes across languages</TryItButton></div>
    </Section>
    <Section title="Single-Byte Encodings">
      <p>Single-byte encodings map each byte (0x00-0xFF) to one character. They share ASCII in the lower half (0x00-0x7F) but differ in the upper half (0x80-0xFF):</p>
      <Table headers={["Encoding", "Region", "Upper half contains"]} rows={[
        ["ISO 8859-1 / Latin-1", "Western Europe", "àáâãäå, ñ, ü, ß, etc."],
        ["Windows-1252", "Western Europe", "Same + €, ", ", —, etc."],
        ["ISO 8859-2", "Central Europe", "ą, ć, č, ě, ł, ő, ž, etc."],
        ["Windows-1251", "Cyrillic", "А-Я, а-я, etc."],
        ["KOI8-U", "Ukrainian", "Cyrillic (different order)"],
        ["ISO 8859-7", "Greek", "Α-Ω, α-ω, etc."],
      ]} />
      <p className="mt-3">WHATWG treats <C>iso-8859-1</C> as <C>windows-1252</C>. Bytes 0x80-0x9F that are C1 controls in ISO 8859-1 become typographic characters (€, ", —) in Windows-1252.</p>
      <div className="mt-4"><TryItButton text="café">Compare Western encodings</TryItButton></div>
    </Section>
    <Section title="East Asian Double-Byte Encodings">
      <p>CJK languages need thousands of characters, requiring multi-byte encodings:</p>
      <Table headers={["Encoding", "Language", "Standard"]} rows={[
        ["Shift_JIS / CP932", "Japanese", "JIS X 0208 / Windows-31J"],
        ["EUC-JP", "Japanese", "JIS X 0208 (Unix)"],
        ["ISO-2022-JP", "Japanese", "JIS X 0208 (Email)"],
        ["Big5", "Chinese (Traditional)", "Taiwan standard"],
        ["GBK / GB18030", "Chinese (Simplified)", "China standard"],
        ["EUC-KR (CP949)", "Korean", "KS X 1001 / UHC"],
      ]} />
      <p className="mt-3">The same CJK character gets completely different byte sequences in each encoding. This tool shows them all side by side.</p>
      <div className="mt-4"><TryItButton text="漢">Compare CJK encodings for a single character</TryItButton></div>
    </Section>
    <Section title="Auto-Detection: How the Tool Picks Encodings">
      <p>This tool automatically detects which encoding groups are relevant for each character using two methods:</p>
      <p className="mt-2"><strong>For CJK characters:</strong> The Unihan IRG Source database (88,000+ characters) identifies which national standards include each character. This is more accurate than simple encoding checks.</p>
      <p className="mt-2"><strong>For other scripts:</strong> Encodability checks against the broadest encoding in each group (e.g., Windows-1252 for Western, Windows-1251 for Cyrillic).</p>
      <div className="mt-4"><TryItButton text="α">See auto-detected Greek encoding</TryItButton></div>
    </Section>
  </>);
}

function Ja() {
  return (<>
    <Section title="エンコーディングの系譜">
      <p>Unicode 以前は、各言語に固有のエンコーディングが必要でした。その結果、同じ問題を異なる方法で解決する規格が乱立しました:</p>
      <Table headers={["年代", "エンコーディング", "文字数"]} rows={[
        ["1963", "ASCII", "128（英語のみ）"],
        ["1987", "ISO 8859-1 (Latin-1)", "256（西欧）"],
        ["1990年代", "Windows コードページ", "各256（地域別）"],
        ["1978年〜", "CJK ダブルバイト", "6,000〜20,000（東アジア）"],
        ["1991年〜", "Unicode (UTF-8/16)", "15万以上（全言語）"],
      ]} />
      <p className="mt-3">このツールは20以上のレガシーエンコーディングのバイト列を同時に表示し、同じ文字がシステムごとにどう表現されるか比較できます。</p>
      <div className="mt-4"><TryItButton text="漢字">言語横断でバイト列を比較</TryItButton></div>
    </Section>
    <Section title="シングルバイト・エンコーディング">
      <p>シングルバイト・エンコーディングは各バイト (0x00-0xFF) を1文字にマップします。下半分 (0x00-0x7F) は ASCII 共通ですが、上半分 (0x80-0xFF) は異なります:</p>
      <Table headers={["エンコーディング", "地域", "上半分の内容"]} rows={[
        ["ISO 8859-1 / Latin-1", "西欧", "àáâãäå, ñ, ü, ß 等"],
        ["Windows-1252", "西欧", "同上 + €, ", ", — 等"],
        ["ISO 8859-2", "中央ヨーロッパ", "ą, ć, č, ě, ł, ő, ž 等"],
        ["Windows-1251", "キリル文字", "А-Я, а-я 等"],
        ["KOI8-U", "ウクライナ", "キリル文字（異なる配置）"],
      ]} />
      <p className="mt-3">WHATWG は <C>iso-8859-1</C> を <C>windows-1252</C> として扱います。ISO 8859-1 で C1 制御文字の 0x80-0x9F が、Windows-1252 ではタイポグラフィ文字（€, ", —）になります。</p>
      <div className="mt-4"><TryItButton text="café">西欧エンコーディングを比較</TryItButton></div>
    </Section>
    <Section title="東アジアのダブルバイト・エンコーディング">
      <p>CJK 言語は数千の文字が必要なため、マルチバイト・エンコーディングを使用します:</p>
      <Table headers={["エンコーディング", "言語", "規格"]} rows={[
        ["Shift_JIS / CP932", "日本語", "JIS X 0208 / Windows-31J"],
        ["EUC-JP", "日本語", "JIS X 0208 (Unix系)"],
        ["ISO-2022-JP", "日本語", "JIS X 0208 (メール)"],
        ["Big5", "中国語（繁体字）", "台湾規格"],
        ["GBK / GB18030", "中国語（簡体字）", "中国規格"],
        ["EUC-KR (CP949)", "韓国語", "KS X 1001 / UHC"],
      ]} />
      <p className="mt-3">同じ CJK 文字でもエンコーディングごとに全く異なるバイト列になります。このツールで並べて比較できます。</p>
      <div className="mt-4"><TryItButton text="漢">1文字の CJK エンコーディングを比較</TryItButton></div>
    </Section>
    <Section title="自動検出の仕組み">
      <p>このツールは2つの方法で各文字に関連するエンコーディングを自動検出します:</p>
      <p className="mt-2"><strong>CJK 文字:</strong> Unihan IRG ソースデータベース（88,000字以上）で各国規格への収録状況を確認。単純なエンコード可否チェックより正確です。</p>
      <p className="mt-2"><strong>その他のスクリプト:</strong> 各グループの最も広いエンコーディング（西欧は Windows-1252、キリルは Windows-1251 等）でのエンコード可否を確認。</p>
      <div className="mt-4"><TryItButton text="α">ギリシャ語の自動検出を確認</TryItButton></div>
    </Section>
  </>);
}

export default function LegacyEncodingsContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

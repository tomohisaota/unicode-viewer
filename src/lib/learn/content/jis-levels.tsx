import TryItButton from "@/app/learn/components/TryItButton";

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
    <Section title="The 94×94 Grid">
      <p>JIS character sets are organized as a grid of 94 rows (区 ku) and 94 columns (点 ten). Each character is identified by its row-column position, called a <strong>kuten code</strong>.</p>
      <p className="mt-2">For example, 亜 is at row 16, column 1 — written as <C>1面16区1点</C> (plane 1, row 16, cell 1). JIS X 0213 added a second plane, so characters can be at <C>1面-XX-XX</C> or <C>2面-XX-XX</C>.</p>
      <div className="mt-4"><TryItButton text="亜">See kuten code for 亜</TryItButton></div>
    </Section>
    <Section title="The Four JIS Levels">
      <p>Kanji in JIS standards are classified by frequency and importance into four levels:</p>
      <Table headers={["Level", "Standard", "Count", "Content"]} rows={[
        ["Level 1 (第一水準)", "JIS X 0208", "2,965", "Common everyday kanji"],
        ["Level 2 (第二水準)", "JIS X 0208", "3,390", "Less common but essential"],
        ["Level 3 (第三水準)", "JIS X 0213", "1,259", "Names, historical text"],
        ["Level 4 (第四水準)", "JIS X 0213", "2,436", "Rare kanji, supplements"],
      ]} />
      <p className="mt-3">Levels 1-2 are from JIS X 0208 (1978/1983/1990/1997). Levels 3-4 were added by JIS X 0213 (2000/2004) to cover characters needed for personal names and historical documents.</p>
    </Section>
    <Section title="JIS X 0208 vs JIS X 0213">
      <p>JIS X 0213 is not just an extension — it also revised some character assignments from JIS X 0208. The 2004 revision added 10 new characters and changed the example glyphs for 168 existing characters.</p>
      <Table headers={["Character", "JIS X 0208", "JIS X 0213:2004"]} rows={[
        ["繋 (U+7E4B)", "Level 1, 1-23-50", "Same position"],
        ["繫 (U+7E6B)", "Not included", "Level 3, added at 1-94-94"],
      ]} />
      <p className="mt-3">Both forms of the character were recognized as valid, but they map to different Unicode code points. This tool shows the JIS level and kuten code for each.</p>
      <div className="mt-4"><TryItButton text="繋繫">Compare JIS X 0208 vs 0213</TryItButton></div>
    </Section>
    <Section title="Practical Significance">
      <p>JIS levels matter for Japanese IT systems:</p>
      <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
        <li><strong>Government systems</strong> often require Level 1-2 support at minimum</li>
        <li><strong>Name processing</strong> (koseki/jūminhyō) needs Level 3-4 for rare name kanji</li>
        <li><strong>Font requirements</strong>: Level 1-2 fonts are common, Level 3-4 fonts are specialized</li>
        <li><strong>Input methods</strong>: Some IMEs only support Level 1-2 by default</li>
      </ul>
      <div className="mt-4"><TryItButton text="髙">Check IBM extension character (not in JIS X 0208)</TryItButton></div>
    </Section>
  </>);
}

function Ja() {
  return (<>
    <Section title="94×94 のグリッド">
      <p>JIS 文字集合は94行（区）×94列（点）のグリッドで構成されています。各文字はその行列位置で識別され、これを<strong>区点コード</strong>と呼びます。</p>
      <p className="mt-2">例えば「亜」は16区1点 — <C>1面16区1点</C> と表記します。JIS X 0213 では2面が追加され、<C>1面-XX-XX</C> と <C>2面-XX-XX</C> の2面構成になりました。</p>
      <div className="mt-4"><TryItButton text="亜">亜の区点コードを確認</TryItButton></div>
    </Section>
    <Section title="4つの JIS 水準">
      <p>JIS 規格の漢字は使用頻度と重要度で4つの水準に分類されています:</p>
      <Table headers={["水準", "規格", "字数", "内容"]} rows={[
        ["第一水準", "JIS X 0208", "2,965", "日常的に使われる常用漢字"],
        ["第二水準", "JIS X 0208", "3,390", "頻度は低いが必要な漢字"],
        ["第三水準", "JIS X 0213", "1,259", "人名・歴史的文献用"],
        ["第四水準", "JIS X 0213", "2,436", "稀少漢字・補助"],
      ]} />
      <p className="mt-3">第一・第二水準は JIS X 0208（1978/1983/1990/1997）で定義。第三・第四水準は JIS X 0213（2000/2004）で人名や歴史的文献に必要な文字をカバーするために追加されました。</p>
    </Section>
    <Section title="JIS X 0208 と JIS X 0213 の違い">
      <p>JIS X 0213 は単なる拡張ではなく、JIS X 0208 の一部の文字配置を見直しています。2004年改訂では10文字が新規追加され、168文字の例示字形が変更されました。</p>
      <Table headers={["文字", "JIS X 0208", "JIS X 0213:2004"]} rows={[
        ["繋 (U+7E4B)", "第一水準 1-23-50", "同じ位置"],
        ["繫 (U+7E6B)", "収録なし", "第三水準 1-94-94 に追加"],
      ]} />
      <p className="mt-3">両方の字体が有効とされましたが、異なる Unicode コードポイントにマップされます。このツールで各文字の JIS 水準と区点コードを確認できます。</p>
      <div className="mt-4"><TryItButton text="繋繫">JIS X 0208 と 0213 を比較</TryItButton></div>
    </Section>
    <Section title="実用上の重要性">
      <p>JIS 水準は日本の IT システムで重要です:</p>
      <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
        <li><strong>行政システム</strong>は最低限、第一・第二水準のサポートが必要</li>
        <li><strong>氏名処理</strong>（戸籍・住民票）には稀少な人名漢字のため第三・第四水準が必要</li>
        <li><strong>フォント要件</strong>: 第一・第二水準フォントは一般的、第三・第四水準は専門的</li>
        <li><strong>入力方式</strong>: 一部の IME はデフォルトで第一・第二水準のみ対応</li>
      </ul>
      <div className="mt-4"><TryItButton text="髙">IBM 拡張文字を確認（JIS X 0208 には未収録）</TryItButton></div>
    </Section>
  </>);
}

export default function JisLevelsContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

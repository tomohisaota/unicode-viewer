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
    <Section title="Why Discrepancies Exist">
      <p>When converting legacy encodings to Unicode, multiple organizations created their own mapping tables independently. The official Unicode.org tables followed national standards strictly, while Microsoft and later WHATWG followed what browsers actually implemented.</p>
      <p className="mt-2">WHATWG&rsquo;s fundamental principle: <strong>&ldquo;Don&rsquo;t break existing web content.&rdquo;</strong> This means ratifying browser behavior even when it contradicts official standards.</p>
    </Section>
    <Section title="Japanese: 7 JIS Discrepancies">
      <p>The most well-known mapping conflict. The same JIS byte position maps to different Unicode code points:</p>
      <Table headers={["JIS Bytes", "Unicode.org", "WHATWG (Microsoft)"]} rows={[
        ["81 5F", "\\ (U+005C)", "＼ (U+FF3C)"],
        ["81 60", "〜 (U+301C)", "～ (U+FF5E)"],
        ["81 61", "‖ (U+2016)", "∥ (U+2225)"],
        ["81 7C", "− (U+2212)", "－ (U+FF0D)"],
        ["81 91", "¢ (U+00A2)", "￠ (U+FFE0)"],
        ["81 92", "£ (U+00A3)", "￡ (U+FFE1)"],
        ["81 CA", "¬ (U+00AC)", "￢ (U+FFE2)"],
      ]} />
      <p className="mt-3">This tool lets you toggle between both mappings in Settings to see the difference.</p>
      <div className="mt-4"><TryItButton text="～〜" map="unicode.org">Compare with Unicode.org mapping</TryItButton></div>
    </Section>
    <Section title="Chinese: Big5 and GB18030">
      <p><strong>Big5</strong> (Traditional Chinese): WHATWG merges CP950 and HKSCS into a hybrid table. 6 characters have duplicate byte positions where the encoding order differs between WHATWG and other implementations.</p>
      <p className="mt-2"><strong>GB18030</strong> (Simplified Chinese): Byte <C>0xA3 0xA0</C> maps to U+3000 (ideographic space) in WHATWG, but the official GB18030 standard maps it to U+E5E5 (a PUA character). This was a deliberate web-compatibility fix from 2002.</p>
    </Section>
    <Section title="Korean: EUC-KR Scope Expansion">
      <p>WHATWG&rsquo;s &ldquo;EUC-KR&rdquo; is actually Windows CP949/UHC, covering all 11,172 Hangul syllables — far more than the original KS X 1001 standard&rsquo;s ~2,350.</p>
      <p className="mt-2">Notably, the Unicode.org KSX1001.TXT was created from Microsoft&rsquo;s UHC mapping (stated in the file header), so there is no WHATWG vs Unicode.org discrepancy for Korean — unlike JIS.</p>
    </Section>
    <Section title="Western: ISO 8859-1 → Windows-1252">
      <p>WHATWG&rsquo;s most sweeping decision: all labels including <C>iso-8859-1</C>, <C>latin1</C>, and <C>ascii</C> resolve to Windows-1252. This means 27 bytes in the 0x80-0x9F range decode as typographic characters instead of C1 controls.</p>
      <Table headers={["Byte", "ISO 8859-1", "Windows-1252 (WHATWG)"]} rows={[
        ["0x80", "C1 control", "€ (U+20AC)"],
        ["0x93", "C1 control", "\u201C (U+201C)"],
        ["0x94", "C1 control", "\u201D (U+201D)"],
        ["0x97", "C1 control", "— (U+2014)"],
      ]} />
    </Section>
    <Section title="The Common Pattern">
      <p>Across all encodings, the pattern is the same:</p>
      <Table headers={["Source", "Approach", "Priority"]} rows={[
        ["Official standards", "Follow national/ISO specifications", "Correctness"],
        ["Microsoft/Browser", "Follow Windows code page behavior", "Compatibility"],
        ["WHATWG", "Ratify what browsers actually do", "Web content"],
      ]} />
      <p className="mt-3">WHATWG standardized what browsers had been doing for decades. The result is pragmatic but means &ldquo;the standard&rdquo; and &ldquo;browser behavior&rdquo; now agree — at the cost of diverging from the original national standards.</p>
      <div className="mt-4"><TryItButton text="漢字">See all encoding bytes simultaneously</TryItButton></div>
    </Section>
  </>);
}

function Ja() {
  return (<>
    <Section title="なぜ相違が生じるのか">
      <p>レガシーエンコーディングを Unicode に変換する際、複数の組織が独自にマッピングテーブルを作成しました。Unicode.org は各国規格に忠実に、Microsoft と WHATWG はブラウザの実装に従いました。</p>
      <p className="mt-2">WHATWG の基本原則: <strong>「既存の Web コンテンツを壊さない」</strong>。これはブラウザの動作を公式規格より優先することを意味します。</p>
    </Section>
    <Section title="日本語: 7つの JIS 不一致">
      <p>最も有名なマッピング問題。同じ JIS バイト位置が異なる Unicode コードポイントにマップされます:</p>
      <Table headers={["JIS バイト", "Unicode.org", "WHATWG (Microsoft)"]} rows={[
        ["81 5F", "\\ (U+005C)", "＼ (U+FF3C)"],
        ["81 60", "〜 (U+301C)", "～ (U+FF5E)"],
        ["81 61", "‖ (U+2016)", "∥ (U+2225)"],
        ["81 7C", "− (U+2212)", "－ (U+FF0D)"],
        ["81 91", "¢ (U+00A2)", "￠ (U+FFE0)"],
        ["81 92", "£ (U+00A3)", "￡ (U+FFE1)"],
        ["81 CA", "¬ (U+00AC)", "￢ (U+FFE2)"],
      ]} />
      <p className="mt-3">このツールでは設定から両マッピングを切り替えて違いを確認できます。</p>
      <div className="mt-4"><TryItButton text="～〜" map="unicode.org">Unicode.org マッピングで比較</TryItButton></div>
    </Section>
    <Section title="中国語: Big5 と GB18030">
      <p><strong>Big5</strong>（繁体字）: WHATWG は CP950 と HKSCS を統合したハイブリッドテーブルを使用。6文字でバイト列の順序が他の実装と異なります。</p>
      <p className="mt-2"><strong>GB18030</strong>（簡体字）: バイト <C>0xA3 0xA0</C> は WHATWG では U+3000（全角スペース）にマップされますが、公式 GB18030 規格では U+E5E5（PUA 文字）です。2002年の Web 互換性修正に基づく決定です。</p>
    </Section>
    <Section title="韓国語: EUC-KR のスコープ拡張">
      <p>WHATWG の「EUC-KR」は実際には Windows CP949/UHC で、全 11,172 ハングル音節をカバー — 本来の KS X 1001 の約 2,350 字をはるかに超えます。</p>
      <p className="mt-2">注目すべき点: Unicode.org の KSX1001.TXT は Microsoft の UHC マッピングに基づいて作成されている（ファイルヘッダーに明記）ため、韓国語では JIS のような WHATWG vs Unicode.org の相違はありません。</p>
    </Section>
    <Section title="西欧: ISO 8859-1 → Windows-1252">
      <p>WHATWG の最も影響範囲の広い決定: <C>iso-8859-1</C>、<C>latin1</C>、<C>ascii</C> 等のラベルは全て Windows-1252 として解釈。0x80-0x9F の27バイトが C1 制御文字ではなくタイポグラフィ文字に。</p>
      <Table headers={["バイト", "ISO 8859-1", "Windows-1252 (WHATWG)"]} rows={[
        ["0x80", "C1 制御文字", "€ (U+20AC)"],
        ["0x93", "C1 制御文字", "\u201C (U+201C)"],
        ["0x94", "C1 制御文字", "\u201D (U+201D)"],
        ["0x97", "C1 制御文字", "— (U+2014)"],
      ]} />
    </Section>
    <Section title="共通パターン">
      <p>全てのエンコーディングに共通する構造:</p>
      <Table headers={["作成者", "アプローチ", "優先事項"]} rows={[
        ["公式規格", "各国/ISO 仕様に忠実", "正確性"],
        ["Microsoft/ブラウザ", "Windows コードページの動作に従う", "互換性"],
        ["WHATWG", "ブラウザの実装を追認", "Web コンテンツ"],
      ]} />
      <p className="mt-3">WHATWG はブラウザが数十年間行ってきた動作を標準化しました。「規格」と「ブラウザの動作」が一致する代わりに、元の各国規格とは乖離する結果になっています。</p>
      <div className="mt-4"><TryItButton text="漢字">全エンコーディングのバイト列を同時表示</TryItButton></div>
    </Section>
  </>);
}

export default function WhatwgVsUnicodeOrgContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

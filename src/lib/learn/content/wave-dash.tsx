import TryItButton from "@/app/learn/components/TryItButton";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-lg sm:text-xl font-semibold mb-3"
        style={{ color: "var(--gray-900)", letterSpacing: "-0.5px" }}
      >
        {title}
      </h2>
      <div className="text-sm sm:text-base" style={{ lineHeight: 1.85 }}>
        {children}
      </div>
    </section>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="font-mono text-xs px-1.5 py-0.5 rounded"
      style={{ backgroundColor: "var(--gray-50)", color: "var(--gray-900)" }}
    >
      {children}
    </code>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="text-left px-3 py-2 text-xs font-semibold"
                style={{ color: "var(--gray-500)", borderBottom: "1px solid var(--gray-100)" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 font-mono"
                  style={{ color: "var(--gray-700)", borderBottom: "1px solid var(--gray-100)" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto" style={{ backgroundColor: "var(--gray-50)" }}>
      <pre style={{ color: "var(--gray-700)" }}>{children}</pre>
    </div>
  );
}

function En() {
  return (
    <>
      <Section title="Why the Same Byte Maps to Two Unicode Characters">
        <p>In JIS X 0208, row 1 column 33 (区点 1-33) is the &ldquo;wave dash&rdquo; &mdash; a wavy horizontal line used in Japanese to indicate ranges (e.g., 3時〜5時). When JIS was mapped to Unicode, two different organizations made two different choices:</p>
        <Table headers={["Mapper", "JIS 1-33 →", "Character", "Name"]} rows={[
          ["Unicode.org (JIS X 0208:1997 Annex)", "U+301C", "〜", "WAVE DASH"],
          ["Microsoft (CP932 / Windows-31J)", "U+FF5E", "～", "FULLWIDTH TILDE"],
        ]} />
        <p className="mt-3">The characters look similar but are semantically different. <C>U+301C WAVE DASH</C> is the standard Unicode mapping of the JIS wave dash. <C>U+FF5E FULLWIDTH TILDE</C> is a fullwidth form of the ASCII tilde (~), not originally intended to represent the JIS wave dash at all.</p>
        <p className="mt-3">Microsoft chose U+FF5E because early Unicode fonts rendered U+301C with an inverted curve on Windows, making it look wrong to Japanese users. Rather than fix the glyph, Microsoft mapped to a different code point entirely.</p>
        <div className="mt-4"><TryItButton text="～〜" map="unicode.org">Compare both wave dashes</TryItButton></div>
      </Section>

      <Section title="The Complete Table: All 7 Discrepancies">
        <p>The wave dash is the most famous case, but there are actually 7 JIS-to-Unicode mapping discrepancies between the Unicode.org/JIS standard mapping and Microsoft&apos;s CP932 mapping:</p>
        <Table headers={["JIS Kuten", "JIS Name", "Unicode.org", "Microsoft CP932", "Description"]} rows={[
          ["1-17", "EM DASH", "U+2014 —", "U+2015 ―", "Em dash vs Horizontal bar"],
          ["1-29", "MINUS SIGN", "U+2212 −", "U+FF0D －", "Minus sign vs Fullwidth hyphen-minus"],
          ["1-33", "WAVE DASH", "U+301C 〜", "U+FF5E ～", "Wave dash vs Fullwidth tilde"],
          ["1-36", "DOUBLE VERTICAL LINE", "U+2016 ‖", "U+2225 ∥", "Double vertical line vs Parallel to"],
          ["1-61", "MINUS SIGN (alt)", "U+00A2 ¢", "U+FFE0 ￠", "Cent sign vs Fullwidth cent sign"],
          ["1-81", "POUND SIGN", "U+00A3 £", "U+FFE1 ￡", "Pound sign vs Fullwidth pound sign"],
          ["1-82", "NOT SIGN", "U+00AC ¬", "U+FFE2 ￢", "Not sign vs Fullwidth not sign"],
        ]} />
        <p className="mt-3">In every case, Microsoft chose a fullwidth or visually similar variant rather than the character that Unicode.org considers the correct semantic mapping.</p>
        <div className="mt-4"><TryItButton text="＼￠￡￢">Inspect fullwidth variants</TryItButton></div>
      </Section>

      <Section title="Historical Context: How This Happened">
        <p>The root cause traces back to the early 1990s:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>1993</strong>: Microsoft shipped Windows 3.1J with CP932, creating mappings before Unicode glyph rendering was mature.</li>
          <li><strong>1997</strong>: JIS X 0208:1997 included an official Unicode mapping in its Annex that differed from Microsoft&apos;s.</li>
          <li><strong>2000s</strong>: By the time the discrepancy was widely recognized, billions of documents existed with both mappings.</li>
        </ul>
        <p className="mt-3">Neither mapping is &ldquo;wrong&rdquo; in absolute terms &mdash; Microsoft prioritized visual appearance on their platform, while the JIS standard prioritized semantic correctness.</p>
      </Section>

      <Section title="Practical Impact: Where It Breaks">
        <p>The wave dash problem surfaces in several real scenarios:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Database migration</strong>: Converting data between Oracle (which often used the JIS/Unicode.org mapping) and SQL Server (which used the Microsoft mapping) could silently swap characters.</li>
          <li><strong>Email</strong>: JIS-encoded email decoded with different mapping tables would show wrong characters.</li>
          <li><strong>Web forms</strong>: A user typing 〜 on macOS (which uses U+301C) and another on Windows (which historically used U+FF5E) would produce different data for the &ldquo;same&rdquo; character.</li>
          <li><strong>Search</strong>: Searching for 〜 would not match ～, even though the user considers them identical.</li>
        </ul>
        <CodeBlock>{`// These look similar but are different code points:
"〜".codePointAt(0).toString(16)  // "301c" (WAVE DASH)
"～".codePointAt(0).toString(16)  // "ff5e" (FULLWIDTH TILDE)

// Direct comparison fails:
"〜" === "～"  // false

// Even NFKC normalization doesn't help here:
"〜".normalize("NFKC") === "～".normalize("NFKC")  // false`}</CodeBlock>
      </Section>

      <Section title="Which Mapping Should You Use?">
        <p>The answer depends on your context:</p>
        <Table headers={["Context", "Recommended", "Reason"]} rows={[
          ["New data / Unicode-native", "Unicode.org (U+301C)", "Semantically correct per JIS standard"],
          ["Windows interop / legacy", "Microsoft (U+FF5E)", "Matches existing CP932 data"],
          ["WHATWG Encoding Standard", "Microsoft (U+FF5E)", "Browsers use CP932-compatible mapping"],
          ["Apple platforms", "Unicode.org (U+301C)", "macOS/iOS use the JIS standard mapping"],
        ]} />
        <p className="mt-3">The WHATWG Encoding Standard (used by all web browsers) follows the Microsoft mapping for Shift_JIS decoding. This means that when a browser decodes a Shift_JIS page, JIS 1-33 becomes U+FF5E, not U+301C. This is a pragmatic choice: most Shift_JIS content was created on Windows.</p>
        <p className="mt-3">This tool lets you toggle between the two mapping tables so you can see exactly how each byte sequence is interpreted.</p>
      </Section>

      <Section title="The Broader Pattern: Not Just Japanese">
        <p>The wave dash problem is the most notorious example of a mapping discrepancy, but similar issues exist in other encodings:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>EUC-KR / CP949</strong>: Korean encoding has its own set of mapping disagreements between the KS standard and Microsoft&apos;s implementation.</li>
          <li><strong>Big5 / CP950</strong>: Traditional Chinese encoding similarly diverges between the official standard and Microsoft&apos;s extensions.</li>
          <li><strong>GB2312 / GBK / CP936</strong>: Simplified Chinese encodings have grown through multiple incompatible extensions.</li>
        </ul>
        <p className="mt-3">The lesson is universal: whenever a character encoding was mapped to Unicode by multiple parties independently, discrepancies were nearly inevitable. Unicode itself is not at fault &mdash; the problem is the many-to-one nature of legacy-to-Unicode conversion.</p>
        <div className="mt-4"><TryItButton text="～〜" map="unicode.org">View with Unicode.org mapping</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="なぜ同じバイトが2つのUnicode文字にマッピングされるのか">
        <p>JIS X 0208 の1区33点は「波ダッシュ」&mdash; 日本語で範囲を示す波線記号（例: 3時〜5時）です。JIS を Unicode にマッピングする際、2つの組織が異なる選択をしました:</p>
        <Table headers={["マッパー", "JIS 1-33 →", "文字", "名前"]} rows={[
          ["Unicode.org（JIS X 0208:1997 附属書）", "U+301C", "〜", "WAVE DASH"],
          ["Microsoft（CP932 / Windows-31J）", "U+FF5E", "～", "FULLWIDTH TILDE"],
        ]} />
        <p className="mt-3">見た目は似ていますが意味が異なります。<C>U+301C WAVE DASH</C> は JIS 波ダッシュの標準 Unicode マッピングです。<C>U+FF5E FULLWIDTH TILDE</C> は ASCII チルダ(~)の全角形であり、本来 JIS 波ダッシュを表すものではありません。</p>
        <p className="mt-3">Microsoft が U+FF5E を選んだ理由は、初期の Windows 上で U+301C のグリフが上下反転した波形で表示されたためです。グリフを修正する代わりに、別のコードポイントにマッピングするという判断がなされました。</p>
        <div className="mt-4"><TryItButton text="～〜" map="unicode.org">両方の波ダッシュを比較する</TryItButton></div>
      </Section>

      <Section title="完全な一覧表: 7つの不一致">
        <p>波ダッシュが最も有名ですが、Unicode.org/JIS 標準マッピングと Microsoft CP932 マッピングの間には実際に7つの不一致が存在します:</p>
        <Table headers={["JIS 区点", "JIS 名称", "Unicode.org", "Microsoft CP932", "説明"]} rows={[
          ["1-17", "ダッシュ", "U+2014 —", "U+2015 ―", "Em dash vs 水平バー"],
          ["1-29", "マイナス記号", "U+2212 −", "U+FF0D －", "マイナス vs 全角ハイフンマイナス"],
          ["1-33", "波ダッシュ", "U+301C 〜", "U+FF5E ～", "波ダッシュ vs 全角チルダ"],
          ["1-36", "双柱", "U+2016 ‖", "U+2225 ∥", "双柱 vs 平行"],
          ["1-61", "セント記号", "U+00A2 ¢", "U+FFE0 ￠", "セント vs 全角セント"],
          ["1-81", "ポンド記号", "U+00A3 £", "U+FFE1 ￡", "ポンド vs 全角ポンド"],
          ["1-82", "否定記号", "U+00AC ¬", "U+FFE2 ￢", "否定 vs 全角否定"],
        ]} />
        <p className="mt-3">すべてのケースで、Microsoft は Unicode.org が正しい意味的マッピングとする文字ではなく、全角または視覚的に類似した変種を選択しています。</p>
        <div className="mt-4"><TryItButton text="＼￠￡￢">全角変種を検査する</TryItButton></div>
      </Section>

      <Section title="歴史的経緯: なぜこうなったのか">
        <p>根本原因は1990年代初頭に遡ります:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>1993 年</strong>: Microsoft が Windows 3.1J で CP932 を出荷しました。Unicode のグリフレンダリングが成熟する前にマッピングが作成されたのです。</li>
          <li><strong>1997 年</strong>: JIS X 0208:1997 の附属書に公式 Unicode マッピングが収録されましたが、Microsoft のものとは異なっていました。</li>
          <li><strong>2000 年代</strong>: 不一致が広く認識された頃には、両方のマッピングで作成された文書が膨大に存在していました。</li>
        </ul>
        <p className="mt-3">どちらのマッピングも絶対的に「間違い」ではありません。Microsoft は自社プラットフォームでの見た目を優先し、JIS 標準は意味的な正確性を優先しました。</p>
      </Section>

      <Section title="実用上の影響: どこで問題が起きるか">
        <p>波ダッシュ問題は以下のような実際のシナリオで顕在化します:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>データベース移行</strong>: Oracle（JIS/Unicode.org マッピングを使用することが多い）と SQL Server（Microsoft マッピングを使用）間のデータ変換で、文字がサイレントに入れ替わる可能性があります。</li>
          <li><strong>メール</strong>: JIS エンコードされたメールを異なるマッピングテーブルでデコードすると、誤った文字が表示されます。</li>
          <li><strong>Web フォーム</strong>: macOS（U+301C を使用）で入力した〜と、Windows（歴史的に U+FF5E を使用）で入力した～は、「同じ」文字でも異なるデータになります。</li>
          <li><strong>検索</strong>: 〜で検索しても～はヒットしません。ユーザーにとっては同一の文字に見えるのに、です。</li>
        </ul>
        <CodeBlock>{`// 見た目は似ているが異なるコードポイント:
"〜".codePointAt(0).toString(16)  // "301c" (WAVE DASH)
"～".codePointAt(0).toString(16)  // "ff5e" (FULLWIDTH TILDE)

// 直接比較は失敗:
"〜" === "～"  // false

// NFKC 正規化でも解決しない:
"〜".normalize("NFKC") === "～".normalize("NFKC")  // false`}</CodeBlock>
      </Section>

      <Section title="どちらのマッピングを使うべきか">
        <p>文脈によって推奨が異なります:</p>
        <Table headers={["文脈", "推奨", "理由"]} rows={[
          ["新規データ / Unicode ネイティブ", "Unicode.org (U+301C)", "JIS 標準に基づく正しい意味的マッピング"],
          ["Windows 連携 / レガシー", "Microsoft (U+FF5E)", "既存の CP932 データと一致"],
          ["WHATWG Encoding Standard", "Microsoft (U+FF5E)", "ブラウザは CP932 互換マッピングを使用"],
          ["Apple プラットフォーム", "Unicode.org (U+301C)", "macOS/iOS は JIS 標準マッピングを使用"],
        ]} />
        <p className="mt-3">WHATWG Encoding Standard（全ウェブブラウザが使用）は Shift_JIS デコード時に Microsoft マッピングに従います。つまりブラウザが Shift_JIS ページをデコードすると、JIS 1-33 は U+301C ではなく U+FF5E になります。これは実用的な選択です: Shift_JIS コンテンツの大半は Windows で作成されたためです。</p>
        <p className="mt-3">このツールでは2つのマッピングテーブルを切り替えて、各バイト列がどう解釈されるかを確認できます。</p>
      </Section>

      <Section title="より広いパターン: 日本語だけの問題ではない">
        <p>波ダッシュ問題はマッピング不一致の最も有名な例ですが、他のエンコーディングにも類似の問題が存在します:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>EUC-KR / CP949</strong>: 韓国語エンコーディングにも KS 標準と Microsoft 実装の間でマッピングの不一致があります。</li>
          <li><strong>Big5 / CP950</strong>: 繁体字中国語エンコーディングも公式標準と Microsoft 拡張の間で同様に乖離しています。</li>
          <li><strong>GB2312 / GBK / CP936</strong>: 簡体字中国語エンコーディングは複数の非互換な拡張を経て成長してきました。</li>
        </ul>
        <p className="mt-3">教訓は普遍的です: 文字エンコーディングが複数の当事者によって独立に Unicode にマッピングされた場合、不一致はほぼ不可避でした。Unicode 自体に非はなく、問題はレガシーから Unicode への変換が多対一であることに起因します。</p>
        <div className="mt-4"><TryItButton text="～〜" map="unicode.org">Unicode.org マッピングで表示する</TryItButton></div>
      </Section>
    </>
  );
}

export default function WaveDashContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

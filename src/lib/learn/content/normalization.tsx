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
      <Section title='The Problem: "café" Encoded Two Ways'>
        <p>Type <C>café</C> on two different computers and you might get two completely different byte sequences &mdash; even though the text looks identical on screen. The letter <C>é</C> can be represented as a single code point U+00E9 (LATIN SMALL LETTER E WITH ACUTE), or as two code points: U+0065 (e) followed by U+0301 (COMBINING ACUTE ACCENT).</p>
        <p className="mt-3">This means <C>{"'caf\\u00E9' === 'cafe\\u0301'"}</C> evaluates to <C>false</C> in JavaScript, even though both strings render identically. File systems, databases, and search engines all face this problem: the same human-readable text can have multiple valid binary representations. A user searching for &ldquo;café&rdquo; might miss results stored in the other form.</p>
        <p className="mt-3">Unicode normalization exists to solve exactly this problem. It defines deterministic algorithms for converting between equivalent representations, ensuring that text which looks the same actually compares as equal.</p>
        <div className="mt-4"><TryItButton text="café" norm={true}>Compare NFC vs NFD for café</TryItButton></div>
      </Section>

      <Section title="Canonical Equivalence: NFC and NFD">
        <p>The two most common normalization forms handle <strong>canonical equivalence</strong> &mdash; sequences that represent the exact same abstract character:</p>
        <Table headers={["Form", "Name", "Strategy", "café"]} rows={[
          ["NFC", "Canonical Decomposition + Composition", "Compose into fewest code points", "c a f é (4 CPs)"],
          ["NFD", "Canonical Decomposition", "Decompose into base + combining marks", "c a f e ◌́ (5 CPs)"],
        ]} />
        <p className="mt-3"><strong>NFD</strong> breaks every precomposed character into its base character plus combining marks. The é (U+00E9) becomes e (U+0065) + combining acute accent (U+0301). Characters that are already in their most decomposed form remain unchanged. NFD also applies <em>canonical ordering</em> to ensure combining marks appear in a deterministic order.</p>
        <p className="mt-3"><strong>NFC</strong> first performs the full NFD decomposition, then recomposes the result using canonical composition rules. The net effect is that each character is represented by the fewest possible code points. NFC is by far the most common normalization form on the web: the W3C recommends NFC for all web content, and most modern operating systems use NFC by default. The notable exception is macOS, whose HFS+ file system historically stored filenames in a variant of NFD.</p>
        <CodeBlock>{`// NFC and NFD produce the same visual result
const nfc = "caf\\u00E9";           // "café" — 4 code points
const nfd = "cafe\\u0301";          // "café" — 5 code points

nfc === nfd;                        // false!
nfc.normalize("NFC") === nfd.normalize("NFC");  // true
nfc.normalize("NFD") === nfd.normalize("NFD");  // true`}</CodeBlock>
      </Section>

      <Section title="Compatibility Equivalence: NFKC and NFKD">
        <p>Beyond canonical equivalence, Unicode defines <strong>compatibility equivalence</strong>: characters that are semantically similar but not identical. These are characters that were given separate code points for historical or formatting reasons but are considered &ldquo;the same&rdquo; for many practical purposes.</p>
        <Table headers={["Original", "NFKC/NFKD result", "Relationship"]} rows={[
          ["ﬁ (U+FB01)", "fi", "Ligature → component letters"],
          ["ﬄ (U+FB04)", "ffl", "Ligature → component letters"],
          ["㍻ (U+337B)", "平成", "Square composition → characters"],
          ["㌔ (U+3314)", "キロ", "Square composition → characters"],
          ["㍑ (U+3351)", "リットル", "Square composition → characters"],
          ["① (U+2460)", "1", "Enclosed numeral → digit"],
          ["Ｈ (U+FF28)", "H", "Fullwidth → ASCII"],
          ["ℌ (U+210C)", "H", "Letterlike symbol → letter"],
        ]} />
        <p className="mt-3"><strong>NFKD</strong> (Compatibility Decomposition) performs canonical decomposition plus compatibility decomposition, breaking apart ligatures, square compositions, and other compatibility characters. <strong>NFKC</strong> (Compatibility Decomposition + Composition) does the same decomposition and then recomposes using canonical composition &mdash; like NFC applied after NFKD.</p>
        <p className="mt-3">Compatibility normalization is lossy: the round-trip <C>㍻</C> → <C>平成</C> → <C>㍻</C> is impossible because NFKC/NFKD destroys the information that the original was a single square composition character. Use compatibility normalization for search and matching, but preserve the original form for display.</p>
        <div className="mt-4"><TryItButton text="㍻㌔㍑" norm={true}>Inspect Japanese square compositions</TryItButton></div>
      </Section>

      <Section title="The 4-Form Comparison Matrix">
        <p>The four normalization forms can be organized along two axes: canonical vs. compatibility decomposition, and whether recomposition is applied:</p>
        <Table headers={["", "Canonical only", "Canonical + Compatibility"]} rows={[
          ["Composed", "NFC", "NFKC"],
          ["Decomposed", "NFD", "NFKD"],
        ]} />
        <p className="mt-3">Here is how a single example character transforms under each form:</p>
        <Table headers={["Input", "NFC", "NFD", "NFKC", "NFKD"]} rows={[
          ["é (U+00E9)", "é (U+00E9)", "e◌́ (U+0065 U+0301)", "é (U+00E9)", "e◌́ (U+0065 U+0301)"],
          ["ﬁ (U+FB01)", "ﬁ (U+FB01)", "ﬁ (U+FB01)", "fi (U+0066 U+0069)", "fi (U+0066 U+0069)"],
          ["㍻ (U+337B)", "㍻ (U+337B)", "㍻ (U+337B)", "平成", "平成"],
          ["Å (U+00C5)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)"],
          ["Å (U+212B)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)"],
        ]} />
        <p className="mt-3">Notice the last two rows: U+00C5 (LATIN CAPITAL LETTER A WITH RING ABOVE) and U+212B (ANGSTROM SIGN) are canonically equivalent. NFC maps both to U+00C5, NFD maps both to U+0041 U+030A, and the compatibility forms follow the same pattern. This is a case where two distinct code points represent the same abstract character.</p>
        <div className="mt-4"><TryItButton text="ﬁﬄ" norm={true}>Inspect ligatures under normalization</TryItButton></div>
      </Section>

      <Section title="Practical Impact: Comparison, Databases, and Security">
        <p>Normalization issues surface in surprisingly many real-world systems:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>String comparison</strong>: Without normalization, <C>===</C> fails on visually identical strings. Always normalize before comparing user input.</li>
          <li><strong>Database uniqueness</strong>: A UNIQUE constraint on a username field will allow both <C>café</C> (NFC) and <C>café</C> (NFD) as separate entries. PostgreSQL and SQLite do not normalize by default.</li>
          <li><strong>Search and indexing</strong>: Elasticsearch and other search engines typically apply NFKC normalization in their analyzers to ensure <C>ﬁnd</C> matches <C>find</C>.</li>
          <li><strong>Security</strong>: Homoglyph attacks can exploit normalization differences. An attacker might register a domain using compatibility characters that normalize to a known brand name. NFKC is used in PRECIS (RFC 8264) for username and password preparation.</li>
          <li><strong>File systems</strong>: macOS HFS+ stores filenames in a modified NFD form, while most Linux systems store bytes as-is. Copying files between systems can create duplicates that look identical but differ at the byte level.</li>
        </ul>
        <CodeBlock>{`// Always normalize before comparing
function safeEquals(a: string, b: string): boolean {
  return a.normalize("NFC") === b.normalize("NFC");
}

// For search: use NFKC to catch compatibility variants
function normalizeForSearch(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

normalizeForSearch("ﬁnd");  // "find"
normalizeForSearch("㍻");   // "平成"`}</CodeBlock>
        <div className="mt-4"><TryItButton text="U+00C5 U+212B U+0041U+030A" norm={true}>Compare three ways to write Å</TryItButton></div>
      </Section>

      <Section title="When to Use Which Form">
        <p>Choosing the right normalization form depends on your use case:</p>
        <Table headers={["Use case", "Recommended form", "Why"]} rows={[
          ["Web content / HTML", "NFC", "W3C recommendation; smallest representation"],
          ["Database storage", "NFC", "Consistent canonical form; preserves formatting characters"],
          ["String comparison", "NFC or NFD", "Either works as long as both sides agree"],
          ["Search / indexing", "NFKC", "Catches ligatures, fullwidth, and other compatibility variants"],
          ["Username / password", "NFKC (PRECIS)", "RFC 8264 requires NFKC for identifier normalization"],
          ["Display / rendering", "Preserve original", "Do not normalize display text; you lose formatting intent"],
        ]} />
        <p className="mt-3">The golden rule: <strong>normalize early, normalize consistently</strong>. Pick one form for your system and apply it at the boundary where text enters. NFC is the safe default for most applications. Switch to NFKC only when you specifically need to collapse compatibility variants (search, security checks).</p>
        <p className="mt-3">Be cautious with NFKC/NFKD in contexts where formatting matters. Converting <C>㍻</C> (a single-character representation of the Japanese era name &ldquo;Heisei&rdquo;) to <C>平成</C> is helpful for search, but the original compact form carries distinct semantic meaning in Japanese typography. Similarly, converting <C>ﬁ</C> to <C>fi</C> is correct for search but may affect typographic rendering in some fonts.</p>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="問題: 「café」の2つのエンコード方法">
        <p>2台の異なるコンピュータで <C>café</C> と入力すると、画面上は同じに見えるにもかかわらず、まったく異なるバイト列が生成されることがあります。文字 <C>é</C> は単一のコードポイント U+00E9（LATIN SMALL LETTER E WITH ACUTE）としても、2つのコードポイント U+0065（e）+ U+0301（COMBINING ACUTE ACCENT）としても表現できます。</p>
        <p className="mt-3">つまり JavaScript では <C>{"'caf\\u00E9' === 'cafe\\u0301'"}</C> が <C>false</C> になります。両方の文字列がまったく同じに見えるにもかかわらずです。ファイルシステム、データベース、検索エンジンはすべてこの問題に直面します：同じ人間可読テキストが複数の有効なバイナリ表現を持ちうるのです。「café」を検索したユーザーが、別の形式で保存された結果を見逃す可能性があります。</p>
        <p className="mt-3">Unicode正規化はまさにこの問題を解決するために存在します。等価な表現間の変換を決定論的なアルゴリズムで定義し、同じに見えるテキストが実際に等しいと比較されることを保証します。</p>
        <div className="mt-4"><TryItButton text="café" norm={true}>café の NFC vs NFD を比較する</TryItButton></div>
      </Section>

      <Section title="正準等価性: NFC と NFD">
        <p>最も一般的な2つの正規化形式は<strong>正準等価性</strong>（canonical equivalence）を扱います。これはまったく同じ抽象文字を表すシーケンスのことです：</p>
        <Table headers={["形式", "名称", "戦略", "café"]} rows={[
          ["NFC", "正準分解 + 正準合成", "最少コードポイントに合成", "c a f é（4 CP）"],
          ["NFD", "正準分解", "基底文字 + 結合文字に分解", "c a f e ◌́（5 CP）"],
        ]} />
        <p className="mt-3"><strong>NFD</strong> はすべての合成済み文字を基底文字と結合マークに分解します。é（U+00E9）は e（U+0065）+ 結合アキュートアクセント（U+0301）になります。既に最も分解された形式にある文字はそのままです。NFDは<em>正準順序付け</em>（canonical ordering）も適用し、結合マークが決定論的な順序で出現することを保証します。</p>
        <p className="mt-3"><strong>NFC</strong> はまず完全なNFD分解を行い、次に正準合成規則で再合成します。結果として各文字が最少のコードポイントで表現されます。NFCはウェブで最も一般的な正規化形式です：W3CはすべてのWebコンテンツにNFCを推奨し、ほとんどの最新OSはデフォルトでNFCを使用します。注目すべき例外はmacOSで、HFS+ファイルシステムは歴史的にNFDの変種でファイル名を保存していました。</p>
        <CodeBlock>{`// NFC と NFD は同じ視覚的結果を生成する
const nfc = "caf\\u00E9";           // "café" — 4コードポイント
const nfd = "cafe\\u0301";          // "café" — 5コードポイント

nfc === nfd;                        // false!
nfc.normalize("NFC") === nfd.normalize("NFC");  // true
nfc.normalize("NFD") === nfd.normalize("NFD");  // true`}</CodeBlock>
      </Section>

      <Section title="互換等価性: NFKC と NFKD">
        <p>正準等価性を超えて、Unicodeは<strong>互換等価性</strong>（compatibility equivalence）を定義します。意味的に類似しているが同一ではない文字のことです。歴史的またはフォーマット上の理由で個別のコードポイントが割り当てられたものの、多くの実用的な目的では「同じ」と見なされる文字です。</p>
        <Table headers={["元の文字", "NFKC/NFKD の結果", "関係"]} rows={[
          ["ﬁ (U+FB01)", "fi", "合字 → 構成文字"],
          ["ﬄ (U+FB04)", "ffl", "合字 → 構成文字"],
          ["㍻ (U+337B)", "平成", "組文字 → 文字列"],
          ["㌔ (U+3314)", "キロ", "組文字 → 文字列"],
          ["㍑ (U+3351)", "リットル", "組文字 → 文字列"],
          ["① (U+2460)", "1", "囲み数字 → 数字"],
          ["Ｈ (U+FF28)", "H", "全角 → ASCII"],
          ["ℌ (U+210C)", "H", "記号文字 → 文字"],
        ]} />
        <p className="mt-3"><strong>NFKD</strong>（互換分解）は正準分解に加えて互換分解を実行し、合字、組文字、その他の互換文字を分解します。<strong>NFKC</strong>（互換分解 + 正準合成）は同じ分解を行った後、正準合成で再合成します。NFC を NFKD の後に適用したようなものです。</p>
        <p className="mt-3">互換正規化は不可逆です：<C>㍻</C> → <C>平成</C> → <C>㍻</C> のラウンドトリップは不可能です。元が単一の組文字だったという情報が NFKC/NFKD で失われるからです。互換正規化は検索やマッチングに使い、表示には元の形式を保持してください。</p>
        <div className="mt-4"><TryItButton text="㍻㌔㍑" norm={true}>日本語の組文字を分析する</TryItButton></div>
      </Section>

      <Section title="4つの正規化形式の比較マトリクス">
        <p>4つの正規化形式は、正準分解 vs 互換分解、および再合成の有無という2つの軸で整理できます：</p>
        <Table headers={["", "正準のみ", "正準 + 互換"]} rows={[
          ["合成", "NFC", "NFKC"],
          ["分解", "NFD", "NFKD"],
        ]} />
        <p className="mt-3">各形式で文字がどのように変換されるかの具体例：</p>
        <Table headers={["入力", "NFC", "NFD", "NFKC", "NFKD"]} rows={[
          ["é (U+00E9)", "é (U+00E9)", "e◌́ (U+0065 U+0301)", "é (U+00E9)", "e◌́ (U+0065 U+0301)"],
          ["ﬁ (U+FB01)", "ﬁ (U+FB01)", "ﬁ (U+FB01)", "fi (U+0066 U+0069)", "fi (U+0066 U+0069)"],
          ["㍻ (U+337B)", "㍻ (U+337B)", "㍻ (U+337B)", "平成", "平成"],
          ["Å (U+00C5)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)"],
          ["Å (U+212B)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)", "Å (U+00C5)", "A◌̊ (U+0041 U+030A)"],
        ]} />
        <p className="mt-3">最後の2行に注目してください：U+00C5（LATIN CAPITAL LETTER A WITH RING ABOVE）と U+212B（ANGSTROM SIGN）は正準等価です。NFC は両方を U+00C5 にマッピングし、NFD は両方を U+0041 U+030A にマッピングし、互換形式も同様のパターンに従います。2つの異なるコードポイントが同じ抽象文字を表すケースです。</p>
        <div className="mt-4"><TryItButton text="ﬁﬄ" norm={true}>合字の正規化を確認する</TryItButton></div>
      </Section>

      <Section title="実用的な影響: 文字列比較、データベース、セキュリティ">
        <p>正規化の問題は驚くほど多くの実世界のシステムで表面化します：</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>文字列比較</strong>: 正規化なしでは、見た目が同じ文字列でも <C>===</C> が失敗します。ユーザー入力の比較前には必ず正規化してください。</li>
          <li><strong>データベースの一意性</strong>: ユーザー名フィールドの UNIQUE 制約は、<C>café</C>（NFC）と <C>café</C>（NFD）を別のエントリとして許可してしまいます。PostgreSQL と SQLite はデフォルトで正規化を行いません。</li>
          <li><strong>検索とインデックス</strong>: Elasticsearch などの検索エンジンは通常、アナライザで NFKC 正規化を適用し、<C>ﬁnd</C> が <C>find</C> にマッチすることを保証します。</li>
          <li><strong>セキュリティ</strong>: ホモグリフ攻撃は正規化の差異を悪用できます。攻撃者が既知のブランド名に正規化される互換文字でドメインを登録する可能性があります。NFKC は PRECIS（RFC 8264）でユーザー名とパスワードの準備に使用されます。</li>
          <li><strong>ファイルシステム</strong>: macOS の HFS+ はファイル名を修正NFD形式で保存しますが、ほとんどの Linux システムはバイト列をそのまま保存します。システム間でファイルをコピーすると、見た目は同じだがバイトレベルで異なる重複が作られることがあります。</li>
        </ul>
        <CodeBlock>{`// 比較前に必ず正規化する
function safeEquals(a: string, b: string): boolean {
  return a.normalize("NFC") === b.normalize("NFC");
}

// 検索用: NFKC で互換バリアントを統一
function normalizeForSearch(s: string): string {
  return s.normalize("NFKC").toLowerCase();
}

normalizeForSearch("ﬁnd");  // "find"
normalizeForSearch("㍻");   // "平成"`}</CodeBlock>
        <div className="mt-4"><TryItButton text="U+00C5 U+212B U+0041U+030A" norm={true}>Å の3つの表現を比較する</TryItButton></div>
      </Section>

      <Section title="どの正規化形式をいつ使うか">
        <p>正しい正規化形式の選択はユースケースによって異なります：</p>
        <Table headers={["ユースケース", "推奨形式", "理由"]} rows={[
          ["Webコンテンツ / HTML", "NFC", "W3C推奨。最小のコードポイント表現"],
          ["データベース格納", "NFC", "一貫した正準形式。書式文字を保持"],
          ["文字列比較", "NFC または NFD", "双方が同じ形式であればどちらでも可"],
          ["検索 / インデックス", "NFKC", "合字、全角文字などの互換バリアントを統一"],
          ["ユーザー名 / パスワード", "NFKC (PRECIS)", "RFC 8264 が識別子の正規化に NFKC を要求"],
          ["表示 / レンダリング", "元の形式を保持", "表示テキストは正規化しない。書式の意図が失われる"],
        ]} />
        <p className="mt-3">黄金律は：<strong>早期に正規化し、一貫して正規化する</strong>。システムで1つの形式を選び、テキストが入力される境界で適用してください。ほとんどのアプリケーションでは NFC が安全なデフォルトです。互換バリアントを統合する必要がある場合（検索、セキュリティチェック）にのみ NFKC に切り替えてください。</p>
        <p className="mt-3">フォーマットが重要な文脈では NFKC/NFKD に注意が必要です。<C>㍻</C>（日本の元号「平成」の1文字表現）を <C>平成</C> に変換するのは検索には有用ですが、元のコンパクトな形式は日本語の組版で固有の意味を持ちます。同様に <C>ﬁ</C> を <C>fi</C> に変換するのは検索には正しいですが、一部のフォントでのタイポグラフィックレンダリングに影響する可能性があります。</p>
      </Section>
    </>
  );
}

export default function NormalizationContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

import TryItButton from "@/app/learn/components/TryItButton";
import LocaleSwitch from "@/app/learn/components/LocaleSwitch";

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
      <Section title="The BMP Boundary: U+FFFF">
        <p>When Unicode was first designed in the late 1980s, the consortium believed 65,536 code points (16 bits) would be enough for every character in every language. This original range &mdash; U+0000 to U+FFFF &mdash; is called the <strong>Basic Multilingual Plane (BMP)</strong>.</p>
        <p className="mt-3">They were wrong. As more scripts, historic characters, and eventually emoji were added, Unicode expanded to 17 planes totaling 1,114,112 code points (U+0000 to U+10FFFF). The 16 additional planes beyond the BMP are called <strong>Supplementary Planes</strong>. Characters in these planes have code points above U+FFFF and require a special encoding trick in UTF-16.</p>
        <Table headers={["Plane", "Range", "Name", "Example characters"]} rows={[
          ["0 (BMP)", "U+0000..U+FFFF", "Basic Multilingual Plane", "A, é, 漢, ♠"],
          ["1 (SMP)", "U+10000..U+1FFFF", "Supplementary Multilingual", "🌍, 𝄞, 𐐀"],
          ["2 (SIP)", "U+20000..U+2FFFF", "Supplementary Ideographic", "𠮟, 𠀀"],
          ["3-16", "U+30000..U+10FFFF", "Tertiary + unassigned", "𰀀 (Ext. G)"],
        ]} />
        <p className="mt-3">Languages like JavaScript, Java, and C# chose UTF-16 as their internal string encoding when 16 bits seemed sufficient. When Unicode outgrew 16 bits, these languages had to accommodate supplementary characters without changing their fundamental string type. The solution was surrogate pairs.</p>
        <div className="mt-4"><TryItButton text="🌍">Inspect 🌍 (above U+FFFF)</TryItButton></div>
      </Section>

      <Section title="How Surrogate Pairs Encode Supplementary Characters">
        <p>UTF-16 represents code points above U+FFFF using a pair of 16-bit code units called a <strong>surrogate pair</strong>. The algorithm is precise:</p>
        <CodeBlock>{`Given code point U (where U > 0xFFFF):

1. Subtract 0x10000:  U' = U - 0x10000
   (result is 0x00000 .. 0xFFFFF, exactly 20 bits)

2. Split into two 10-bit halves:
   High 10 bits: H = (U' >> 10) + 0xD800   → range 0xD800..0xDBFF
   Low 10 bits:  L = (U' & 0x3FF) + 0xDC00  → range 0xDC00..0xDFFF

Example: 🌍 = U+1F30D
   U' = 0x1F30D - 0x10000 = 0xF30D
   H  = (0xF30D >> 10) + 0xD800 = 0x3C + 0xD800 = 0xD83C
   L  = (0xF30D & 0x3FF) + 0xDC00 = 0x30D + 0xDC00 = 0xDF0D

So 🌍 in UTF-16: 0xD83C 0xDF0D`}</CodeBlock>
        <p className="mt-3">Unicode permanently reserved the range U+D800 to U+DFFF (2,048 code points) exclusively for surrogates. These values are not valid code points themselves &mdash; they exist only as encoding artifacts in UTF-16. The high surrogate (U+D800..U+DBFF) always comes first, followed by the low surrogate (U+DC00..U+DFFF).</p>
        <p className="mt-3">This means UTF-16 can encode all 1,112,064 valid Unicode code points: 63,488 BMP characters directly (65,536 minus the 2,048 surrogates), plus 1,048,576 supplementary characters via surrogate pairs (1,024 high surrogates x 1,024 low surrogates).</p>
        <div className="mt-4"><TryItButton text="𠮟">Inspect 𠮟 (CJK Extension B)</TryItButton></div>
      </Section>

      <Section title={'Why "🌍".length === 2 in JavaScript'}>
        <p>JavaScript strings are sequences of UTF-16 code units. The <C>.length</C> property counts these code units, not characters or code points:</p>
        <Table headers={["Expression", "Value", "Explanation"]} rows={[
          ['"A".length', "1", "BMP character = 1 code unit"],
          ['"漢".length', "1", "BMP character = 1 code unit"],
          ['"🌍".length', "2", "Supplementary = surrogate pair = 2 code units"],
          ['"🌍"[0]', '"\\uD83C"', "High surrogate (not a valid character)"],
          ['"🌍"[1]', '"\\uDF0D"', "Low surrogate (not a valid character)"],
          ['"🌍".charCodeAt(0)', "0xD83C", "High surrogate numeric value"],
          ['"🌍".codePointAt(0)', "0x1F30D", "Actual code point (ES6+)"],
        ]} />
        <p className="mt-3">This is not a &ldquo;bug&rdquo; &mdash; it is the fundamental reality of how JavaScript stores strings. Every string operation that uses index-based access (bracket notation, <C>charAt</C>, <C>charCodeAt</C>, <C>substring</C>, <C>slice</C>) operates on UTF-16 code units, not code points.</p>
        <p className="mt-3">ES6 introduced code-point-aware alternatives: <C>codePointAt()</C>, <C>String.fromCodePoint()</C>, and the string iterator (<C>[...str]</C> or <C>for...of</C>). These correctly handle surrogate pairs as single units.</p>
        <CodeBlock>{`// ES6 code point iteration
const str = "A🌍B";

// WRONG: index-based
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
// Output: "A", "\\uD83C", "\\uDF0D", "B"  (4 iterations, broken emoji)

// RIGHT: iterator-based
for (const ch of str) {
  console.log(ch);
}
// Output: "A", "🌍", "B"  (3 iterations, correct)`}</CodeBlock>
        <div className="mt-4"><TryItButton text="A🌍B">Inspect mixed BMP + supplementary</TryItButton></div>
      </Section>

      <Section title="Iterating Correctly Over Strings">
        <p>Here are the safe and unsafe ways to iterate over JavaScript strings containing surrogate pairs:</p>
        <Table headers={["Method", "Surrogate-safe?", "Notes"]} rows={[
          ["for (i=0; i<str.length; i++)", "No", "Iterates UTF-16 code units"],
          ["str.split('')", "No", "Splits at code unit boundaries"],
          ["for (const ch of str)", "Yes", "Uses string iterator (ES6)"],
          ["[...str]", "Yes", "Spread uses string iterator"],
          ["Array.from(str)", "Yes", "Uses string iterator"],
          ["str.match(/./gsu)", "Yes", "With 'u' flag, . matches code points"],
          ["Intl.Segmenter", "Yes", "Also handles grapheme clusters"],
        ]} />
        <p className="mt-3">The <C>u</C> flag on regular expressions is critical. Without it, <C>/./g</C> matches individual code units, splitting surrogate pairs. With <C>/./gu</C>, the dot matches full code points. Similarly, <C>{"\\u{1F30D}"}</C> syntax (requiring the <C>u</C> flag) lets you match supplementary characters directly in regex patterns.</p>
        <CodeBlock>{`// String reversal: a classic surrogate pair trap
const str = "A🌍B";

// WRONG: breaks surrogate pair
str.split('').reverse().join('');
// → "B\\uDF0D\\uD83C A" (corrupted, shows replacement chars)

// RIGHT: spread preserves pairs
[...str].reverse().join('');
// → "B🌍A" (correct)

// String length: count actual characters
[...str].length;  // 3 (correct)
str.length;       // 4 (counts code units)`}</CodeBlock>
        <div className="mt-4"><TryItButton text="🌍">Inspect surrogate pair structure</TryItButton></div>
      </Section>

      <Section title="Practical Bugs from Surrogate Pairs">
        <p>Surrogate pair bugs are among the most common Unicode issues in production software. Here are real-world scenarios:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Database truncation</strong>: A <C>VARCHAR(100)</C> column that counts UTF-16 code units will truncate <C>&quot;99 chars + 🌍&quot;</C> at the high surrogate, producing a lone surrogate that poisons downstream processing.</li>
          <li><strong>JSON encoding</strong>: Lone surrogates (<C>\uD83C</C> without a following low surrogate) are technically invalid in JSON per RFC 8259. Some parsers reject them; others silently produce U+FFFD.</li>
          <li><strong>Substring extraction</strong>: <C>str.substring(0, 3)</C> on <C>&quot;A🌍B&quot;</C> returns <C>&quot;A&quot;</C> + the high surrogate of 🌍 &mdash; a corrupted string that may render as <C>A&#xFFFD;</C>.</li>
          <li><strong>Twitter/SMS character limits</strong>: Twitter counts code points (not code units) for its character limit. A single emoji counts as 1 character toward the limit despite being <C>.length === 2</C> in JavaScript.</li>
          <li><strong>Cursor movement in text editors</strong>: Pressing the right arrow key should skip over both code units of a surrogate pair. Many custom text input implementations get this wrong, placing the cursor between the high and low surrogate.</li>
        </ul>
        <p className="mt-3">The safest approach: always use code-point-aware APIs (<C>for...of</C>, <C>codePointAt</C>, <C>String.fromCodePoint</C>) when processing text, and use <C>Intl.Segmenter</C> when counting user-visible characters.</p>
        <CodeBlock>{`// Safe substring that never splits surrogate pairs
function safeSubstring(str, start, end) {
  const chars = [...str];
  return chars.slice(start, end).join('');
}

safeSubstring("A🌍B", 0, 2); // "A🌍" (correct)
"A🌍B".substring(0, 2);      // "A\\uD83C" (broken!)

// Detect if a string contains lone surrogates
function hasLoneSurrogates(str) {
  return /[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?<![\\uD800-\\uDBFF])[\\uDC00-\\uDFFF]/.test(str);
}`}</CodeBlock>
        <div className="mt-4"><TryItButton text="A🌍B">Inspect A🌍B in the viewer</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="BMP の境界: U+FFFF">
        <p>Unicode が 1980 年代後半に設計された当初、コンソーシアムは 65,536 個のコードポイント（16 ビット）ですべての言語のすべての文字を収容できると考えていました。この元の範囲 &mdash; U+0000 から U+FFFF &mdash; を<strong>基本多言語面（BMP: Basic Multilingual Plane）</strong>と呼びます。</p>
        <p className="mt-3">しかし、それは誤りでした。より多くの文字体系、歴史的文字、そして絵文字が追加されるにつれ、Unicode は 17 面・合計 1,114,112 コードポイント（U+0000〜U+10FFFF）に拡張されました。BMP を超える 16 の追加面を<strong>補助面（Supplementary Planes）</strong>と呼びます。これらの面の文字は U+FFFF を超えるコードポイントを持ち、UTF-16 では特殊なエンコーディング手法が必要です。</p>
        <Table headers={["面", "範囲", "名称", "文字例"]} rows={[
          ["0 (BMP)", "U+0000..U+FFFF", "基本多言語面", "A, é, 漢, ♠"],
          ["1 (SMP)", "U+10000..U+1FFFF", "追加多言語面", "🌍, 𝄞, 𐐀"],
          ["2 (SIP)", "U+20000..U+2FFFF", "追加漢字面", "𠮟, 𠀀"],
          ["3-16", "U+30000..U+10FFFF", "第三漢字面 + 未割当", "𰀀 (拡張G)"],
        ]} />
        <p className="mt-3">JavaScript、Java、C# は 16 ビットで十分と思われていた時代に UTF-16 を内部文字列エンコーディングとして採用しました。Unicode が 16 ビットを超えた際、これらの言語は基本的な文字列型を変更せずに補助文字に対応する必要がありました。その解決策がサロゲートペアです。</p>
        <div className="mt-4"><TryItButton text="🌍">🌍 を分析する（U+FFFF 超）</TryItButton></div>
      </Section>

      <Section title="サロゲートペアによる補助文字のエンコード">
        <p>UTF-16 は U+FFFF を超えるコードポイントを、<strong>サロゲートペア</strong>と呼ばれる 16 ビットコードユニットのペアで表現します。アルゴリズムは厳密に定義されています:</p>
        <CodeBlock>{`コードポイント U が与えられたとき（U > 0xFFFF の場合）:

1. 0x10000 を減算:  U' = U - 0x10000
   (結果は 0x00000 .. 0xFFFFF、ちょうど20ビット)

2. 10ビットずつ2つに分割:
   上位10ビット: H = (U' >> 10) + 0xD800   → 範囲 0xD800..0xDBFF
   下位10ビット: L = (U' & 0x3FF) + 0xDC00  → 範囲 0xDC00..0xDFFF

例: 🌍 = U+1F30D
   U' = 0x1F30D - 0x10000 = 0xF30D
   H  = (0xF30D >> 10) + 0xD800 = 0x3C + 0xD800 = 0xD83C
   L  = (0xF30D & 0x3FF) + 0xDC00 = 0x30D + 0xDC00 = 0xDF0D

🌍 の UTF-16 表現: 0xD83C 0xDF0D`}</CodeBlock>
        <p className="mt-3">Unicode は U+D800 から U+DFFF の範囲（2,048 コードポイント）をサロゲート専用として永久に予約しています。これらの値自体は有効なコードポイントではなく、UTF-16 のエンコーディング上の産物としてのみ存在します。上位サロゲート（U+D800..U+DBFF）が必ず先に来て、下位サロゲート（U+DC00..U+DFFF）が続きます。</p>
        <p className="mt-3">これにより UTF-16 は有効な Unicode コードポイント全 1,112,064 個をエンコードできます: BMP の 63,488 文字を直接（65,536 からサロゲート 2,048 を除外）、さらにサロゲートペアで 1,048,576 の補助文字（上位 1,024 x 下位 1,024）。</p>
        <div className="mt-4"><TryItButton text="𠮟">𠮟 を分析する（CJK 拡張B）</TryItButton></div>
      </Section>

      <Section title={'なぜ "🌍".length === 2 なのか'}>
        <p>JavaScript の文字列は UTF-16 コードユニットの列です。<C>.length</C> プロパティはこのコードユニット数を返すのであって、文字数やコードポイント数ではありません:</p>
        <Table headers={["式", "値", "説明"]} rows={[
          ['"A".length', "1", "BMP 文字 = 1 コードユニット"],
          ['"漢".length', "1", "BMP 文字 = 1 コードユニット"],
          ['"🌍".length', "2", "補助文字 = サロゲートペア = 2 コードユニット"],
          ['"🌍"[0]', '"\\uD83C"', "上位サロゲート（有効な文字ではない）"],
          ['"🌍"[1]', '"\\uDF0D"', "下位サロゲート（有効な文字ではない）"],
          ['"🌍".charCodeAt(0)', "0xD83C", "上位サロゲートの数値"],
          ['"🌍".codePointAt(0)', "0x1F30D", "実際のコードポイント（ES6+）"],
        ]} />
        <p className="mt-3">これは「バグ」ではなく、JavaScript が文字列を格納する根本的な仕組みです。インデックスベースのアクセスを使うすべての文字列操作（ブラケット記法、<C>charAt</C>、<C>charCodeAt</C>、<C>substring</C>、<C>slice</C>）は、コードポイントではなく UTF-16 コードユニット単位で動作します。</p>
        <p className="mt-3">ES6 でコードポイント対応の代替手段が導入されました: <C>codePointAt()</C>、<C>String.fromCodePoint()</C>、文字列イテレータ（<C>[...str]</C> や <C>for...of</C>）。これらはサロゲートペアを正しく 1 つの単位として処理します。</p>
        <CodeBlock>{`// ES6 コードポイント反復
const str = "A🌍B";

// 間違い: インデックスベース
for (let i = 0; i < str.length; i++) {
  console.log(str[i]);
}
// 出力: "A", "\\uD83C", "\\uDF0D", "B"  (4回、絵文字が壊れる)

// 正解: イテレータベース
for (const ch of str) {
  console.log(ch);
}
// 出力: "A", "🌍", "B"  (3回、正しい)`}</CodeBlock>
        <div className="mt-4"><TryItButton text="A🌍B">BMP + 補助文字の混在を分析する</TryItButton></div>
      </Section>

      <Section title="文字列の正しい反復処理">
        <p>サロゲートペアを含む JavaScript 文字列を安全に / 非安全に反復する方法を比較します:</p>
        <Table headers={["メソッド", "サロゲート安全?", "備考"]} rows={[
          ["for (i=0; i<str.length; i++)", "No", "UTF-16 コードユニット単位で反復"],
          ["str.split('')", "No", "コードユニット境界で分割"],
          ["for (const ch of str)", "Yes", "文字列イテレータを使用（ES6）"],
          ["[...str]", "Yes", "スプレッドは文字列イテレータを使用"],
          ["Array.from(str)", "Yes", "文字列イテレータを使用"],
          ["str.match(/./gsu)", "Yes", "'u' フラグで . がコードポイントにマッチ"],
          ["Intl.Segmenter", "Yes", "書記素クラスタも処理可能"],
        ]} />
        <p className="mt-3">正規表現の <C>u</C> フラグは極めて重要です。なしの場合、<C>/./g</C> は個々のコードユニットにマッチし、サロゲートペアを分断します。<C>/./gu</C> にすると、ドットはコードポイント全体にマッチします。同様に、<C>{`\\u{1F30D}`}</C> 構文（<C>u</C> フラグが必要）により、正規表現パターン内で補助文字を直接マッチできます。</p>
        <CodeBlock>{`// 文字列反転: サロゲートペアの典型的な落とし穴
const str = "A🌍B";

// 間違い: サロゲートペアが壊れる
str.split('').reverse().join('');
// → "B\\uDF0D\\uD83CA" (破損、置換文字が表示される)

// 正解: スプレッドでペアを保持
[...str].reverse().join('');
// → "B🌍A" (正しい)

// 文字列長: 実際の文字数をカウント
[...str].length;  // 3 (正しい)
str.length;       // 4 (コードユニットを数えている)`}</CodeBlock>
        <div className="mt-4"><TryItButton text="🌍">サロゲートペアの構造を分析する</TryItButton></div>
      </Section>

      <Section title="サロゲートペアに起因する実際のバグ">
        <p>サロゲートペアのバグは、本番ソフトウェアで最もよく見られる Unicode 問題の一つです。実際のシナリオを紹介します:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>データベースの切り詰め</strong>: UTF-16 コードユニット数でカウントする <C>VARCHAR(100)</C> カラムは、<C>&quot;99文字 + 🌍&quot;</C> を上位サロゲートで切断し、孤立サロゲートが後続処理を破壊します。</li>
          <li><strong>JSON エンコーディング</strong>: 孤立サロゲート（<C>\uD83C</C> が下位サロゲートなしで出現）は RFC 8259 上は無効な JSON です。パーサーによっては拒否され、他は U+FFFD に置換されます。</li>
          <li><strong>部分文字列の抽出</strong>: <C>&quot;A🌍B&quot;</C> に対する <C>str.substring(0, 3)</C> は <C>&quot;A&quot;</C> + 🌍 の上位サロゲートを返し、破損した文字列（<C>A&#xFFFD;</C> と表示される可能性）になります。</li>
          <li><strong>Twitter/SMS の文字数制限</strong>: Twitter はコードポイント数（コードユニット数ではなく）で文字数をカウントします。絵文字 1 つは制限に対して 1 文字ですが、JavaScript の <C>.length</C> では 2 です。</li>
          <li><strong>テキストエディタのカーソル移動</strong>: 右矢印キーはサロゲートペアの両方のコードユニットをスキップすべきです。多くのカスタムテキスト入力実装がこれを誤り、上位・下位サロゲートの間にカーソルを置いてしまいます。</li>
        </ul>
        <p className="mt-3">最も安全なアプローチ: テキスト処理には常にコードポイント対応 API（<C>for...of</C>、<C>codePointAt</C>、<C>String.fromCodePoint</C>）を使い、ユーザーに見える文字をカウントする場合は <C>Intl.Segmenter</C> を使用することです。</p>
        <CodeBlock>{`// サロゲートペアを分断しない安全な substring
function safeSubstring(str, start, end) {
  const chars = [...str];
  return chars.slice(start, end).join('');
}

safeSubstring("A🌍B", 0, 2); // "A🌍" (正しい)
"A🌍B".substring(0, 2);      // "A\\uD83C" (壊れている!)

// 文字列に孤立サロゲートが含まれるか検出
function hasLoneSurrogates(str) {
  return /[\\uD800-\\uDBFF](?![\\uDC00-\\uDFFF])|(?<![\\uD800-\\uDBFF])[\\uDC00-\\uDFFF]/.test(str);
}`}</CodeBlock>
        <div className="mt-4"><TryItButton text="A🌍B">A🌍B をビューアで分析する</TryItButton></div>
      </Section>
    </>
  );
}

export default function SurrogatePairsContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

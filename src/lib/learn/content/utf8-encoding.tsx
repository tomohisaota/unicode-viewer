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
      <Section title="The Four Ranges of UTF-8">
        <p>UTF-8 is a variable-length encoding that represents every Unicode code point using 1 to 4 bytes. The number of bytes depends on the code point range:</p>
        <Table headers={["Bytes", "Code point range", "Leading byte pattern", "Total bits for CP"]} rows={[
          ["1", "U+0000 .. U+007F", "0xxxxxxx", "7"],
          ["2", "U+0080 .. U+07FF", "110xxxxx 10xxxxxx", "11"],
          ["3", "U+0800 .. U+FFFF", "1110xxxx 10xxxxxx 10xxxxxx", "16"],
          ["4", "U+10000 .. U+10FFFF", "11110xxx 10xxxxxx 10xxxxxx 10xxxxxx", "21"],
        ]} />
        <p className="mt-3">The first 128 code points (ASCII) use a single byte identical to ASCII itself. This backward compatibility was a deliberate design decision by Ken Thompson and Rob Pike &mdash; any valid ASCII file is automatically valid UTF-8.</p>
        <p className="mt-3">The 2-byte range covers Latin extended characters, Greek, Cyrillic, Arabic, and Hebrew. Most European languages fit entirely within 1-2 bytes per character.</p>
        <div className="mt-4"><TryItButton text="A">Inspect ASCII character A</TryItButton></div>
      </Section>

      <Section title="Bit-Level Anatomy of UTF-8">
        <p>Let&apos;s trace exactly how a code point becomes bytes. Take <C>e&#769;</C> (U+00E9, Latin small letter e with acute), which falls in the 2-byte range (U+0080..U+07FF):</p>
        <CodeBlock>{`U+00E9 in binary: 000 1110 1001  (11 bits)

Split into groups:    [00011] [101001]
Insert into template: 110xxxxx 10xxxxxx
Result:               11000011 10101001
Hex:                  0xC3     0xA9`}</CodeBlock>
        <p className="mt-3">Now consider <C>&#28450;</C> (U+6F22, CJK ideograph), which falls in the 3-byte range:</p>
        <CodeBlock>{`U+6F22 in binary: 0110 1111 0010 0010  (16 bits)

Split into groups:    [0110] [111100] [100010]
Insert into template: 1110xxxx 10xxxxxx 10xxxxxx
Result:               11100110 10111100 10100010
Hex:                  0xE6     0xBC     0xA2`}</CodeBlock>
        <p className="mt-3">The key insight: the leading byte&apos;s high bits tell the decoder exactly how many bytes follow. A byte starting with <C>0</C> is a standalone ASCII byte. A byte starting with <C>110</C> means &ldquo;read 1 more continuation byte.&rdquo; Starting with <C>1110</C> means &ldquo;read 2 more.&rdquo; And <C>11110</C> means &ldquo;read 3 more.&rdquo; Continuation bytes always start with <C>10</C>.</p>
        <div className="mt-4"><TryItButton text="é">Inspect é (2-byte character)</TryItButton></div>
      </Section>

      <Section title="Why CJK = 3 Bytes and Emoji = 4 Bytes">
        <p>One of the most common questions: why do Chinese, Japanese, and Korean characters take 3 bytes in UTF-8? The answer lies in code point allocation:</p>
        <Table headers={["Script", "Range", "UTF-8 bytes", "Example"]} rows={[
          ["ASCII / Latin basic", "U+0000..U+007F", "1 byte", "A = 0x41"],
          ["Latin extended / Cyrillic", "U+0080..U+07FF", "2 bytes", "é = 0xC3 0xA9"],
          ["CJK Ideographs", "U+4E00..U+9FFF", "3 bytes", "漢 = 0xE6 0xBC 0xA2"],
          ["Emoji / SMP", "U+10000..U+10FFFF", "4 bytes", "🌍 = 0xF0 0x9F 0x8C 0x8D"],
        ]} />
        <p className="mt-3">The CJK Unified Ideographs block spans U+4E00 to U+9FFF (over 20,000 characters), placing them squarely in the 3-byte zone. This means a Chinese or Japanese text file in UTF-8 is roughly 50% larger than the same file in a dedicated CJK encoding like GB2312 or Shift_JIS (which use 2 bytes per character).</p>
        <p className="mt-3">Emoji live in the Supplementary Multilingual Plane (U+1F000 and above), which requires 4 bytes. A single emoji like <C>🌍</C> (U+1F30D) takes 4 bytes in UTF-8, 4 bytes in UTF-32, but only 2 bytes worth of &ldquo;logical space&rdquo; as a surrogate pair in UTF-16.</p>
        <div className="mt-4"><TryItButton text="漢">Inspect 漢 (3-byte CJK character)</TryItButton></div>
      </Section>

      <Section title="Self-Synchronizing: UTF-8's Killer Feature">
        <p>UTF-8 has a remarkable property: you can jump to any arbitrary byte in a stream and determine whether you are at the start of a character or in the middle of one. This is called <strong>self-synchronization</strong>.</p>
        <p className="mt-3">The rules are simple: if a byte starts with <C>0</C>, it&apos;s a single-byte character. If it starts with <C>10</C>, it&apos;s a continuation byte &mdash; scan backward to find the leading byte. If it starts with <C>11</C>, it&apos;s the leading byte of a multi-byte sequence.</p>
        <CodeBlock>{`Byte pattern    Meaning
0xxxxxxx        Single-byte character (ASCII)
10xxxxxx        Continuation byte (never a start)
110xxxxx        Start of 2-byte sequence
1110xxxx        Start of 3-byte sequence
11110xxx        Start of 4-byte sequence`}</CodeBlock>
        <p className="mt-3">This design means that if a single byte is corrupted or lost, at most one character is destroyed &mdash; the decoder can resynchronize at the next leading byte. Compare this with Shift_JIS, where losing a single byte can cause all subsequent characters to be misinterpreted (the &ldquo;mojibake cascade&rdquo; problem).</p>
        <p className="mt-3">Another benefit: you can search for an ASCII substring (like <C>/</C> in a file path) using simple byte comparison without any risk of false matches inside multi-byte characters. This is impossible with Shift_JIS, where a trail byte can coincidentally equal an ASCII byte value (e.g., the infamous 0x5C backslash problem).</p>
        <div className="mt-4"><TryItButton text="🌍">Inspect 🌍 (4-byte emoji)</TryItButton></div>
      </Section>

      <Section title="UTF-8 vs UTF-16: Size Comparison">
        <p>Which encoding is more space-efficient depends entirely on the content:</p>
        <Table headers={["Content type", "UTF-8 bytes", "UTF-16 bytes", "Winner"]} rows={[
          ["ASCII text (English code)", "1 per char", "2 per char", "UTF-8 (50% smaller)"],
          ["European text (Latin ext.)", "1-2 per char", "2 per char", "UTF-8 (slightly smaller)"],
          ["CJK text (Chinese/Japanese)", "3 per char", "2 per char", "UTF-16 (33% smaller)"],
          ["Emoji-heavy text", "4 per char", "4 per char (surrogate)", "Tie"],
          ["Mixed (HTML with CJK)", "~2.2 avg", "2 per char (+ BOM)", "Close to tie"],
        ]} />
        <p className="mt-3">For web content, UTF-8 almost always wins because HTML markup, CSS, JavaScript, and URLs are ASCII-heavy. Even a Japanese web page has so much ASCII in its markup that UTF-8 tends to be comparable or smaller than UTF-16. This is one reason the WHATWG HTML specification mandates UTF-8 as the default encoding.</p>
        <p className="mt-3">UTF-16 retains an advantage for in-memory string processing of CJK-heavy text (which is why Java, JavaScript, and Windows chose it as their internal string format in the 1990s). However, for storage and network transfer, UTF-8 has become the universal standard &mdash; over 98% of web pages use UTF-8 as of 2024.</p>
        <CodeBlock>{`// Quick size comparison in Node.js:
const text = "漢字とASCII mixed テキスト";
console.log(Buffer.byteLength(text, "utf8"));  // 39 bytes
console.log(Buffer.byteLength(text, "utf16le")); // 36 bytes
// UTF-16 wins slightly for CJK-heavy mixed text

const code = "function hello() { return 42; }";
console.log(Buffer.byteLength(code, "utf8"));  // 31 bytes
console.log(Buffer.byteLength(code, "utf16le")); // 62 bytes
// UTF-8 wins decisively for ASCII`}</CodeBlock>
        <div className="mt-4"><TryItButton text="🌍">Try the globe emoji in the viewer</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="UTF-8 の 4 つのバイト範囲">
        <p>UTF-8 は可変長エンコーディングで、すべての Unicode コードポイントを 1〜4 バイトで表現します。バイト数はコードポイントの範囲で決まります:</p>
        <Table headers={["バイト数", "コードポイント範囲", "先頭バイトパターン", "CP用ビット数"]} rows={[
          ["1", "U+0000 .. U+007F", "0xxxxxxx", "7"],
          ["2", "U+0080 .. U+07FF", "110xxxxx 10xxxxxx", "11"],
          ["3", "U+0800 .. U+FFFF", "1110xxxx 10xxxxxx 10xxxxxx", "16"],
          ["4", "U+10000 .. U+10FFFF", "11110xxx 10xxxxxx 10xxxxxx 10xxxxxx", "21"],
        ]} />
        <p className="mt-3">最初の 128 コードポイント（ASCII）は ASCII と同一の 1 バイトで表現されます。この後方互換性は Ken Thompson と Rob Pike による意図的な設計判断でした。有効な ASCII ファイルはそのまま有効な UTF-8 ファイルです。</p>
        <p className="mt-3">2 バイト範囲はラテン拡張文字、ギリシャ文字、キリル文字、アラビア文字、ヘブライ文字をカバーします。ほとんどのヨーロッパ言語は 1〜2 バイト/文字に収まります。</p>
        <div className="mt-4"><TryItButton text="A">ASCII 文字 A を分析する</TryItButton></div>
      </Section>

      <Section title="ビットレベルの UTF-8 解剖">
        <p>コードポイントがどのようにバイト列になるか、正確にたどってみましょう。<C>e&#769;</C>（U+00E9、アキュートアクセント付き e）は 2 バイト範囲（U+0080..U+07FF）に該当します:</p>
        <CodeBlock>{`U+00E9 のバイナリ: 000 1110 1001  (11ビット)

グループに分割:      [00011] [101001]
テンプレートに挿入:  110xxxxx 10xxxxxx
結果:                11000011 10101001
16進数:              0xC3     0xA9`}</CodeBlock>
        <p className="mt-3">次に <C>&#28450;</C>（U+6F22、CJK 統合漢字）を見ましょう。3 バイト範囲に該当します:</p>
        <CodeBlock>{`U+6F22 のバイナリ: 0110 1111 0010 0010  (16ビット)

グループに分割:      [0110] [111100] [100010]
テンプレートに挿入:  1110xxxx 10xxxxxx 10xxxxxx
結果:                11100110 10111100 10100010
16進数:              0xE6     0xBC     0xA2`}</CodeBlock>
        <p className="mt-3">重要なポイント: 先頭バイトの上位ビットが、後続バイト数を正確に示します。<C>0</C> で始まれば単独の ASCII バイト。<C>110</C> で始まれば「あと 1 バイト続く」。<C>1110</C> は「あと 2 バイト」。<C>11110</C> は「あと 3 バイト」。継続バイトは必ず <C>10</C> で始まります。</p>
        <div className="mt-4"><TryItButton text="é">é を分析する（2バイト文字）</TryItButton></div>
      </Section>

      <Section title="なぜ CJK は 3 バイト、絵文字は 4 バイトなのか">
        <p>よくある疑問: なぜ日中韓の漢字は UTF-8 で 3 バイト必要なのか？ 答えはコードポイントの配置にあります:</p>
        <Table headers={["文字種", "範囲", "UTF-8 バイト数", "例"]} rows={[
          ["ASCII / 基本ラテン", "U+0000..U+007F", "1 バイト", "A = 0x41"],
          ["ラテン拡張 / キリル", "U+0080..U+07FF", "2 バイト", "é = 0xC3 0xA9"],
          ["CJK 統合漢字", "U+4E00..U+9FFF", "3 バイト", "漢 = 0xE6 0xBC 0xA2"],
          ["絵文字 / SMP", "U+10000..U+10FFFF", "4 バイト", "🌍 = 0xF0 0x9F 0x8C 0x8D"],
        ]} />
        <p className="mt-3">CJK 統合漢字ブロックは U+4E00 から U+9FFF まで（2 万文字以上）あり、完全に 3 バイトゾーンに収まります。つまり、中国語や日本語のテキストは UTF-8 では、GB2312 や Shift_JIS（1 文字 2 バイト）と比べて約 50% サイズが大きくなります。</p>
        <p className="mt-3">絵文字は追加多言語面（U+1F000 以降）にあるため、4 バイト必要です。<C>🌍</C>（U+1F30D）1 つで UTF-8 は 4 バイト、UTF-32 も 4 バイト、UTF-16 ではサロゲートペアとして 4 バイト（2 つの 16 ビットユニット）です。</p>
        <div className="mt-4"><TryItButton text="漢">漢を分析する（3バイトの CJK 文字）</TryItButton></div>
      </Section>

      <Section title="自己同期: UTF-8 最大の強み">
        <p>UTF-8 には注目すべき特性があります: バイト列の任意の位置にジャンプしても、そこが文字の先頭か途中かを即座に判定できます。これを<strong>自己同期（self-synchronization）</strong>と呼びます。</p>
        <p className="mt-3">ルールは単純です: バイトが <C>0</C> で始まれば 1 バイト文字。<C>10</C> で始まれば継続バイトなので、先頭バイトを見つけるまで後退。<C>11</C> で始まればマルチバイト列の先頭バイトです。</p>
        <CodeBlock>{`バイトパターン    意味
0xxxxxxx        1バイト文字（ASCII）
10xxxxxx        継続バイト（開始位置にはならない）
110xxxxx        2バイト列の先頭
1110xxxx        3バイト列の先頭
11110xxx        4バイト列の先頭`}</CodeBlock>
        <p className="mt-3">この設計により、1 バイトが破損・欠落しても壊れるのは最大 1 文字だけです。デコーダは次の先頭バイトで再同期できます。Shift_JIS と比較すると、Shift_JIS では 1 バイトの欠落が後続の全文字を誤解釈させる可能性があります（「文字化けの連鎖」問題）。</p>
        <p className="mt-3">もう一つの利点: ファイルパスの <C>/</C> のような ASCII 部分文字列を単純なバイト比較で検索でき、マルチバイト文字の内部で誤マッチする危険がありません。Shift_JIS ではこれが不可能です &mdash; 後続バイトが偶然 ASCII バイト値と一致することがあるためです（有名な 0x5C バックスラッシュ問題）。</p>
        <div className="mt-4"><TryItButton text="🌍">🌍 を分析する（4バイト絵文字）</TryItButton></div>
      </Section>

      <Section title="UTF-8 と UTF-16 のサイズ比較">
        <p>どちらのエンコーディングが効率的かは、コンテンツの内容次第です:</p>
        <Table headers={["コンテンツ種別", "UTF-8 バイト数", "UTF-16 バイト数", "有利な方"]} rows={[
          ["ASCII テキスト（英語コード）", "1/文字", "2/文字", "UTF-8（50% 小さい）"],
          ["ヨーロッパ語テキスト", "1-2/文字", "2/文字", "UTF-8（やや小さい）"],
          ["CJK テキスト（中国語/日本語）", "3/文字", "2/文字", "UTF-16（33% 小さい）"],
          ["絵文字多めテキスト", "4/文字", "4/文字（サロゲート）", "同等"],
          ["混在（HTML + CJK）", "~2.2 平均", "2/文字（+ BOM）", "ほぼ同等"],
        ]} />
        <p className="mt-3">Web コンテンツでは UTF-8 がほぼ常に有利です。HTML マークアップ、CSS、JavaScript、URL は ASCII が大部分を占めるためです。日本語の Web ページでも、マークアップの ASCII 部分が多いため、UTF-8 のサイズは UTF-16 と同等かそれ以下になります。WHATWG HTML 仕様が UTF-8 をデフォルトエンコーディングに定めているのもこの理由です。</p>
        <p className="mt-3">UTF-16 は CJK 中心のテキストのメモリ内文字列処理では優位性を保ちます（Java、JavaScript、Windows が 1990 年代に内部文字列形式として採用した理由）。しかし保存やネットワーク転送では UTF-8 が事実上の標準となり、2024 年時点で Web ページの 98% 以上が UTF-8 を使用しています。</p>
        <CodeBlock>{`// Node.js でのサイズ比較:
const text = "漢字とASCII mixed テキスト";
console.log(Buffer.byteLength(text, "utf8"));    // 39 バイト
console.log(Buffer.byteLength(text, "utf16le")); // 36 バイト
// CJK 混在テキストでは UTF-16 がやや有利

const code = "function hello() { return 42; }";
console.log(Buffer.byteLength(code, "utf8"));    // 31 バイト
console.log(Buffer.byteLength(code, "utf16le")); // 62 バイト
// ASCII では UTF-8 が圧勝`}</CodeBlock>
        <div className="mt-4"><TryItButton text="🌍">🌍 をビューアで試す</TryItButton></div>
      </Section>
    </>
  );
}

export default function Utf8EncodingContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

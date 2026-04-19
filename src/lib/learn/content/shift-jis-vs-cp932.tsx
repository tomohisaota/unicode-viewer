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
      <Section title="Historical Context: How Two Encodings Diverged">
        <p>Shift_JIS was created in 1982 as a collaboration between ASCII Corporation and Microsoft to encode Japanese characters on personal computers. It cleverly interleaves single-byte ASCII-compatible characters with double-byte JIS X 0208 characters, avoiding conflicts with existing control codes.</p>
        <p className="mt-3">Microsoft adopted Shift_JIS for MS-DOS and Windows but gradually extended it with additional characters that customers demanded. This extended version was internally called &ldquo;Code Page 932&rdquo; (CP932), later standardized by IANA as <C>Windows-31J</C>. The problem: Microsoft never clearly distinguished their extensions from the original standard, and the name &ldquo;Shift_JIS&rdquo; became ambiguous.</p>
        <Table headers={["Name", "Standard body", "Base", "Extensions"]} rows={[
          ["Shift_JIS", "JIS (JIS X 0208)", "JIS X 0201 + JIS X 0208", "None"],
          ["CP932 / Windows-31J", "Microsoft / IANA", "Shift_JIS", "NEC specials, NEC selection of IBM, IBM extensions"],
          ["Shift_JIS-2004", "JIS (JIS X 0213)", "JIS X 0201 + JIS X 0213", "4th-level kanji"],
        ]} />
        <p className="mt-3">In practice, when software claims to use &ldquo;Shift_JIS,&rdquo; it almost always means CP932. The pure JIS-standard Shift_JIS is rarely encountered in the wild. This creates a persistent source of confusion in encoding detection and conversion.</p>
        <div className="mt-4"><TryItButton text="①">Inspect ① (CP932 extension)</TryItButton></div>
      </Section>

      <Section title="Row Coverage Comparison">
        <p>Shift_JIS and CP932 share the same fundamental structure: single-byte characters (0x00-0x7F and 0xA1-0xDF for half-width katakana) plus double-byte characters arranged in &ldquo;rows&rdquo; (ku) and &ldquo;cells&rdquo; (ten) from JIS X 0208. The difference lies in which rows are populated:</p>
        <Table headers={["Row (ku)", "Shift_JIS (JIS X 0208)", "CP932 (Windows-31J)"]} rows={[
          ["1-8", "Symbols, numerals, Latin, kana", "Same"],
          ["9-12", "Unassigned", "Unassigned"],
          ["13", "Unassigned", "NEC special characters (①②③ etc.)"],
          ["14", "Unassigned", "Unassigned"],
          ["15", "Unassigned", "Unassigned"],
          ["16-84", "JIS Level 1+2 kanji", "Same"],
          ["85-88", "Unassigned", "Unassigned"],
          ["89-92", "Unassigned", "NEC selection of IBM extensions"],
          ["93-94", "Unassigned", "Unassigned"],
          ["95-120", "Not in JIS X 0208", "IBM extensions (user-defined area)"],
        ]} />
        <p className="mt-3">The core rows 1-8 and 16-84 are identical between the two encodings. The divergence occurs in the &ldquo;gaps&rdquo; &mdash; rows that JIS X 0208 left unassigned but Microsoft filled with vendor extensions. This is why most everyday Japanese text works identically in both encodings, but certain special characters fail when a strict Shift_JIS decoder encounters CP932-only characters.</p>
        <div className="mt-4"><TryItButton text="高髙">Inspect standard vs extended kanji</TryItButton></div>
      </Section>

      <Section title="NEC Special Characters (Row 13)">
        <p>Row 13 is the most notorious CP932 extension. NEC introduced these characters for their PC-9801 series in the 1980s, and Microsoft incorporated them into CP932. They include circled numbers, Roman numerals, unit symbols, and other frequently requested characters:</p>
        <Table headers={["Byte range", "Characters", "Unicode mapping"]} rows={[
          ["0x8740-0x875D", "①②③...⑳", "U+2460-U+2473"],
          ["0x875F-0x8775", "Ⅰ Ⅱ Ⅲ ... Ⅹ ⅰ ⅱ ⅲ ... ⅹ", "U+2160-U+2179"],
          ["0x8780-0x878F", "㍉ ㌔ ㌢ ㍍ ㌘ ㌧ ㌃ ㌶ etc.", "U+3349, U+3314, ..."],
          ["0x8790-0x879C", "㍻ ㍼ ㍽ ㍾ (era names)", "U+337B-U+337E"],
        ]} />
        <p className="mt-3">These characters are absent from standard Shift_JIS. A document containing <C>①</C> (circled digit one, byte 0x8740) will decode perfectly in CP932 but produce an error or replacement character in a strict Shift_JIS decoder. This is the single most common cause of encoding issues when exchanging Japanese text between Windows and Unix/Mac systems.</p>
        <p className="mt-3">The circled numbers are especially problematic because they are extensively used in Japanese business documents, legal texts, and everyday writing. Users are often shocked to learn that these &ldquo;basic&rdquo; characters are actually vendor extensions.</p>
        <div className="mt-4"><TryItButton text="①">Inspect ① in the viewer</TryItButton></div>
      </Section>

      <Section title="IBM Extensions and the Duplicate Problem">
        <p>CP932 includes two sets of IBM-originated characters, and this creates a unique problem: some characters have two different byte sequences that map to the same Unicode code point.</p>
        <Table headers={["Source", "Rows", "Count", "Examples"]} rows={[
          ["NEC selection of IBM ext.", "89-92", "~374 chars", "髙 﨑 (NEC byte: 0xEEEF, 0xEEFC)"],
          ["IBM extensions", "115-119", "~388 chars", "髙 﨑 (IBM byte: 0xFBFC, 0xFBF2)"],
        ]} />
        <p className="mt-3">The character <C>髙</C> (taka, the &ldquo;tall&rdquo; variant of 高) can be encoded as either the NEC-row byte sequence or the IBM-row byte sequence in CP932. Both decode to U+9AD9 in Unicode. However, when converting from Unicode <em>back</em> to CP932, the encoder must choose one representation. Microsoft chose to favor the NEC rows for round-trip compatibility, but other implementations may differ.</p>
        <p className="mt-3">This duplication causes subtle bugs: byte-level string comparison may consider two CP932 strings &ldquo;different&rdquo; even though they contain identical text. Hash-based lookups, deduplication, and binary search can all break. The solution is to always normalize to Unicode for comparison, never compare raw CP932 bytes directly.</p>
        <CodeBlock>{`// The duplicate encoding problem:
// 髙 (U+9AD9) in CP932:
//   NEC row 89:  0xEEEF
//   IBM row 115: 0xFBFC
// Both are valid CP932, both map to the same Unicode character.
//
// Byte comparison: 0xEEEF ≠ 0xFBFC → "different"
// Unicode comparison: U+9AD9 === U+9AD9 → "same"
//
// Always convert to Unicode before comparing!`}</CodeBlock>
        <div className="mt-4"><TryItButton text="髙">Inspect 髙 (IBM extension character)</TryItButton></div>
      </Section>

      <Section title="WHATWG Reality: The Web Treats Shift_JIS as CP932">
        <p>The WHATWG Encoding Standard, which governs how web browsers handle character encodings, made a pragmatic decision: the label &ldquo;Shift_JIS&rdquo; is treated as an alias for the Windows-31J (CP932) decoder. When a web page declares <C>charset=Shift_JIS</C>, browsers decode it using CP932 rules.</p>
        <Table headers={["Label in HTML", "Actual decoder used", "Standard"]} rows={[
          ["Shift_JIS", "Windows-31J (CP932)", "WHATWG"],
          ["shift_jis", "Windows-31J (CP932)", "WHATWG"],
          ["windows-31j", "Windows-31J (CP932)", "WHATWG"],
          ["csshiftjis", "Windows-31J (CP932)", "WHATWG"],
          ["ms_kanji", "Windows-31J (CP932)", "WHATWG"],
          ["x-sjis", "Windows-31J (CP932)", "WHATWG"],
        ]} />
        <p className="mt-3">This means on the web, the distinction between Shift_JIS and CP932 is effectively erased. All six labels above trigger the same decoder. The WHATWG made this choice because virtually all &ldquo;Shift_JIS&rdquo; content on the web is actually CP932, and using a strict Shift_JIS decoder would break millions of pages containing NEC special characters.</p>
        <p className="mt-3">However, this web-centric unification does not apply everywhere. Email (MIME), programming languages, and database systems may still distinguish between the two. Python&apos;s <C>shift_jis</C> codec is stricter than its <C>cp932</C> codec. Java&apos;s <C>Shift_JIS</C> maps to JIS X 0208, while <C>MS932</C> maps to CP932. These differences matter when processing data outside the browser.</p>
        <CodeBlock>{`# Python encoding behavior difference:
text = "①"  # Circled digit one (U+2460)

# CP932: works fine
text.encode('cp932')          # b'\\x87\\x40'

# Strict Shift_JIS: fails!
text.encode('shift_jis')      # UnicodeEncodeError

# Java equivalents:
# Charset.forName("Shift_JIS")  → JIS X 0208 based
# Charset.forName("MS932")      → CP932 / Windows-31J`}</CodeBlock>
        <div className="mt-4"><TryItButton text="①">Try ① in the viewer</TryItButton></div>
      </Section>

      <Section title="Unicode Mapping Variants">
        <p>Even when both Shift_JIS and CP932 contain the same character, they sometimes map to different Unicode code points. The most famous example is the wave dash problem:</p>
        <Table headers={["JIS character", "JIS X 0208 → Unicode", "CP932 → Unicode", "Difference"]} rows={[
          ["Wave dash (1-33)", "U+301C 〜", "U+FF5E ～", "WAVE DASH vs FULLWIDTH TILDE"],
          ["Double vertical line (1-34)", "U+2016 ‖", "U+2225 ∥", "DOUBLE VERTICAL LINE vs PARALLEL TO"],
          ["Minus sign (1-61)", "U+2212 −", "U+FF0D －", "MINUS SIGN vs FULLWIDTH HYPHEN-MINUS"],
          ["Cent sign (1-81)", "U+00A2 ¢", "U+FFE0 ￠", "CENT SIGN vs FULLWIDTH CENT SIGN"],
          ["Pound sign (1-82)", "U+00A3 £", "U+FFE1 ￡", "POUND SIGN vs FULLWIDTH POUND SIGN"],
          ["Not sign (1-76)", "U+00AC ¬", "U+FFE2 ￢", "NOT SIGN vs FULLWIDTH NOT SIGN"],
          ["EM dash (1-29)", "U+2014 —", "U+2015 ―", "EM DASH vs HORIZONTAL BAR"],
        ]} />
        <p className="mt-3">These 7 mapping discrepancies (sometimes called the &ldquo;wave dash problem&rdquo; as a group) cause round-trip conversion failures. If you convert text from CP932 to Unicode and then to JIS-standard Shift_JIS (or vice versa), these characters will change identity. The wave dash (<C>〜</C> vs <C>～</C>) is the most visible and the most frequently encountered in practice &mdash; it appears in countless Japanese price ranges, dates, and expressions.</p>
        <p className="mt-3">The root cause is that Microsoft and the JIS committee independently chose different Unicode code points for the same visual character. Neither choice is &ldquo;wrong&rdquo; &mdash; they simply reflect different mapping philosophies. Microsoft preferred fullwidth compatibility forms; JIS preferred semantically precise code points.</p>
        <div className="mt-4"><TryItButton text="高髙">Compare standard and variant kanji</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="歴史的背景: 2つのエンコーディングが分岐するまで">
        <p>Shift_JIS は 1982 年にアスキー社とマイクロソフトの協力により、パーソナルコンピュータで日本語を扱うために作られました。既存の制御コードとの衝突を避けつつ、1 バイトの ASCII 互換文字と 2 バイトの JIS X 0208 文字を巧みに混在させる設計です。</p>
        <p className="mt-3">マイクロソフトは MS-DOS と Windows に Shift_JIS を採用しましたが、ユーザーの要望に応じて徐々に独自の文字を追加していきました。この拡張版は内部的に「コードページ 932」（CP932）と呼ばれ、後に IANA で <C>Windows-31J</C> として標準化されました。問題は、マイクロソフトが独自拡張と元の規格を明確に区別しなかったことで、「Shift_JIS」という名前が曖昧になりました。</p>
        <Table headers={["名称", "標準化団体", "ベース", "拡張"]} rows={[
          ["Shift_JIS", "JIS (JIS X 0208)", "JIS X 0201 + JIS X 0208", "なし"],
          ["CP932 / Windows-31J", "Microsoft / IANA", "Shift_JIS", "NEC特殊文字、NEC選定IBM拡張、IBM拡張"],
          ["Shift_JIS-2004", "JIS (JIS X 0213)", "JIS X 0201 + JIS X 0213", "第四水準漢字"],
        ]} />
        <p className="mt-3">実際には、ソフトウェアが「Shift_JIS」を使用すると主張する場合、ほぼ確実に CP932 を意味します。JIS 規格準拠の純粋な Shift_JIS は現実ではほとんど見かけません。これがエンコーディング検出と変換における恒常的な混乱の原因です。</p>
        <div className="mt-4"><TryItButton text="①">① を分析する（CP932 拡張文字）</TryItButton></div>
      </Section>

      <Section title="区（Row）のカバー範囲比較">
        <p>Shift_JIS と CP932 は基本構造を共有しています: 1 バイト文字（0x00-0x7F と半角カタカナ用 0xA1-0xDF）に加え、JIS X 0208 の「区」と「点」に配置された 2 バイト文字。違いは、どの区が使用されているかです:</p>
        <Table headers={["区 (ku)", "Shift_JIS (JIS X 0208)", "CP932 (Windows-31J)"]} rows={[
          ["1-8区", "記号・数字・ラテン・かな", "同じ"],
          ["9-12区", "未割り当て", "未割り当て"],
          ["13区", "未割り当て", "NEC特殊文字（①②③ など）"],
          ["14区", "未割り当て", "未割り当て"],
          ["15区", "未割り当て", "未割り当て"],
          ["16-84区", "JIS第一・第二水準漢字", "同じ"],
          ["85-88区", "未割り当て", "未割り当て"],
          ["89-92区", "未割り当て", "NEC選定IBM拡張文字"],
          ["93-94区", "未割り当て", "未割り当て"],
          ["95-120区", "JIS X 0208 に存在しない", "IBM拡張文字（ユーザー定義領域）"],
        ]} />
        <p className="mt-3">核心部分である 1-8 区と 16-84 区は両エンコーディングで完全に同一です。分岐は「隙間」&mdash; JIS X 0208 が未割り当てのまま残した区にマイクロソフトがベンダー拡張を埋めた部分 &mdash; で生じます。日常的な日本語テキストの大部分が両エンコーディングで同じように動作する一方、厳密な Shift_JIS デコーダが CP932 専用文字に遭遇するとエラーになる理由はここにあります。</p>
        <div className="mt-4"><TryItButton text="高髙">標準漢字と拡張漢字を比較する</TryItButton></div>
      </Section>

      <Section title="NEC 特殊文字（13区）">
        <p>13 区は CP932 の拡張の中で最も有名（悪名高い）です。NEC が 1980 年代に PC-9801 シリーズ向けに導入し、マイクロソフトが CP932 に取り込みました。丸数字、ローマ数字、単位記号など、よく要望された文字を含みます:</p>
        <Table headers={["バイト範囲", "文字", "Unicode マッピング"]} rows={[
          ["0x8740-0x875D", "①②③...⑳", "U+2460-U+2473"],
          ["0x875F-0x8775", "Ⅰ Ⅱ Ⅲ ... Ⅹ ⅰ ⅱ ⅲ ... ⅹ", "U+2160-U+2179"],
          ["0x8780-0x878F", "㍉ ㌔ ㌢ ㍍ ㌘ ㌧ ㌃ ㌶ 等", "U+3349, U+3314, ..."],
          ["0x8790-0x879C", "㍻ ㍼ ㍽ ㍾（元号）", "U+337B-U+337E"],
        ]} />
        <p className="mt-3">これらの文字は標準 Shift_JIS には存在しません。<C>①</C>（丸数字1、バイト 0x8740）を含む文書は CP932 では完全にデコードできますが、厳密な Shift_JIS デコーダではエラーまたは置換文字になります。Windows と Unix/Mac 間で日本語テキストを交換する際のエンコーディング問題の最大原因がこれです。</p>
        <p className="mt-3">丸数字は特に問題になりやすい文字です。日本のビジネス文書、法律文書、日常的な文章で広く使われているためです。これらの「基本的」に見える文字が実はベンダー拡張であることを知って驚くユーザーは少なくありません。</p>
        <div className="mt-4"><TryItButton text="①">① をビューアで分析する</TryItButton></div>
      </Section>

      <Section title="IBM 拡張と重複問題">
        <p>CP932 は IBM 由来の文字を 2 系統含んでおり、これがユニークな問題を生みます: 一部の文字が、同じ Unicode コードポイントにマッピングされる異なる 2 つのバイト列を持つのです。</p>
        <Table headers={["出典", "区", "文字数", "例"]} rows={[
          ["NEC選定IBM拡張", "89-92区", "約374文字", "髙 﨑 (NEC: 0xEEEF, 0xEEFC)"],
          ["IBM拡張", "115-119区", "約388文字", "髙 﨑 (IBM: 0xFBFC, 0xFBF2)"],
        ]} />
        <p className="mt-3"><C>髙</C>（タカ、「高」の異体字）は CP932 において NEC 系のバイト列でも IBM 系のバイト列でもエンコードできます。どちらも Unicode では U+9AD9 にデコードされます。しかし、Unicode から CP932 に<em>逆変換</em>する際、エンコーダはどちらか一方を選ぶ必要があります。マイクロソフトはラウンドトリップ互換性のため NEC 系を優先しましたが、他の実装は異なる選択をする場合があります。</p>
        <p className="mt-3">この重複は微妙なバグを引き起こします: バイトレベルの文字列比較では、同一テキストを含む 2 つの CP932 文字列が「異なる」と判定される可能性があります。ハッシュベースの検索、重複排除、二分探索が壊れる原因になります。解決策は、比較時には必ず Unicode に変換し、CP932 のバイト列を直接比較しないことです。</p>
        <CodeBlock>{`// 重複エンコーディング問題:
// 髙 (U+9AD9) の CP932 表現:
//   NEC 89区:  0xEEEF
//   IBM 115区: 0xFBFC
// どちらも有効な CP932 で、同じ Unicode 文字にマッピング。
//
// バイト比較: 0xEEEF ≠ 0xFBFC → 「異なる」
// Unicode 比較: U+9AD9 === U+9AD9 → 「同じ」
//
// 比較は必ず Unicode に変換してから!`}</CodeBlock>
        <div className="mt-4"><TryItButton text="髙">髙 を分析する（IBM拡張文字）</TryItButton></div>
      </Section>

      <Section title="WHATWG の現実: Web では Shift_JIS = CP932">
        <p>Web ブラウザの文字エンコーディング処理を規定する WHATWG Encoding Standard は、実用的な判断を下しました: 「Shift_JIS」というラベルを Windows-31J（CP932）デコーダのエイリアスとして扱うのです。Web ページが <C>charset=Shift_JIS</C> を宣言すると、ブラウザは CP932 のルールでデコードします。</p>
        <Table headers={["HTML のラベル", "実際に使用されるデコーダ", "規格"]} rows={[
          ["Shift_JIS", "Windows-31J (CP932)", "WHATWG"],
          ["shift_jis", "Windows-31J (CP932)", "WHATWG"],
          ["windows-31j", "Windows-31J (CP932)", "WHATWG"],
          ["csshiftjis", "Windows-31J (CP932)", "WHATWG"],
          ["ms_kanji", "Windows-31J (CP932)", "WHATWG"],
          ["x-sjis", "Windows-31J (CP932)", "WHATWG"],
        ]} />
        <p className="mt-3">つまり Web 上では、Shift_JIS と CP932 の区別は事実上消滅しています。上記 6 つのラベルはすべて同じデコーダを呼び出します。WHATWG がこの選択をしたのは、Web 上の「Shift_JIS」コンテンツのほぼすべてが実際には CP932 であり、厳密な Shift_JIS デコーダを使うと NEC 特殊文字を含む数百万のページが壊れるためです。</p>
        <p className="mt-3">ただし、この Web 中心の統一はすべてに適用されるわけではありません。メール（MIME）、プログラミング言語、データベースシステムでは今でも両者を区別する場合があります。Python の <C>shift_jis</C> コーデックは <C>cp932</C> コーデックより厳密です。Java の <C>Shift_JIS</C> は JIS X 0208 にマッピングされ、<C>MS932</C> は CP932 にマッピングされます。ブラウザ外でデータを処理する際には、この違いが重要です。</p>
        <CodeBlock>{`# Python でのエンコーディング動作の違い:
text = "①"  # 丸数字1 (U+2460)

# CP932: 問題なし
text.encode('cp932')          # b'\\x87\\x40'

# 厳密な Shift_JIS: エラー!
text.encode('shift_jis')      # UnicodeEncodeError

# Java の場合:
# Charset.forName("Shift_JIS")  → JIS X 0208 ベース
# Charset.forName("MS932")      → CP932 / Windows-31J`}</CodeBlock>
        <div className="mt-4"><TryItButton text="①">① をビューアで試す</TryItButton></div>
      </Section>

      <Section title="Unicode マッピングの相違">
        <p>Shift_JIS と CP932 の両方に同じ文字が含まれている場合でも、異なる Unicode コードポイントにマッピングされることがあります。最も有名な例が波ダッシュ問題です:</p>
        <Table headers={["JIS 文字", "JIS X 0208 → Unicode", "CP932 → Unicode", "違い"]} rows={[
          ["波ダッシュ (1区33点)", "U+301C 〜", "U+FF5E ～", "WAVE DASH vs 全角チルダ"],
          ["双柱 (1区34点)", "U+2016 ‖", "U+2225 ∥", "DOUBLE VERTICAL LINE vs PARALLEL TO"],
          ["マイナス (1区61点)", "U+2212 −", "U+FF0D －", "MINUS SIGN vs 全角ハイフンマイナス"],
          ["セント記号 (1区81点)", "U+00A2 ¢", "U+FFE0 ￠", "CENT SIGN vs 全角セント"],
          ["ポンド記号 (1区82点)", "U+00A3 £", "U+FFE1 ￡", "POUND SIGN vs 全角ポンド"],
          ["否定記号 (1区76点)", "U+00AC ¬", "U+FFE2 ￢", "NOT SIGN vs 全角否定"],
          ["ダッシュ (1区29点)", "U+2014 —", "U+2015 ―", "EM DASH vs HORIZONTAL BAR"],
        ]} />
        <p className="mt-3">これら 7 つのマッピング不一致（総称して「波ダッシュ問題」と呼ばれることもある）はラウンドトリップ変換の失敗を引き起こします。テキストを CP932 から Unicode に変換し、さらに JIS 規格準拠の Shift_JIS に変換する（またはその逆）と、これらの文字が別の文字に変わってしまいます。波ダッシュ（<C>〜</C> vs <C>～</C>）は最も目立ち、最も頻繁に遭遇します &mdash; 日本語の価格帯、日付、表現に無数に使われています。</p>
        <p className="mt-3">根本原因は、マイクロソフトと JIS 委員会が同じ見た目の文字に対して独立に異なる Unicode コードポイントを選択したことです。どちらの選択も「間違い」ではなく、異なるマッピング哲学を反映しています。マイクロソフトは全角互換形式を好み、JIS は意味的に正確なコードポイントを好みました。</p>
        <div className="mt-4"><TryItButton text="高髙">標準字体と異体字を比較する</TryItButton></div>
      </Section>
    </>
  );
}

export default function ShiftJisVsCp932Content() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

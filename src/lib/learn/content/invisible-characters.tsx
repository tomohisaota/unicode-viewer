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
      <Section title="Zero-Width Characters: ZWSP, ZWJ, and ZWNJ">
        <p>Unicode includes several characters that occupy zero width &mdash; they are present in the text data but produce no visible glyph. The three most important are:</p>
        <Table headers={["Character", "Code point", "Name", "Purpose"]} rows={[
          ["(invisible)", "U+200B", "Zero Width Space (ZWSP)", "Optional line-break opportunity"],
          ["(invisible)", "U+200D", "Zero Width Joiner (ZWJ)", "Joins adjacent characters into ligatures/sequences"],
          ["(invisible)", "U+200C", "Zero Width Non-Joiner (ZWNJ)", "Prevents joining that would otherwise occur"],
        ]} />
        <p className="mt-3"><strong>ZWSP</strong> (U+200B) is used to indicate where a line break may occur in scripts that do not use spaces between words, such as Thai, Khmer, and CJK text. It is also frequently (mis)used as an &ldquo;invisible space&rdquo; in usernames and messages.</p>
        <p className="mt-3"><strong>ZWJ</strong> (U+200D) is the glue behind complex emoji sequences. The family emoji 👨‍👩‍👧‍👦 is literally Man + ZWJ + Woman + ZWJ + Girl + ZWJ + Boy. It is also essential in scripts like Devanagari where it controls consonant conjunct formation.</p>
        <p className="mt-3"><strong>ZWNJ</strong> (U+200C) does the opposite: it prevents characters from joining. In Persian and Arabic, it is used to show the non-joining form of a letter mid-word, which changes meaning in some cases.</p>
        <div className="mt-4"><TryItButton text={"hello\u200Bworld"}>Inspect text with hidden ZWSP</TryItButton></div>
      </Section>

      <Section title="Bidi Overrides: Invisible Text Direction Control">
        <p>Unicode supports bidirectional text (for mixing left-to-right scripts like English with right-to-left scripts like Arabic). This requires invisible control characters:</p>
        <Table headers={["Character", "Code point", "Name", "Effect"]} rows={[
          ["(invisible)", "U+200E", "Left-to-Right Mark (LRM)", "Forces LTR direction"],
          ["(invisible)", "U+200F", "Right-to-Left Mark (RLM)", "Forces RTL direction"],
          ["(invisible)", "U+202A", "Left-to-Right Embedding (LRE)", "Starts LTR embedding"],
          ["(invisible)", "U+202B", "Right-to-Left Embedding (RLE)", "Starts RTL embedding"],
          ["(invisible)", "U+202C", "Pop Directional Formatting (PDF)", "Ends embedding"],
          ["(invisible)", "U+202D", "Left-to-Right Override (LRO)", "Forces all text LTR"],
          ["(invisible)", "U+202E", "Right-to-Left Override (RLO)", "Forces all text RTL"],
          ["(invisible)", "U+2066", "Left-to-Right Isolate (LRI)", "Isolates LTR text"],
          ["(invisible)", "U+2067", "Right-to-Left Isolate (RLI)", "Isolates RTL text"],
          ["(invisible)", "U+2069", "Pop Directional Isolate (PDI)", "Ends isolation"],
        ]} />
        <p className="mt-3">The <strong>Right-to-Left Override</strong> (U+202E) is particularly dangerous. It forces all subsequent text to render right-to-left, which can make filenames, code, and URLs appear to say something completely different from their actual content:</p>
        <CodeBlock>{`// Normal text:
"hello.txt"

// With RLO inserted:
"\\u202Ehello.txt"
// Renders as: txt.olleh
// A file named "\\u202Efdp.exe" could display as "exe.pdf"!`}</CodeBlock>
        <div className="mt-4"><TryItButton text={"\u202Ehello"}>See RLO reverse text direction</TryItButton></div>
      </Section>

      <Section title="Tag Characters: An Entire Hidden Alphabet">
        <p>Unicode block U+E0000&ndash;U+E007F contains <strong>Tag characters</strong> &mdash; invisible versions of ASCII characters originally intended for language tagging. These were deprecated for that purpose but later repurposed for emoji flag subdivision sequences (like the flag of Scotland: 🏴󠁧󠁢󠁳󠁣󠁴󠁿).</p>
        <Table headers={["Tag character", "Code point", "Corresponds to"]} rows={[
          ["TAG LATIN SMALL LETTER A", "U+E0061", "a"],
          ["TAG LATIN SMALL LETTER B", "U+E0062", "b"],
          ["TAG DIGIT ZERO", "U+E0030", "0"],
          ["CANCEL TAG", "U+E007F", "(terminates sequence)"],
        ]} />
        <p className="mt-3">The Scotland flag emoji is: 🏴 + TAG g + TAG b + TAG s + TAG c + TAG t + CANCEL TAG. That is 7 code points (14 UTF-16 code units) for one flag emoji, with 6 invisible characters.</p>
        <p className="mt-3">Tag characters can be abused to hide arbitrary text within seemingly innocent strings. Since they are invisible and most tools do not display them, they can carry hidden messages or watermarks.</p>
        <CodeBlock>{`// The Scotland flag decomposed:
"🏴󠁧󠁢󠁳󠁣󠁴󠁿"
// = U+1F3F4 (black flag)
// + U+E0067 (tag g)
// + U+E0062 (tag b)
// + U+E0073 (tag s)
// + U+E0063 (tag c)
// + U+E0074 (tag t)
// + U+E007F (cancel tag)

[..."🏴󠁧󠁢󠁳󠁣󠁴󠁿"].length  // 14 code points (surrogates)`}</CodeBlock>
      </Section>

      <Section title="The Space Zoo: 18 Different Space Characters">
        <p>Beyond the regular space (U+0020) and the zero-width space, Unicode contains a menagerie of space characters with different widths:</p>
        <Table headers={["Name", "Code point", "Width"]} rows={[
          ["SPACE", "U+0020", "Normal word space"],
          ["NO-BREAK SPACE", "U+00A0", "Same as space, prevents line break"],
          ["EN QUAD", "U+2000", "Width of an en (half em)"],
          ["EM QUAD", "U+2001", "Width of an em"],
          ["EN SPACE", "U+2002", "Width of an en"],
          ["EM SPACE", "U+2003", "Width of an em"],
          ["THREE-PER-EM SPACE", "U+2004", "1/3 em"],
          ["FOUR-PER-EM SPACE", "U+2005", "1/4 em"],
          ["SIX-PER-EM SPACE", "U+2006", "1/6 em"],
          ["FIGURE SPACE", "U+2007", "Width of a digit"],
          ["PUNCTUATION SPACE", "U+2008", "Width of a period"],
          ["THIN SPACE", "U+2009", "1/5 em (approximately)"],
          ["HAIR SPACE", "U+200A", "Very thin space"],
          ["ZERO WIDTH SPACE", "U+200B", "No width"],
          ["NARROW NO-BREAK SPACE", "U+202F", "Narrow, no line break"],
          ["MEDIUM MATHEMATICAL SPACE", "U+205F", "4/18 em"],
          ["IDEOGRAPHIC SPACE", "U+3000", "CJK fullwidth space"],
          ["OGHAM SPACE MARK", "U+1680", "Ogham word separator"],
        ]} />
        <p className="mt-3">The <strong>no-break space</strong> (U+00A0) is the most commonly encountered problem space. It looks identical to a regular space but prevents line breaks. It often appears when copying text from PDFs, Word documents, or web pages, and can cause string comparisons to fail silently.</p>
      </Section>

      <Section title="Practical Impact: Where Invisible Characters Cause Bugs">
        <p>Invisible characters cause real problems in software:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>String comparison failures</strong>: <C>{'"hello" === "hello"'}</C> can be false if one contains a hidden ZWSP, BOM, or non-breaking space.</li>
          <li><strong>JSON/YAML parsing errors</strong>: A BOM (U+FEFF) at the start of a file can break parsers. A ZWSP in a key name makes it unmatchable.</li>
          <li><strong>URL manipulation</strong>: Invisible characters in URLs can bypass security filters while appearing legitimate to users.</li>
          <li><strong>Password fields</strong>: Copy-pasting a password with an invisible character means the user &ldquo;knows&rdquo; their password but it never matches.</li>
          <li><strong>Code bugs</strong>: A ZWNJ or ZWJ in a variable name creates a different identifier: <C>price</C> and <C>pri&zwj;ce</C> (with hidden ZWJ) are two different variables.</li>
        </ul>
        <CodeBlock>{`// Common invisible character detection:
function hasInvisible(str) {
  const invisible = /[\\u200B-\\u200F\\u2028-\\u202F\\u2060-\\u206F\\uFEFF]/;
  return invisible.test(str);
}

// Strip common invisible characters:
function stripInvisible(str) {
  return str.replace(
    /[\\u200B-\\u200F\\u2028-\\u202F\\u2060-\\u206F\\uFEFF]/g,
    ""
  );
}

// Example:
const text = "hello\\u200Bworld";
text.length          // 11 (not 10!)
hasInvisible(text)   // true
stripInvisible(text) // "helloworld"`}</CodeBlock>
      </Section>

      <Section title="How This Tool Reveals Them">
        <p>The fundamental problem with invisible characters is that they are, by design, invisible. Standard text editors, terminals, and web browsers will not show them. You need a specialized tool to detect their presence.</p>
        <p className="mt-3">This tool solves the problem by:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Showing every code point</strong>: Each code point gets its own cell in the grid, including invisible ones. You can see their Unicode name, code point value, and general category.</li>
          <li><strong>Labeling control characters</strong>: Zero-width characters, bidi controls, and other invisible characters are shown with their abbreviated names so you can identify them instantly.</li>
          <li><strong>Grapheme cluster awareness</strong>: When an invisible character combines with visible ones (like ZWJ in emoji), the tool shows the full cluster structure.</li>
        </ul>
        <p className="mt-3">If you ever encounter text that behaves unexpectedly &mdash; comparisons fail, lengths are wrong, or copy-paste produces different results &mdash; paste it into this tool to see what is really there.</p>
        <div className="mt-4"><TryItButton text={"hello\u200Bworld"}>Reveal the hidden ZWSP</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="ゼロ幅文字: ZWSP、ZWJ、ZWNJ">
        <p>Unicode にはゼロ幅を占める文字が含まれています &mdash; テキストデータ内に存在しますが、可視的なグリフは生成しません。最も重要な3つは:</p>
        <Table headers={["文字", "コードポイント", "名前", "目的"]} rows={[
          ["（不可視）", "U+200B", "ゼロ幅スペース（ZWSP）", "任意の改行位置の指示"],
          ["（不可視）", "U+200D", "ゼロ幅接合子（ZWJ）", "隣接文字を合字/シーケンスに結合"],
          ["（不可視）", "U+200C", "ゼロ幅非接合子（ZWNJ）", "本来発生する結合を防止"],
        ]} />
        <p className="mt-3"><strong>ZWSP</strong>（U+200B）はタイ語、クメール語、CJK テキストなど単語間にスペースを使用しないスクリプトで改行可能位置を示すために使用されます。またユーザー名やメッセージでの「見えないスペース」として頻繁に（誤）使用されます。</p>
        <p className="mt-3"><strong>ZWJ</strong>（U+200D）は複合絵文字シーケンスの接着剤です。家族絵文字 👨‍👩‍👧‍👦 は文字通り 男性 + ZWJ + 女性 + ZWJ + 女の子 + ZWJ + 男の子 です。デーヴァナーガリーなどのスクリプトでも子音結合の制御に不可欠です。</p>
        <p className="mt-3"><strong>ZWNJ</strong>（U+200C）は逆の働きをします: 文字の結合を防止します。ペルシャ語やアラビア語では、単語中の文字の非結合形式を示すために使用され、場合によっては意味が変わります。</p>
        <div className="mt-4"><TryItButton text={"hello\u200Bworld"}>隠れた ZWSP を含むテキストを検査する</TryItButton></div>
      </Section>

      <Section title="Bidi オーバーライド: 不可視のテキスト方向制御">
        <p>Unicode は双方向テキスト（英語のような左から右のスクリプトとアラビア語のような右から左のスクリプトの混在）をサポートしています。これには不可視の制御文字が必要です:</p>
        <Table headers={["文字", "コードポイント", "名前", "効果"]} rows={[
          ["（不可視）", "U+200E", "Left-to-Right Mark（LRM）", "LTR 方向を強制"],
          ["（不可視）", "U+200F", "Right-to-Left Mark（RLM）", "RTL 方向を強制"],
          ["（不可視）", "U+202A", "Left-to-Right Embedding（LRE）", "LTR 埋め込みを開始"],
          ["（不可視）", "U+202B", "Right-to-Left Embedding（RLE）", "RTL 埋め込みを開始"],
          ["（不可視）", "U+202C", "Pop Directional Formatting（PDF）", "埋め込みを終了"],
          ["（不可視）", "U+202D", "Left-to-Right Override（LRO）", "全テキストを LTR に強制"],
          ["（不可視）", "U+202E", "Right-to-Left Override（RLO）", "全テキストを RTL に強制"],
          ["（不可視）", "U+2066", "Left-to-Right Isolate（LRI）", "LTR テキストを分離"],
          ["（不可視）", "U+2067", "Right-to-Left Isolate（RLI）", "RTL テキストを分離"],
          ["（不可視）", "U+2069", "Pop Directional Isolate（PDI）", "分離を終了"],
        ]} />
        <p className="mt-3"><strong>Right-to-Left Override</strong>（U+202E）は特に危険です。後続の全テキストを右から左にレンダリングさせ、ファイル名、コード、URL が実際の内容とまったく異なるものに見える可能性があります:</p>
        <CodeBlock>{`// 通常のテキスト:
"hello.txt"

// RLO を挿入:
"\\u202Ehello.txt"
// 表示: txt.olleh
// "\\u202Efdp.exe" というファイル名は "exe.pdf" と表示される！`}</CodeBlock>
        <div className="mt-4"><TryItButton text={"\u202Ehello"}>RLO によるテキスト方向反転を確認する</TryItButton></div>
      </Section>

      <Section title="タグ文字: 隠された完全なアルファベット">
        <p>Unicode ブロック U+E0000〜U+E007F には<strong>タグ文字</strong>が含まれています &mdash; 元々言語タグ用に設計された ASCII 文字の不可視版です。その目的では非推奨になりましたが、後に絵文字の旗の地域区分シーケンス（スコットランドの旗 🏴󠁧󠁢󠁳󠁣󠁴󠁿 など）に再利用されました。</p>
        <Table headers={["タグ文字", "コードポイント", "対応する文字"]} rows={[
          ["TAG LATIN SMALL LETTER A", "U+E0061", "a"],
          ["TAG LATIN SMALL LETTER B", "U+E0062", "b"],
          ["TAG DIGIT ZERO", "U+E0030", "0"],
          ["CANCEL TAG", "U+E007F", "（シーケンス終端）"],
        ]} />
        <p className="mt-3">スコットランドの旗絵文字は: 🏴 + TAG g + TAG b + TAG s + TAG c + TAG t + CANCEL TAG。1つの旗絵文字に7コードポイント（14 UTF-16 コードユニット）、うち6つが不可視文字です。</p>
        <p className="mt-3">タグ文字は一見無害な文字列の中に任意のテキストを隠すために悪用される可能性があります。不可視でありほとんどのツールが表示しないため、隠しメッセージや電子透かしを運ぶことができます。</p>
        <CodeBlock>{`// スコットランドの旗を分解:
"🏴󠁧󠁢󠁳󠁣󠁴󠁿"
// = U+1F3F4（黒旗）
// + U+E0067（tag g）
// + U+E0062（tag b）
// + U+E0073（tag s）
// + U+E0063（tag c）
// + U+E0074（tag t）
// + U+E007F（cancel tag）

[..."🏴󠁧󠁢󠁳󠁣󠁴󠁿"].length  // 14（サロゲート含む）`}</CodeBlock>
      </Section>

      <Section title="スペース動物園: 18種類の異なるスペース文字">
        <p>通常のスペース（U+0020）とゼロ幅スペースの他に、Unicode には異なる幅のスペース文字が多数含まれています:</p>
        <Table headers={["名前", "コードポイント", "幅"]} rows={[
          ["SPACE", "U+0020", "通常の単語間スペース"],
          ["NO-BREAK SPACE", "U+00A0", "スペースと同じだが改行を防止"],
          ["EN QUAD", "U+2000", "en 幅（em の半分）"],
          ["EM QUAD", "U+2001", "em 幅"],
          ["EN SPACE", "U+2002", "en 幅"],
          ["EM SPACE", "U+2003", "em 幅"],
          ["THREE-PER-EM SPACE", "U+2004", "1/3 em"],
          ["FOUR-PER-EM SPACE", "U+2005", "1/4 em"],
          ["SIX-PER-EM SPACE", "U+2006", "1/6 em"],
          ["FIGURE SPACE", "U+2007", "数字の幅"],
          ["PUNCTUATION SPACE", "U+2008", "ピリオドの幅"],
          ["THIN SPACE", "U+2009", "約1/5 em"],
          ["HAIR SPACE", "U+200A", "極細スペース"],
          ["ZERO WIDTH SPACE", "U+200B", "幅なし"],
          ["NARROW NO-BREAK SPACE", "U+202F", "狭い、改行なし"],
          ["MEDIUM MATHEMATICAL SPACE", "U+205F", "4/18 em"],
          ["IDEOGRAPHIC SPACE", "U+3000", "CJK 全角スペース"],
          ["OGHAM SPACE MARK", "U+1680", "オガム文字の単語区切り"],
        ]} />
        <p className="mt-3"><strong>ノーブレークスペース</strong>（U+00A0）は最もよく遭遇する問題スペースです。通常のスペースと見た目は同一ですが改行を防止します。PDF、Word文書、ウェブページからテキストをコピーする際によく現れ、文字列比較をサイレントに失敗させます。</p>
      </Section>

      <Section title="実用上の影響: 不可視文字がバグを引き起こす場所">
        <p>不可視文字はソフトウェアで実際の問題を引き起こします:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>文字列比較の失敗</strong>: <C>{'"hello" === "hello"'}</C> が、一方に隠れた ZWSP、BOM、またはノーブレークスペースが含まれると false になり得る。</li>
          <li><strong>JSON/YAML パースエラー</strong>: ファイル先頭の BOM（U+FEFF）がパーサーを壊す。キー名内の ZWSP はマッチ不能にする。</li>
          <li><strong>URL 操作</strong>: URL 内の不可視文字がセキュリティフィルターをバイパスしつつユーザーには正当に見える。</li>
          <li><strong>パスワードフィールド</strong>: 不可視文字を含むパスワードをコピー&ペーストすると、ユーザーはパスワードを「知っている」のに一致しない。</li>
          <li><strong>コードのバグ</strong>: 変数名内の ZWNJ や ZWJ が異なる識別子を作成: <C>price</C> と <C>pri&zwj;ce</C>（隠れた ZWJ 付き）は2つの別の変数。</li>
        </ul>
        <CodeBlock>{`// 一般的な不可視文字の検出:
function hasInvisible(str) {
  const invisible = /[\\u200B-\\u200F\\u2028-\\u202F\\u2060-\\u206F\\uFEFF]/;
  return invisible.test(str);
}

// 一般的な不可視文字の除去:
function stripInvisible(str) {
  return str.replace(
    /[\\u200B-\\u200F\\u2028-\\u202F\\u2060-\\u206F\\uFEFF]/g,
    ""
  );
}

// 例:
const text = "hello\\u200Bworld";
text.length          // 11（10ではない！）
hasInvisible(text)   // true
stripInvisible(text) // "helloworld"`}</CodeBlock>
      </Section>

      <Section title="このツールによる可視化">
        <p>不可視文字の根本的な問題は、設計上不可視であることです。標準的なテキストエディタ、ターミナル、ウェブブラウザはこれらを表示しません。存在を検出するには専用ツールが必要です。</p>
        <p className="mt-3">このツールは以下の方法で問題を解決します:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>すべてのコードポイントを表示</strong>: 不可視のものを含め、各コードポイントがグリッド内で独自のセルを持つ。Unicode 名、コードポイント値、一般カテゴリを確認可能。</li>
          <li><strong>制御文字のラベル付け</strong>: ゼロ幅文字、Bidi 制御、その他の不可視文字は省略名で表示され、即座に識別可能。</li>
          <li><strong>書記素クラスタの認識</strong>: 不可視文字が可視文字と結合する場合（絵文字内の ZWJ など）、ツールは完全なクラスタ構造を表示。</li>
        </ul>
        <p className="mt-3">予期しない挙動のテキストに遭遇したら &mdash; 比較が失敗する、長さがおかしい、コピー&ペーストで異なる結果になる &mdash; このツールにペーストして実際に何があるか確認してください。</p>
        <div className="mt-4"><TryItButton text={"hello\u200Bworld"}>隠れた ZWSP を明らかにする</TryItButton></div>
      </Section>
    </>
  );
}

export default function InvisibleCharactersContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

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
      <Section title="The Problem: One Code Point, Many Shapes">
        <p>Han Unification merged characters that share the same origin into single code points. But what happens when you need to specify an <em>exact</em> glyph variant? Japanese names, historical documents, and calligraphic traditions demand precise glyph control beyond what a font&apos;s default rendering provides.</p>
        <p className="mt-3">For example, the character 辻 (U+8FBB, &ldquo;tsuji&rdquo;, a common Japanese surname) has two accepted forms: one with one dot on the left radical (一点しんにょう) and one with two dots (二点しんにょう). Both are &ldquo;correct&rdquo; &mdash; but which one appears depends on the font, and there is no way to choose using the base code point alone.</p>
        <p className="mt-3">Unicode&apos;s solution is <strong>Variation Sequences</strong>: a base character followed by a special variation selector character that specifies the exact glyph form.</p>
      </Section>

      <Section title="How IVS Works: The E0100 Range">
        <p><strong>Ideographic Variation Sequences (IVS)</strong> use variation selectors from the range U+E0100 through U+E01EF (240 selectors, called VS17 through VS256). An IVS is a two-character sequence:</p>
        <CodeBlock>{`Base character + Variation Selector = IVS

Example:
葛 (U+845B) + VS17 (U+E0100) = 葛󠄀 (specific variant)
葛 (U+845B) alone            = 葛  (default glyph)`}</CodeBlock>
        <p className="mt-3">The variation selector is invisible &mdash; it produces no glyph of its own. But a font that supports IVS will render a different glyph when it encounters the sequence.</p>
        <Table headers={["Component", "Code point", "Visible?"]} rows={[
          ["Base character: 葛", "U+845B", "Yes"],
          ["Variation selector: VS17", "U+E0100", "No (invisible)"],
          ["Sequence: 葛󠄀", "U+845B U+E0100", "Yes (variant glyph)"],
        ]} />
        <p className="mt-3">In JavaScript, each variation selector in this range requires a surrogate pair (2 UTF-16 code units), so an IVS takes 3&ndash;4 code units total despite being one grapheme cluster.</p>
        <div className="mt-4"><TryItButton text={"葛\u{E0100}葛"}>Compare 葛 with and without IVS</TryItButton></div>
      </Section>

      <Section title="SVS: The Emoji and Symbol Variation Selectors">
        <p><strong>Standardized Variation Sequences (SVS)</strong> use a different, smaller set of variation selectors: U+FE00 through U+FE0F (VS1 through VS16). These are used for:</p>
        <Table headers={["Selector", "Common use", "Example"]} rows={[
          ["VS1 (U+FE00)", "CJK compatibility variants", "芦 + VS1 for specific form"],
          ["VS15 (U+FE0E)", "Text presentation", "☺︎ (text style)"],
          ["VS16 (U+FE0F)", "Emoji presentation", "☺️ (emoji style)"],
        ]} />
        <p className="mt-3">The most widely known SVS usage is the text/emoji toggle. Many characters have both a text presentation (monochrome, simple) and an emoji presentation (colorful). VS15 forces text style, VS16 forces emoji style:</p>
        <CodeBlock>{`// Same base character, different presentations:
"\\u2764"           // ❤ (default, usually emoji)
"\\u2764\\uFE0E"    // ❤︎ (text presentation, VS15)
"\\u2764\\uFE0F"    // ❤️ (emoji presentation, VS16)

// The selectors are invisible but change rendering:
"❤️".length  // 2 (base + VS16, both in BMP)`}</CodeBlock>
        <p className="mt-3">Unlike IVS selectors (which are in the SMP and need surrogates), SVS selectors are in the BMP (U+FE00&ndash;FE0F) and each take just one UTF-16 code unit.</p>
      </Section>

      <Section title="IVD Collections: Adobe-Japan1 and Moji_Joho">
        <p>Which variation selectors map to which glyphs is not arbitrary &mdash; it is recorded in the <strong>Ideographic Variation Database (IVD)</strong>, maintained by the Unicode Consortium. The IVD contains named <strong>collections</strong>:</p>
        <Table headers={["Collection", "Scope", "Entries"]} rows={[
          ["Adobe-Japan1", "Japanese typography (AJ1 CID)", "~14,700"],
          ["Moji_Joho", "Japanese government character info", "~11,000"],
          ["Hanyo-Denshi", "Japanese administrative systems", "~11,000"],
          ["KRName", "Korean personal name variants", "~2,200"],
        ]} />
        <p className="mt-3"><strong>Adobe-Japan1</strong> is the most widely supported collection. It maps IVS sequences to specific CID (Character ID) numbers in the Adobe-Japan1-7 character collection, which professional Japanese fonts implement. A font that supports Adobe-Japan1 IVS can render thousands of glyph variants.</p>
        <p className="mt-3"><strong>Moji_Joho</strong> (文字情報) is maintained by Japan&apos;s Information-technology Promotion Agency (IPA) and focuses on character variants used in official government documents and the family register system (戸籍).</p>
      </Section>

      <Section title="Font Support: When IVS Actually Works">
        <p>IVS only works if the font supports it. A font must contain:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li>The glyph variants for each supported IVS sequence</li>
          <li>A <C>cmap</C> table (specifically format 14, Unicode Variation Sequences) that maps base+selector pairs to glyphs</li>
        </ul>
        <p className="mt-3">Major fonts with IVS support include:</p>
        <Table headers={["Font", "Collection", "Platform"]} rows={[
          ["IPAmj Mincho", "Moji_Joho", "Cross-platform (free)"],
          ["Noto Sans CJK", "Adobe-Japan1 (partial)", "Cross-platform (free)"],
          ["Kozuka Mincho", "Adobe-Japan1", "Adobe products"],
          ["Yu Mincho", "Adobe-Japan1 (partial)", "Windows / macOS"],
          ["Hiragino Mincho", "Adobe-Japan1 (partial)", "macOS"],
        ]} />
        <p className="mt-3">If a font does not support a particular IVS, it simply renders the base character&apos;s default glyph and ignores the variation selector. This is a graceful fallback &mdash; the text remains legible, just not in the specific variant requested.</p>
        <div className="mt-4"><TryItButton text={"辻\u{E0100}辻"}>Compare 辻 variants</TryItButton></div>
      </Section>

      <Section title='The Record Holder: 邉 and Its 47 Variants'>
        <p>The character 邉 (U+9089) holds the record for the most registered IVS sequences. It has approximately 47 variant forms in the Moji_Joho collection, reflecting the many ways this character has been written in Japanese family registers over the centuries.</p>
        <p className="mt-3">The surname 渡邉 (Watanabe) is notorious in Japan for having dozens of variant spellings. Municipal offices maintaining family registers need to faithfully reproduce the exact variant used in each family&apos;s records, which is why the Moji_Joho collection registers so many forms.</p>
        <Table headers={["Character", "IVS variants (Moji_Joho)", "Typical use"]} rows={[
          ["邉 U+9089", "~47", "渡邉 surname variants"],
          ["邊 U+908A", "~30", "渡邊 surname variants"],
          ["辺 U+8FBA", "~10", "渡辺 surname variants"],
          ["葛 U+845B", "~8", "Place names (葛飾 etc.)"],
        ]} />
        <p className="mt-3">This is a case where IVS is essential: without it, government systems could not accurately record the legally distinct name variants that Japanese law requires preserving.</p>
        <CodeBlock>{`// The 邉 character with different IVS:
"邉"                    // Default glyph
"邉\\u{E0100}"          // Variant 1 (VS17)
"邉\\u{E0101}"          // Variant 2 (VS18)
// ... up to ~47 registered variants

// Each is one grapheme cluster:
const seg = new Intl.Segmenter();
[...seg.segment("邉\\u{E0100}")].length  // 1`}</CodeBlock>
        <div className="mt-4"><TryItButton text={"辻\u{E0100}辻"}>Inspect variation selectors in action</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="問題: 1つのコードポイント、多数の字形">
        <p>漢字統合（Han Unification）は同じ起源を共有する文字を単一のコードポイントに統合しました。しかし、正確なグリフ変種を指定する必要がある場合はどうすればよいでしょうか? 日本人の名前、歴史文書、書道の伝統は、フォントのデフォルトレンダリングを超えた精密なグリフ制御を要求します。</p>
        <p className="mt-3">例えば、辻（U+8FBB、一般的な日本の姓）には2つの認められた字形があります: 左の部首に点が1つのもの（一点しんにょう）と2つのもの（二点しんにょう）。どちらも「正しい」のですが、どちらが表示されるかはフォントに依存し、基本コードポイントだけでは選択できません。</p>
        <p className="mt-3">Unicode の解決策が<strong>異体字シーケンス（Variation Sequences）</strong>です: 基底文字の後に特別な異体字セレクタ文字を続けることで、正確なグリフ形式を指定します。</p>
      </Section>

      <Section title="IVS の仕組み: E0100 範囲">
        <p><strong>漢字異体字シーケンス（IVS: Ideographic Variation Sequences）</strong>は U+E0100 から U+E01EF の範囲の異体字セレクタ（VS17〜VS256、240個）を使用します。IVS は2文字のシーケンスです:</p>
        <CodeBlock>{`基底文字 + 異体字セレクタ = IVS

例:
葛 (U+845B) + VS17 (U+E0100) = 葛󠄀 (特定の異体字)
葛 (U+845B) 単体            = 葛  (デフォルトグリフ)`}</CodeBlock>
        <p className="mt-3">異体字セレクタは不可視です &mdash; それ自体はグリフを生成しません。しかし IVS 対応フォントはこのシーケンスを検出すると異なるグリフをレンダリングします。</p>
        <Table headers={["構成要素", "コードポイント", "可視?"]} rows={[
          ["基底文字: 葛", "U+845B", "はい"],
          ["異体字セレクタ: VS17", "U+E0100", "いいえ（不可視）"],
          ["シーケンス: 葛󠄀", "U+845B U+E0100", "はい（異体字グリフ）"],
        ]} />
        <p className="mt-3">JavaScript では、この範囲の各異体字セレクタはサロゲートペア（2 UTF-16 コードユニット）を必要とするため、IVS は1書記素クラスタにもかかわらず合計3〜4コードユニットを占めます。</p>
        <div className="mt-4"><TryItButton text={"葛\u{E0100}葛"}>葛を IVS あり/なしで比較する</TryItButton></div>
      </Section>

      <Section title="SVS: 絵文字と記号の異体字セレクタ">
        <p><strong>標準化異体字シーケンス（SVS: Standardized Variation Sequences）</strong>は、より小さな異体字セレクタセット U+FE00〜U+FE0F（VS1〜VS16）を使用します。用途は以下の通りです:</p>
        <Table headers={["セレクタ", "主な用途", "例"]} rows={[
          ["VS1 (U+FE00)", "CJK 互換変種", "芦 + VS1 で特定字形"],
          ["VS15 (U+FE0E)", "テキスト表示", "☺︎（テキストスタイル）"],
          ["VS16 (U+FE0F)", "絵文字表示", "☺️（絵文字スタイル）"],
        ]} />
        <p className="mt-3">最も広く知られた SVS の用法はテキスト/絵文字の切り替えです。多くの文字にはテキスト表示（モノクロ、シンプル）と絵文字表示（カラフル）の両方があります。VS15 でテキストスタイル、VS16 で絵文字スタイルを強制します:</p>
        <CodeBlock>{`// 同じ基底文字、異なる表示:
"\\u2764"           // ❤（デフォルト、通常は絵文字）
"\\u2764\\uFE0E"    // ❤︎（テキスト表示、VS15）
"\\u2764\\uFE0F"    // ❤️（絵文字表示、VS16）

// セレクタは不可視だがレンダリングを変更:
"❤️".length  // 2（基底 + VS16、両方 BMP 内）`}</CodeBlock>
        <p className="mt-3">IVS セレクタ（SMP にあり要サロゲート）と異なり、SVS セレクタは BMP（U+FE00〜FE0F）にあり、各1 UTF-16 コードユニットです。</p>
      </Section>

      <Section title="IVD コレクション: Adobe-Japan1 と Moji_Joho">
        <p>どの異体字セレクタがどのグリフにマッピングされるかは任意ではなく、Unicode コンソーシアムが管理する<strong>漢字異体字データベース（IVD: Ideographic Variation Database）</strong>に記録されています。IVD には名前付きの<strong>コレクション</strong>が含まれます:</p>
        <Table headers={["コレクション", "範囲", "エントリ数"]} rows={[
          ["Adobe-Japan1", "日本語タイポグラフィ（AJ1 CID）", "約14,700"],
          ["Moji_Joho", "日本政府の文字情報", "約11,000"],
          ["Hanyo-Denshi", "日本の行政システム", "約11,000"],
          ["KRName", "韓国の人名異体字", "約2,200"],
        ]} />
        <p className="mt-3"><strong>Adobe-Japan1</strong> は最も広くサポートされているコレクションです。IVS シーケンスを Adobe-Japan1-7 文字コレクションの特定の CID（Character ID）番号にマッピングし、プロフェッショナルな日本語フォントがこれを実装しています。Adobe-Japan1 IVS 対応フォントは数千のグリフ変種をレンダリングできます。</p>
        <p className="mt-3"><strong>Moji_Joho</strong>（文字情報）は IPA（情報処理推進機構）が管理し、公式な政府文書や戸籍システムで使用される文字変種に焦点を当てています。</p>
      </Section>

      <Section title="フォントサポート: IVS が実際に機能する条件">
        <p>IVS はフォントがサポートしている場合のみ機能します。フォントには以下が必要です:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li>サポートする各 IVS シーケンスのグリフ変種</li>
          <li>基底文字+セレクタのペアをグリフにマッピングする <C>cmap</C> テーブル（具体的にはフォーマット14、Unicode Variation Sequences）</li>
        </ul>
        <p className="mt-3">IVS をサポートする主なフォント:</p>
        <Table headers={["フォント", "コレクション", "プラットフォーム"]} rows={[
          ["IPAmj明朝", "Moji_Joho", "クロスプラットフォーム（無料）"],
          ["Noto Sans CJK", "Adobe-Japan1（部分的）", "クロスプラットフォーム（無料）"],
          ["小塚明朝", "Adobe-Japan1", "Adobe 製品"],
          ["游明朝", "Adobe-Japan1（部分的）", "Windows / macOS"],
          ["ヒラギノ明朝", "Adobe-Japan1（部分的）", "macOS"],
        ]} />
        <p className="mt-3">フォントが特定の IVS をサポートしていない場合、単に基底文字のデフォルトグリフを描画し、異体字セレクタを無視します。これは優雅なフォールバックです &mdash; テキストは読める状態のまま、ただし要求された特定の変種ではありません。</p>
        <div className="mt-4"><TryItButton text={"辻\u{E0100}辻"}>辻の異体字を比較する</TryItButton></div>
      </Section>

      <Section title="レコードホルダー: 邉とその47の異体字">
        <p>邉（U+9089）は登録 IVS シーケンス数の最多記録を保持しています。Moji_Joho コレクションに約47の変種形式があり、この文字が数世紀にわたって日本の戸籍でどれほど多様に書かれてきたかを反映しています。</p>
        <p className="mt-3">姓の「渡邉」（わたなべ）は日本で数十の異体字綴りがあることで悪名高い存在です。戸籍を管理する市区町村役場は各家庭の記録に使用された正確な変種を忠実に再現する必要があり、これが Moji_Joho コレクションがこれほど多くの字形を登録している理由です。</p>
        <Table headers={["文字", "IVS 変種（Moji_Joho）", "代表的用途"]} rows={[
          ["邉 U+9089", "約47", "渡邉 姓の変種"],
          ["邊 U+908A", "約30", "渡邊 姓の変種"],
          ["辺 U+8FBA", "約10", "渡辺 姓の変種"],
          ["葛 U+845B", "約8", "地名（葛飾 等）"],
        ]} />
        <p className="mt-3">これは IVS が不可欠なケースです: IVS なしでは、日本の法律が保存を要求する法的に異なる名前の変種を政府システムが正確に記録することができません。</p>
        <CodeBlock>{`// 邉の異なる IVS:
"邉"                    // デフォルトグリフ
"邉\\u{E0100}"          // 異体字1（VS17）
"邉\\u{E0101}"          // 異体字2（VS18）
// ... 約47の登録変種まで

// 各々は1書記素クラスタ:
const seg = new Intl.Segmenter();
[...seg.segment("邉\\u{E0100}")].length  // 1`}</CodeBlock>
        <div className="mt-4"><TryItButton text={"辻\u{E0100}辻"}>異体字セレクタの動作を検査する</TryItButton></div>
      </Section>
    </>
  );
}

export default function IvsContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

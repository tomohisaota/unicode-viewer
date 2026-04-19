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
      <Section title="Simple Emoji: One Code Point, One Glyph">
        <p>The simplest emoji are single Unicode code points. Characters like <C>😀</C> (U+1F600), <C>❤</C> (U+2764), and <C>☀</C> (U+2600) each occupy exactly one code point. However, &ldquo;simple&rdquo; is relative &mdash; even a single emoji can occupy more than one unit in memory.</p>
        <p className="mt-3">Emoji below U+FFFF (like <C>☀</C> at U+2600) fit in a single UTF-16 code unit, so <C>{'"☀".length'}</C> returns 1. But most modern emoji live above U+FFFF in the Supplementary Multilingual Plane. <C>😀</C> at U+1F600 requires a surrogate pair in UTF-16, so <C>{'"😀".length'}</C> returns 2 even though it is a single code point.</p>
        <p className="mt-3">This distinction matters for any code that indexes into strings. Even the most basic emoji can trip up naive string handling if it falls in the supplementary planes. The key insight: one visual character does not mean one unit of storage.</p>
      </Section>

      <Section title="Text vs Emoji Presentation: VS15 and VS16">
        <p>Some code points have dual lives. The character <C>☺</C> (U+263A) existed in Unicode long before emoji &mdash; it was a plain text symbol. When emoji arrived, the same code point gained a colorful emoji rendering. Unicode solves the ambiguity with two invisible <strong>variation selectors</strong>:</p>
        <Table headers={["Selector", "Code point", "Effect", "Example"]} rows={[
          ["VS15 (text)", "U+FE0E", "Force monochrome/text presentation", "☺︎"],
          ["VS16 (emoji)", "U+FE0F", "Force colorful emoji presentation", "☺️"],
        ]} />
        <p className="mt-3">The string <C>☺︎☺️</C> contains two visually distinct characters, but their base code point is identical &mdash; only the trailing variation selector differs. Without a variation selector, the default presentation depends on the platform and context. On most phones, <C>☺</C> defaults to emoji style; in many terminal emulators, it defaults to text style.</p>
        <p className="mt-3">VS16 (U+FE0F) is especially common in ZWJ sequences. The rainbow flag <C>🏳️‍🌈</C> contains a VS16 after the white flag to ensure it renders in emoji style before the ZWJ joins it with the rainbow. Stripping VS16 can break the entire sequence.</p>
        <div className="mt-4"><TryItButton text="☺︎☺️">Compare text vs emoji presentation</TryItButton></div>
      </Section>

      <Section title="Skin Tone Modifiers: Fitzpatrick Scale in Unicode">
        <p>Unicode 8.0 introduced five skin tone modifiers based on the Fitzpatrick dermatological scale. These are code points U+1F3FB through U+1F3FF, placed immediately after a compatible base emoji to change its skin color:</p>
        <Table headers={["Modifier", "Code point", "Fitzpatrick type", "Example"]} rows={[
          ["🏻", "U+1F3FB", "Type 1-2 (light)", "👍🏻"],
          ["🏼", "U+1F3FC", "Type 3 (medium-light)", "👍🏼"],
          ["🏽", "U+1F3FD", "Type 4 (medium)", "👍🏽"],
          ["🏾", "U+1F3FE", "Type 5 (medium-dark)", "👍🏾"],
          ["🏿", "U+1F3FF", "Type 6 (dark)", "👍🏿"],
        ]} />
        <p className="mt-3">A skin-toned emoji is two code points forming one grapheme cluster. <C>👍🏽</C> = U+1F44D (thumbs up) + U+1F3FD (medium skin tone). In UTF-16 both code points are in the supplementary plane, each requiring a surrogate pair, so <C>{'"👍🏽".length'}</C> returns 4, <C>{'[..."👍🏽"].length'}</C> returns 2, but <C>Intl.Segmenter</C> correctly reports 1.</p>
        <p className="mt-3">Not every emoji supports skin tones. Applying a modifier to an incompatible base (like a car or a pizza) simply renders the modifier as a separate colored square. The full list of compatible bases is defined in Unicode&rsquo;s <C>emoji-data.txt</C> under the <C>Emoji_Modifier_Base</C> property.</p>
        <div className="mt-4"><TryItButton text="👍🏽">Inspect skin tone modifier</TryItButton></div>
      </Section>

      <Section title="ZWJ Sequences: Gluing Emoji Together">
        <p>The Zero Width Joiner (U+200D) is an invisible character that &ldquo;glues&rdquo; emoji together into a single grapheme cluster. The family emoji <C>👨‍👩‍👧‍👦</C> is constructed from four individual emoji connected by three ZWJ characters:</p>
        <CodeBlock>{`👨‍👩‍👧‍👦 = 👨 + ZWJ + 👩 + ZWJ + 👧 + ZWJ + 👦
     = U+1F468 U+200D U+1F469 U+200D U+1F467 U+200D U+1F466
     = 7 code points → 11 UTF-16 code units → 1 grapheme cluster`}</CodeBlock>
        <p className="mt-3">ZWJ sequences power a huge variety of modern emoji. Profession emoji combine a person with a tool: 👩‍🚀 (woman + ZWJ + rocket), 👨‍💻 (man + ZWJ + laptop), 👩‍🔬 (woman + ZWJ + microscope). Couple emoji combine two people with a heart: 👩‍❤️‍👨. The rainbow flag combines a white flag with a rainbow: 🏳️‍🌈 = 🏳 + VS16 + ZWJ + 🌈.</p>
        <p className="mt-3">What happens when a platform does not recognize a particular ZWJ sequence? The fallback is graceful &mdash; the individual component emoji are shown side by side. This means new ZWJ combinations can be proposed and used before they are officially standardized; older systems simply display the components.</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦">Inspect the family emoji</TryItButton></div>
      </Section>

      <Section title="Flag Emoji: Regional Indicator Pairs">
        <p>Country flag emoji are not standalone characters. They are pairs of <strong>Regional Indicator Symbols</strong> (U+1F1E6 through U+1F1FF), a set of 26 characters that map to the letters A through Z. Two regional indicators together form a flag based on the ISO 3166-1 alpha-2 country code:</p>
        <Table headers={["Flag", "Indicators", "Country code", "UTF-16 length"]} rows={[
          ["🇯🇵", "🇯 (U+1F1EF) + 🇵 (U+1F1F5)", "JP (Japan)", "4"],
          ["🇺🇸", "🇺 (U+1F1FA) + 🇸 (U+1F1F8)", "US (USA)", "4"],
          ["🇬🇧", "🇬 (U+1F1EC) + 🇧 (U+1F1E7)", "GB (UK)", "4"],
        ]} />
        <p className="mt-3">Each regional indicator is in the supplementary plane (above U+FFFF), so each needs a surrogate pair in UTF-16. One flag = 2 code points = 4 UTF-16 code units. Three flags side by side: <C>{'"🇯🇵🇺🇸🇬🇧".length'}</C> returns 12, but there are only 3 grapheme clusters.</p>
        <p className="mt-3">This pairing system means that concatenating flags carelessly can create unexpected results. If you split <C>🇯🇵🇺🇸</C> between the 🇵 and 🇺, those two indicators may join to form 🇵🇺 (the flag of an unintended country, or an unrecognized pair). This is why grapheme-cluster-aware splitting is essential when handling text containing flags.</p>
        <div className="mt-4"><TryItButton text="🇯🇵🇺🇸🇬🇧">Inspect flag emoji</TryItButton></div>
      </Section>

      <Section title='Why emoji.length Is Always Surprising'>
        <p>Bringing it all together, here is what JavaScript&rsquo;s <C>.length</C> reports for various emoji constructions:</p>
        <Table headers={["Emoji", "Visual", ".length", "Code points", "Grapheme clusters"]} rows={[
          ["Simple (BMP)", "☀", "1", "1", "1"],
          ["Simple (SMP)", "😀", "2", "1", "1"],
          ["With VS16", "☺️", "2", "2", "1"],
          ["Skin tone", "👍🏽", "4", "2", "1"],
          ["Flag", "🇯🇵", "4", "2", "1"],
          ["ZWJ family", "👨‍👩‍👧‍👦", "11", "7", "1"],
          ["ZWJ flag", "🏳️‍🌈", "6", "4", "1"],
        ]} />
        <p className="mt-3">The pattern is clear: everything that <em>looks</em> like one character has a <C>.length</C> that ranges from 1 to 11+. The only reliable way to count &ldquo;characters&rdquo; as users perceive them is to count grapheme clusters using <C>Intl.Segmenter</C>.</p>
        <CodeBlock>{`// The only reliable emoji-aware character count
const count = (s: string) =>
  [...new Intl.Segmenter().segment(s)].length;

count("👨‍👩‍👧‍👦");  // 1
count("🇯🇵🇺🇸🇬🇧"); // 3
count("☺︎☺️");    // 2
count("👍🏽");    // 1`}</CodeBlock>
        <p className="mt-3">String reversal is another common pitfall. <C>{'[..."👨‍👩‍👧‍👦"].reverse().join("")'}</C> produces a garbled sequence because it reverses the individual code points (including ZWJ characters), destroying the intended grouping. Flag emoji suffer even worse: reversing <C>🇯🇵</C> at the code point level yields <C>🇵🇯</C>, which is a completely different flag. Always operate on grapheme clusters, not raw code points or code units.</p>
        <div className="mt-4"><TryItButton text="🏳️‍🌈">Inspect the rainbow flag</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="シンプルな絵文字: 1コードポイント、1グリフ">
        <p>最もシンプルな絵文字は単一のUnicodeコードポイントです。<C>😀</C>（U+1F600）、<C>❤</C>（U+2764）、<C>☀</C>（U+2600）はそれぞれ1コードポイントだけを占めます。しかし「シンプル」は相対的な概念で、たった1つの絵文字でもメモリ上では複数のユニットを占めることがあります。</p>
        <p className="mt-3">U+FFFF以下の絵文字（<C>☀</C> の U+2600 など）はUTF-16の1コードユニットに収まるため、<C>{'"☀".length'}</C> は 1 を返します。しかし現代のほとんどの絵文字は U+FFFF を超える追加多言語面（SMP）に存在します。U+1F600 の <C>😀</C> はUTF-16でサロゲートペアが必要なため、<C>{'"😀".length'}</C> は 2 を返します。たった1コードポイントなのにです。</p>
        <p className="mt-3">この違いは文字列のインデックスアクセスを行うすべてのコードに影響します。最も基本的な絵文字でさえ、追加面に存在する場合は素朴な文字列処理を狂わせる可能性があります。重要な洞察：1つの視覚的文字は、1単位のストレージを意味しません。</p>
      </Section>

      <Section title="テキスト vs 絵文字表示: VS15 と VS16">
        <p>一部のコードポイントには二面性があります。<C>☺</C>（U+263A）は絵文字よりずっと前からUnicodeに存在していた記号です。絵文字が普及すると、同じコードポイントにカラフルな絵文字レンダリングが加わりました。Unicodeは2つの不可視な<strong>異体字セレクタ</strong>でこの曖昧さを解決します：</p>
        <Table headers={["セレクタ", "コードポイント", "効果", "例"]} rows={[
          ["VS15（テキスト）", "U+FE0E", "モノクロ/テキスト表示を強制", "☺︎"],
          ["VS16（絵文字）", "U+FE0F", "カラフルな絵文字表示を強制", "☺️"],
        ]} />
        <p className="mt-3"><C>☺︎☺️</C> には見た目が異なる2つの文字が含まれていますが、ベースのコードポイントは同一で、末尾の異体字セレクタだけが異なります。異体字セレクタがない場合のデフォルト表示はプラットフォームと文脈に依存します。ほとんどのスマートフォンでは <C>☺</C> は絵文字スタイルがデフォルトですが、多くのターミナルエミュレータではテキストスタイルがデフォルトです。</p>
        <p className="mt-3">VS16（U+FE0F）はZWJシーケンスで特に重要です。レインボーフラッグ <C>🏳️‍🌈</C> では、白旗の後にVS16が配置され、ZWJで虹と結合される前に絵文字スタイルでのレンダリングが保証されます。VS16を除去するとシーケンス全体が壊れる可能性があります。</p>
        <div className="mt-4"><TryItButton text="☺︎☺️">テキスト vs 絵文字表示を比較する</TryItButton></div>
      </Section>

      <Section title="肌色修飾子: Fitzpatrick スケール">
        <p>Unicode 8.0 で、皮膚科学のフィッツパトリックスケールに基づく5つの肌色修飾子が導入されました。U+1F3FB から U+1F3FF のコードポイントで、対応するベース絵文字の直後に配置して肌色を変更します：</p>
        <Table headers={["修飾子", "コードポイント", "Fitzpatrick タイプ", "例"]} rows={[
          ["🏻", "U+1F3FB", "タイプ 1-2（明るい）", "👍🏻"],
          ["🏼", "U+1F3FC", "タイプ 3（やや明るい）", "👍🏼"],
          ["🏽", "U+1F3FD", "タイプ 4（中間）", "👍🏽"],
          ["🏾", "U+1F3FE", "タイプ 5（やや暗い）", "👍🏾"],
          ["🏿", "U+1F3FF", "タイプ 6（暗い）", "👍🏿"],
        ]} />
        <p className="mt-3">肌色付き絵文字は2コードポイントで1書記素クラスタを形成します。<C>👍🏽</C> = U+1F44D（サムズアップ）+ U+1F3FD（中間の肌色）。UTF-16では両コードポイントとも追加面にあり、各サロゲートペアが必要なため、<C>{'"👍🏽".length'}</C> は 4、<C>{'[..."👍🏽"].length'}</C> は 2 ですが、<C>Intl.Segmenter</C> は正しく 1 と報告します。</p>
        <p className="mt-3">すべての絵文字が肌色をサポートするわけではありません。対応していないベース（車やピザなど）に修飾子を適用すると、修飾子が別の色付き四角形として表示されるだけです。対応するベースの完全なリストは Unicode の <C>emoji-data.txt</C> の <C>Emoji_Modifier_Base</C> プロパティで定義されています。</p>
        <div className="mt-4"><TryItButton text="👍🏽">肌色修飾子を分析する</TryItButton></div>
      </Section>

      <Section title="ZWJシーケンス: 絵文字を接着する">
        <p>ゼロ幅接合子（Zero Width Joiner、U+200D）は、複数の絵文字を1つの書記素クラスタに「接着」する不可視文字です。家族絵文字 <C>👨‍👩‍👧‍👦</C> は4つの個別の絵文字が3つのZWJで結合されています：</p>
        <CodeBlock>{`👨‍👩‍👧‍👦 = 👨 + ZWJ + 👩 + ZWJ + 👧 + ZWJ + 👦
     = U+1F468 U+200D U+1F469 U+200D U+1F467 U+200D U+1F466
     = 7コードポイント → 11 UTF-16コードユニット → 1書記素クラスタ`}</CodeBlock>
        <p className="mt-3">ZWJシーケンスは多種多様な現代の絵文字を支えています。職業絵文字は人物と道具を組み合わせます：👩‍🚀（女性 + ZWJ + ロケット）、👨‍💻（男性 + ZWJ + ノートPC）、👩‍🔬（女性 + ZWJ + 顕微鏡）。カップル絵文字は2人の人物をハートで結合：👩‍❤️‍👨。レインボーフラッグは白旗と虹を結合：🏳️‍🌈 = 🏳 + VS16 + ZWJ + 🌈。</p>
        <p className="mt-3">プラットフォームが特定のZWJシーケンスを認識しない場合はどうなるでしょうか？フォールバックは優雅で、構成要素の絵文字が個別に並んで表示されます。これにより、公式に標準化される前から新しいZWJの組み合わせを提案・使用でき、古いシステムではコンポーネントがそのまま表示されるだけです。</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦">家族絵文字を分析する</TryItButton></div>
      </Section>

      <Section title="国旗絵文字: 地域インジケータのペア">
        <p>国旗絵文字は独立した文字ではありません。<strong>地域インジケータ記号</strong>（U+1F1E6 から U+1F1FF）のペアで構成されます。これは A から Z に対応する26文字のセットで、2つの地域インジケータが ISO 3166-1 alpha-2 の国コードに基づいて国旗を形成します：</p>
        <Table headers={["国旗", "インジケータ", "国コード", "UTF-16 length"]} rows={[
          ["🇯🇵", "🇯 (U+1F1EF) + 🇵 (U+1F1F5)", "JP（日本）", "4"],
          ["🇺🇸", "🇺 (U+1F1FA) + 🇸 (U+1F1F8)", "US（アメリカ）", "4"],
          ["🇬🇧", "🇬 (U+1F1EC) + 🇧 (U+1F1E7)", "GB（イギリス）", "4"],
        ]} />
        <p className="mt-3">各地域インジケータは追加面（U+FFFFを超える）にあるため、UTF-16ではサロゲートペアが必要です。1つの国旗 = 2コードポイント = 4 UTF-16コードユニット。3つの国旗を並べると：<C>{'"🇯🇵🇺🇸🇬🇧".length'}</C> は 12 を返しますが、書記素クラスタは3つだけです。</p>
        <p className="mt-3">このペアリング方式では、国旗を不注意に連結すると予期しない結果が生じます。<C>🇯🇵🇺🇸</C> を 🇵 と 🇺 の間で分割すると、これら2つのインジケータが結合して 🇵🇺（意図しない国の国旗、または認識されないペア）を形成する可能性があります。国旗を含むテキストを扱う際に書記素クラスタ対応の分割が不可欠な理由です。</p>
        <div className="mt-4"><TryItButton text="🇯🇵🇺🇸🇬🇧">国旗絵文字を分析する</TryItButton></div>
      </Section>

      <Section title="emoji.length が常に驚きをもたらす理由">
        <p>すべてをまとめると、JavaScriptの <C>.length</C> が様々な絵文字構成に対して返す値は次の通りです：</p>
        <Table headers={["絵文字", "表示", ".length", "コードポイント", "書記素クラスタ"]} rows={[
          ["シンプル（BMP）", "☀", "1", "1", "1"],
          ["シンプル（SMP）", "😀", "2", "1", "1"],
          ["VS16付き", "☺️", "2", "2", "1"],
          ["肌色付き", "👍🏽", "4", "2", "1"],
          ["国旗", "🇯🇵", "4", "2", "1"],
          ["ZWJ 家族", "👨‍👩‍👧‍👦", "11", "7", "1"],
          ["ZWJ 国旗", "🏳️‍🌈", "6", "4", "1"],
        ]} />
        <p className="mt-3">パターンは明白です：「1文字」に<em>見える</em>ものすべてが、<C>.length</C> では 1 から 11 以上の範囲になります。ユーザーが知覚する「文字」を確実に数える唯一の方法は、<C>Intl.Segmenter</C> で書記素クラスタを数えることです。</p>
        <CodeBlock>{`// 唯一の信頼できる絵文字対応の文字数カウント
const count = (s: string) =>
  [...new Intl.Segmenter().segment(s)].length;

count("👨‍👩‍👧‍👦");  // 1
count("🇯🇵🇺🇸🇬🇧"); // 3
count("☺︎☺️");    // 2
count("👍🏽");    // 1`}</CodeBlock>
        <p className="mt-3">文字列の反転も一般的な落とし穴です。<C>{'[..."👨‍👩‍👧‍👦"].reverse().join("")'}</C> は個々のコードポイント（ZWJ文字を含む）を逆順にするため、意図したグルーピングが壊れてしまいます。国旗絵文字はさらに深刻で、<C>🇯🇵</C> をコードポイントレベルで反転すると <C>🇵🇯</C> になり、まったく別の国旗になります。常にコードユニットやコードポイントではなく、書記素クラスタ単位で操作してください。</p>
        <div className="mt-4"><TryItButton text="🏳️‍🌈">レインボーフラッグを分析する</TryItButton></div>
      </Section>
    </>
  );
}

export default function EmojiAnatomyContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

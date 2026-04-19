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
      <Section title='The "One Character" Illusion'>
        <p>How many characters are in this string: <C>👨‍👩‍👧‍👦</C>?</p>
        <p className="mt-3">Most people answer &ldquo;one&rdquo; &mdash; it looks like a single family emoji. But ask JavaScript, and you get three different answers:</p>
        <Table headers={["Method", "Result", "What it counts"]} rows={[
          ['"👨‍👩‍👧‍👦".length', "11", "UTF-16 code units"],
          ['[..."👨‍👩‍👧‍👦"].length', "7", "Code points"],
          ["Intl.Segmenter", "1", "Grapheme clusters (visual characters)"],
        ]} />
        <p className="mt-3">The family emoji is composed of 7 code points: four person/child emoji joined by three Zero Width Joiners (ZWJ). In UTF-16, each emoji above U+FFFF takes two code units (a surrogate pair), giving <C>.length</C> a count of 11.</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦">Inspect the family emoji</TryItButton></div>
      </Section>

      <Section title="Three Different Counts">
        <p>Understanding the three counts is fundamental to working with Unicode correctly:</p>
        <Table headers={["Unit", "What it is", "Example: 👍🏽"]} rows={[
          ["UTF-16 code units", "What .length counts. Includes surrogate pairs.", "4 units"],
          ["Code points", "Basic Unicode unit (U+XXXX). What [...str] gives.", "2 points"],
          ["Grapheme clusters", 'What humans see as "one character".', "1 cluster"],
        ]} />
        <p className="mt-3"><C>👍🏽</C> is two code points: 👍 (U+1F44D) + skin tone modifier 🏽 (U+1F3FD). Each is above U+FFFF, so each takes two UTF-16 code units. But it renders as one grapheme cluster.</p>
        <div className="mt-4"><TryItButton text="👍🏽">Inspect skin tone modifier</TryItButton></div>
      </Section>

      <Section title="Flag Emoji: Regional Indicator Math">
        <p>Flag emoji are pairs of Regional Indicator symbols forming one grapheme cluster:</p>
        <Table headers={["Flag", "Code points", "Meaning"]} rows={[
          ["🇯🇵", "U+1F1EF + U+1F1F5", "Regional J + P"],
          ["🇺🇸", "U+1F1FA + U+1F1F8", "Regional U + S"],
          ["🇬🇧", "U+1F1EC + U+1F1E7", "Regional G + B"],
        ]} />
        <p className="mt-3">Three flags, but <C>{'"🇯🇵🇺🇸🇬🇧".length'}</C> returns 12. Only <C>Intl.Segmenter</C> correctly identifies 3 grapheme clusters.</p>
        <div className="mt-4"><TryItButton text="🇯🇵🇺🇸🇬🇧">Inspect flag emoji</TryItButton></div>
      </Section>

      <Section title="When Normalization Changes the Count">
        <p>The string <C>café</C> can be encoded two ways in Unicode:</p>
        <Table headers={["Form", "Code points", "Representation"]} rows={[
          ["NFC (composed)", "c a f é (4 CPs)", "é = U+00E9"],
          ["NFD (decomposed)", "c a f e ◌́ (5 CPs)", "e + combining acute = U+0065 U+0301"],
        ]} />
        <p className="mt-3">Both look identical &mdash; 4 grapheme clusters. But code point count differs (4 vs 5), and so does <C>.length</C>.</p>
        <div className="mt-4"><TryItButton text="café" norm={true}>Compare NFC vs NFD</TryItButton></div>
      </Section>

      <Section title="Practical Consequences">
        <p>Getting character counting wrong causes real bugs:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>String truncation</strong>: Cutting at <C>.length / 2</C> can split a surrogate pair, producing U+FFFD.</li>
          <li><strong>Cursor movement</strong>: Should skip the entire grapheme cluster, not individual code points.</li>
          <li><strong>Input validation</strong>: &ldquo;Max 10 characters&rdquo; should count grapheme clusters, not <C>.length</C>.</li>
          <li><strong>String reversal</strong>: <C>{'[...str].reverse().join("")'}</C> breaks ZWJ sequences and flag emoji.</li>
        </ul>
      </Section>

      <Section title="The Solution: Intl.Segmenter">
        <p><C>Intl.Segmenter</C> (available in all modern browsers since 2024) correctly segments text by grapheme cluster boundaries:</p>
        <CodeBlock>{`const segmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme"
});

const text = "👨‍👩‍👧‍👦🇯🇵café";
const segments = [...segmenter.segment(text)];
console.log(segments.length); // 6 (correct!)

// Compare:
console.log(text.length);      // 18 (UTF-16 units)
console.log([...text].length); // 12 (code points)`}</CodeBlock>
        <p className="mt-3">This tool uses <C>Intl.Segmenter</C> internally. Each cell in the grid represents one grapheme cluster &mdash; click any cell to see its internal structure.</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦🇯🇵café">Try all examples together</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="「1文字」という幻想">
        <p>この文字列は何文字でしょうか: <C>👨‍👩‍👧‍👦</C></p>
        <p className="mt-3">多くの人は「1文字」と答えます。しかし JavaScript に聞くと、数え方によって3つの異なる答えが返ります:</p>
        <Table headers={["方法", "結果", "何を数えているか"]} rows={[
          ['"👨‍👩‍👧‍👦".length', "11", "UTF-16 コードユニット"],
          ['[..."👨‍👩‍👧‍👦"].length', "7", "コードポイント"],
          ["Intl.Segmenter", "1", "書記素クラスタ（見た目の文字）"],
        ]} />
        <p className="mt-3">家族絵文字は7つのコードポイントで構成: 4つの人物絵文字を3つのゼロ幅接合子（ZWJ）で結合。UTF-16 では U+FFFF 超の絵文字は各2ユニット（サロゲートペア）のため、<C>.length</C> は 11。</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦">家族絵文字を分析する</TryItButton></div>
      </Section>

      <Section title="3つの異なるカウント">
        <p>3つのカウントの違いは Unicode を正しく扱う基本です:</p>
        <Table headers={["単位", "意味", "例: 👍🏽"]} rows={[
          ["UTF-16 コードユニット", ".length が返す値。サロゲートペアを含む。", "4 ユニット"],
          ["コードポイント", "Unicode の基本単位 (U+XXXX)。[...str] で取得。", "2 ポイント"],
          ["書記素クラスタ", "人間が「1文字」と認識する単位。", "1 クラスタ"],
        ]} />
        <p className="mt-3"><C>👍🏽</C> は2コードポイント: 👍 (U+1F44D) + 肌色修飾子 🏽 (U+1F3FD)。各 U+FFFF 超で UTF-16 では各2ユニット。しかし見た目は1文字 = 1書記素クラスタ。</p>
        <div className="mt-4"><TryItButton text="👍🏽">肌色修飾子を分析する</TryItButton></div>
      </Section>

      <Section title="国旗絵文字: 地域インジケータの組み合わせ">
        <p>国旗絵文字は地域インジケータ記号のペアで1書記素クラスタを形成:</p>
        <Table headers={["国旗", "コードポイント", "意味"]} rows={[
          ["🇯🇵", "U+1F1EF + U+1F1F5", "地域 J + P"],
          ["🇺🇸", "U+1F1FA + U+1F1F8", "地域 U + S"],
          ["🇬🇧", "U+1F1EC + U+1F1E7", "地域 G + B"],
        ]} />
        <p className="mt-3">3つの国旗ですが <C>{'"🇯🇵🇺🇸🇬🇧".length'}</C> は 12。<C>Intl.Segmenter</C> だけが正しく3書記素クラスタを識別。</p>
        <div className="mt-4"><TryItButton text="🇯🇵🇺🇸🇬🇧">国旗絵文字を分析する</TryItButton></div>
      </Section>

      <Section title="正規化でカウントが変わる">
        <p><C>café</C> は Unicode で2通りの表現が可能:</p>
        <Table headers={["形式", "コードポイント", "表現"]} rows={[
          ["NFC（合成）", "c a f é (4 CP)", "é = U+00E9"],
          ["NFD（分解）", "c a f e ◌́ (5 CP)", "e + 結合アキュート = U+0065 U+0301"],
        ]} />
        <p className="mt-3">画面上は同一で4書記素クラスタ。しかしコードポイント数（4 vs 5）と <C>.length</C> は異なる。</p>
        <div className="mt-4"><TryItButton text="café" norm={true}>NFC と NFD を比較する</TryItButton></div>
      </Section>

      <Section title="実用上の影響">
        <p>文字カウントの間違いは実際のバグを引き起こします:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>文字列の切り詰め</strong>: <C>.length / 2</C> で切るとサロゲートペアが分断され U+FFFD に。</li>
          <li><strong>カーソル移動</strong>: 「1文字」移動は書記素クラスタ全体をスキップすべき。</li>
          <li><strong>入力バリデーション</strong>: 「最大10文字」は書記素クラスタで数えるべき。</li>
          <li><strong>文字列反転</strong>: <C>{'[...str].reverse().join("")'}</C> は ZWJ シーケンスや国旗絵文字を壊す。</li>
        </ul>
      </Section>

      <Section title="解決策: Intl.Segmenter">
        <p><C>Intl.Segmenter</C>（2024年以降の全モダンブラウザで利用可能）は書記素クラスタ境界で正しく分割:</p>
        <CodeBlock>{`const segmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme"
});

const text = "👨‍👩‍👧‍👦🇯🇵café";
const segments = [...segmenter.segment(text)];
console.log(segments.length); // 6（正解！）

// 比較:
console.log(text.length);      // 18（UTF-16 ユニット）
console.log([...text].length); // 12（コードポイント）`}</CodeBlock>
        <p className="mt-3">このツールは <C>Intl.Segmenter</C> を内部で使用。グリッドの各セルが1書記素クラスタを表し、クリックで内部構造を確認できます。</p>
        <div className="mt-4"><TryItButton text="👨‍👩‍👧‍👦🇯🇵café">全ての例をまとめて試す</TryItButton></div>
      </Section>
    </>
  );
}

export default function GraphemeClustersContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

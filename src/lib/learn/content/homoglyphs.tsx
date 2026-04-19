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
      <Section title="The Threat: Characters That Look Alike">
        <p>Unicode contains over 150,000 characters from hundreds of scripts. Many of these characters are visually identical or nearly identical, despite being completely different code points from different writing systems. These are called <strong>homoglyphs</strong>.</p>
        <p className="mt-3">The most notorious example: Latin <C>a</C> (U+0061) and Cyrillic <C>а</C> (U+0430). They are pixel-perfect identical in most fonts, but they are distinct Unicode characters from different scripts.</p>
        <Table headers={["Looks like", "Latin", "Cyrillic", "Greek"]} rows={[
          ["A", "U+0041 A", "U+0410 А", "U+0391 Α"],
          ["a", "U+0061 a", "U+0430 а", "—"],
          ["B", "U+0042 B", "U+0412 В", "U+0392 Β"],
          ["E", "U+0045 E", "U+0415 Е", "U+0395 Ε"],
          ["o", "U+006F o", "U+043E о", "U+03BF ο"],
          ["p", "U+0070 p", "U+0440 р", "U+03C1 ρ"],
          ["x", "U+0078 x", "U+0445 х", "U+03C7 χ"],
        ]} />
        <p className="mt-3">This is not a bug &mdash; these are legitimately different characters that happen to have converged on the same visual form. But attackers exploit this coincidence.</p>
        <div className="mt-4"><TryItButton text="AАΑ aа oоο">Compare Latin, Cyrillic, and Greek lookalikes</TryItButton></div>
      </Section>

      <Section title="Multi-Script Homoglyphs in Depth">
        <p>The problem extends far beyond Latin/Cyrillic. Unicode contains homoglyphs across many script pairs:</p>
        <Table headers={["Visual", "Scripts involved", "Code points"]} rows={[
          ["1 / l / I", "Digit / Latin lower / Latin upper", "U+0031, U+006C, U+0049"],
          ["0 / O / О", "Digit / Latin / Cyrillic", "U+0030, U+004F, U+041E"],
          ["н / H", "Cyrillic lower / Latin upper", "U+043D, U+0048"],
          ["ν / v", "Greek lower / Latin lower", "U+03BD, U+0076"],
          ["ℓ / l", "Script small L / Latin L", "U+2113, U+006C"],
          ["⁰ / ° / o", "Superscript 0 / Degree / Latin o", "U+2070, U+00B0, U+006F"],
          ["ー / — / ─", "Katakana / Em dash / Box drawing", "U+30FC, U+2014, U+2500"],
        ]} />
        <p className="mt-3">Fullwidth characters add another dimension: <C>Ａ</C> (U+FF21, FULLWIDTH LATIN CAPITAL LETTER A) looks similar to <C>A</C> (U+0041) in some contexts. Mathematical alphanumeric symbols (U+1D400&ndash;U+1D7FF) provide yet more lookalikes: <C>𝐀</C> (U+1D400, MATHEMATICAL BOLD CAPITAL A).</p>
      </Section>

      <Section title="Real-World Attacks">
        <p>Homoglyph attacks have caused real damage:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>IDN homograph attacks</strong>: Registering domains like <C>аpple.com</C> (with Cyrillic а) that display identically to <C>apple.com</C> in browser address bars. This led to the development of IDN display policies in browsers.</li>
          <li><strong>Source code attacks (Trojan Source)</strong>: Inserting Bidi override characters or homoglyphs in source code to make malicious logic appear benign during code review. A 2021 Cambridge paper demonstrated how this could inject vulnerabilities invisible to human reviewers.</li>
          <li><strong>Phishing emails</strong>: Spoofing sender names or URLs using mixed-script homoglyphs that pass visual inspection.</li>
          <li><strong>Social media impersonation</strong>: Creating usernames that look identical to legitimate accounts using Cyrillic or Greek substitutions.</li>
        </ul>
        <CodeBlock>{`// These strings look identical but are different:
const latin  = "apple";      // All Latin
const mixed  = "аpple";      // Cyrillic а + Latin pple

latin === mixed              // false
latin.length === mixed.length // true (both 5)

// Byte comparison reveals the difference:
latin.codePointAt(0)  // 97  (U+0061 Latin Small Letter A)
mixed.codePointAt(0)  // 1072 (U+0430 Cyrillic Small Letter A)`}</CodeBlock>
      </Section>

      <Section title="Detection Methods">
        <p>Several approaches exist to detect homoglyph attacks:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Script mixing detection</strong>: Flag strings that contain characters from multiple scripts (e.g., Latin mixed with Cyrillic). Unicode TR#39 defines &ldquo;mixed-script&rdquo; detection algorithms.</li>
          <li><strong>Confusable detection</strong>: Unicode TR#39 also publishes a <C>confusables.txt</C> file that maps each character to its &ldquo;skeleton&rdquo; &mdash; a canonical form for comparison. Two strings with the same skeleton are confusable.</li>
          <li><strong>Single-script enforcement</strong>: Requiring that identifiers (usernames, domains) use characters from only one script.</li>
          <li><strong>Visual inspection tools</strong>: Using tools like this one to reveal the actual code points behind text that looks suspicious.</li>
        </ul>
        <CodeBlock>{`// Unicode TR#39 confusable skeleton (conceptual):
skeleton("аpple") → "apple"  // Cyrillic а maps to Latin a
skeleton("apple") → "apple"  // Already Latin

// If skeletons match, strings are confusable:
skeleton("аpple") === skeleton("apple")  // true → confusable!

// Script detection:
function getScripts(str) {
  return [...new Set(
    [...str].map(ch => {
      // Use Unicode script property
      // (simplified; real impl uses Unicode data)
      const cp = ch.codePointAt(0);
      if (cp >= 0x0400 && cp <= 0x04FF) return "Cyrillic";
      if (cp >= 0x0370 && cp <= 0x03FF) return "Greek";
      return "Latin";
    })
  )];
}`}</CodeBlock>
      </Section>

      <Section title="Normalization as a Partial Defense">
        <p>Unicode normalization (especially NFKC) can collapse some homoglyphs but not all:</p>
        <Table headers={["Homoglyph pair", "NFKC helps?", "Reason"]} rows={[
          ["Ａ (U+FF21) vs A (U+0041)", "Yes", "NFKC maps fullwidth to ASCII"],
          ["ⅰ (U+2170) vs i (U+0069)", "Yes", "NFKC decomposes Roman numerals"],
          ["а (U+0430) vs a (U+0061)", "No", "Different scripts, not compatibility equivalents"],
          ["Α (U+0391) vs A (U+0041)", "No", "Greek and Latin are distinct"],
          ["𝐀 (U+1D400) vs A (U+0041)", "Yes", "NFKC maps math alphanumerics"],
        ]} />
        <p className="mt-3">NFKC normalization is a useful first pass &mdash; it eliminates compatibility variants and fullwidth forms. But cross-script homoglyphs (Latin vs Cyrillic vs Greek) survive normalization because they are not compatibility equivalents. They are genuinely different characters that just happen to look the same.</p>
        <p className="mt-3">For robust defense, you need <strong>both</strong> normalization and confusable detection. This tool lets you see exactly which code points are behind any text, making it easy to spot when characters are not what they appear to be.</p>
        <div className="mt-4"><TryItButton text="AАΑ aа oоο">Reveal the true identity of each character</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="脅威: 見た目が同じ文字たち">
        <p>Unicode は数百のスクリプトから15万以上の文字を含んでいます。これらの多くは、完全に異なる書記体系の完全に異なるコードポイントでありながら、視覚的に同一またはほぼ同一です。これらは<strong>ホモグリフ（同形異字）</strong>と呼ばれます。</p>
        <p className="mt-3">最も悪名高い例: ラテン文字の <C>a</C>（U+0061）とキリル文字の <C>а</C>（U+0430）。ほとんどのフォントでピクセル単位で完全に同一ですが、異なるスクリプトの別個の Unicode 文字です。</p>
        <Table headers={["見た目", "ラテン", "キリル", "ギリシャ"]} rows={[
          ["A", "U+0041 A", "U+0410 А", "U+0391 Α"],
          ["a", "U+0061 a", "U+0430 а", "—"],
          ["B", "U+0042 B", "U+0412 В", "U+0392 Β"],
          ["E", "U+0045 E", "U+0415 Е", "U+0395 Ε"],
          ["o", "U+006F o", "U+043E о", "U+03BF ο"],
          ["p", "U+0070 p", "U+0440 р", "U+03C1 ρ"],
          ["x", "U+0078 x", "U+0445 х", "U+03C7 χ"],
        ]} />
        <p className="mt-3">これはバグではありません &mdash; たまたま同じ視覚形式に収斂した正当に異なる文字です。しかし攻撃者はこの偶然を悪用します。</p>
        <div className="mt-4"><TryItButton text="AАΑ aа oоο">ラテン・キリル・ギリシャの類似文字を比較する</TryItButton></div>
      </Section>

      <Section title="多スクリプトホモグリフの詳細">
        <p>問題はラテン/キリルをはるかに超えて広がります。Unicode は多くのスクリプトペア間にホモグリフを含んでいます:</p>
        <Table headers={["見た目", "関連スクリプト", "コードポイント"]} rows={[
          ["1 / l / I", "数字 / ラテン小文字 / ラテン大文字", "U+0031, U+006C, U+0049"],
          ["0 / O / О", "数字 / ラテン / キリル", "U+0030, U+004F, U+041E"],
          ["н / H", "キリル小文字 / ラテン大文字", "U+043D, U+0048"],
          ["ν / v", "ギリシャ小文字 / ラテン小文字", "U+03BD, U+0076"],
          ["ℓ / l", "筆記体小文字 L / ラテン L", "U+2113, U+006C"],
          ["⁰ / ° / o", "上付き0 / 度 / ラテン o", "U+2070, U+00B0, U+006F"],
          ["ー / — / ─", "カタカナ / Em ダッシュ / 罫線素片", "U+30FC, U+2014, U+2500"],
        ]} />
        <p className="mt-3">全角文字はさらに別の次元を加えます: <C>Ａ</C>（U+FF21、全角ラテン大文字A）は文脈によっては <C>A</C>（U+0041）と類似して見えます。数学用英数字記号（U+1D400〜U+1D7FF）もさらなる類似文字を提供します: <C>𝐀</C>（U+1D400、数学用太字大文字A）。</p>
      </Section>

      <Section title="実際の攻撃事例">
        <p>ホモグリフ攻撃は実際に被害を引き起こしてきました:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>IDN ホモグラフ攻撃</strong>: <C>аpple.com</C>（キリル文字のа）のようなドメインを登録し、ブラウザのアドレスバーで <C>apple.com</C> と同一に表示させる。これがブラウザにおける IDN 表示ポリシー策定のきっかけとなった。</li>
          <li><strong>ソースコード攻撃（Trojan Source）</strong>: ソースコードに Bidi オーバーライド文字やホモグリフを挿入し、悪意あるロジックをコードレビュー時に無害に見せる。2021年のケンブリッジ大学の論文がこの手法で人間のレビュアーに見えない脆弱性を注入できることを実証。</li>
          <li><strong>フィッシングメール</strong>: 視覚的な検査をパスする混合スクリプトホモグリフを使って送信者名や URL を偽装。</li>
          <li><strong>SNS のなりすまし</strong>: キリル文字やギリシャ文字の置換を使用して正規アカウントと同一に見えるユーザー名を作成。</li>
        </ul>
        <CodeBlock>{`// これらの文字列は同一に見えるが異なる:
const latin  = "apple";      // すべてラテン文字
const mixed  = "аpple";      // キリル а + ラテン pple

latin === mixed              // false
latin.length === mixed.length // true（どちらも5）

// バイト比較で違いが判明:
latin.codePointAt(0)  // 97   (U+0061 Latin Small Letter A)
mixed.codePointAt(0)  // 1072 (U+0430 Cyrillic Small Letter A)`}</CodeBlock>
      </Section>

      <Section title="検出方法">
        <p>ホモグリフ攻撃を検出するためのいくつかのアプローチがあります:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>スクリプト混在検出</strong>: 複数のスクリプトの文字を含む文字列（例: ラテン文字とキリル文字の混在）をフラグ付け。Unicode TR#39 が「混合スクリプト」検出アルゴリズムを定義。</li>
          <li><strong>紛らわしい文字の検出</strong>: Unicode TR#39 は各文字をその「スケルトン」&mdash; 比較用の正規形 &mdash; にマッピングする <C>confusables.txt</C> ファイルも公開。同じスケルトンを持つ2つの文字列は紛らわしい。</li>
          <li><strong>単一スクリプト強制</strong>: 識別子（ユーザー名、ドメイン）が1つのスクリプトの文字のみを使用することを要求。</li>
          <li><strong>視覚的検査ツール</strong>: このツールのように、疑わしいテキストの背後にある実際のコードポイントを明らかにする。</li>
        </ul>
        <CodeBlock>{`// Unicode TR#39 紛らわしい文字スケルトン（概念的）:
skeleton("аpple") → "apple"  // キリル а がラテン a にマップ
skeleton("apple") → "apple"  // 元からラテン

// スケルトンが一致すれば紛らわしい:
skeleton("аpple") === skeleton("apple")  // true → 紛らわしい！

// スクリプト検出:
function getScripts(str) {
  return [...new Set(
    [...str].map(ch => {
      const cp = ch.codePointAt(0);
      if (cp >= 0x0400 && cp <= 0x04FF) return "Cyrillic";
      if (cp >= 0x0370 && cp <= 0x03FF) return "Greek";
      return "Latin";
    })
  )];
}`}</CodeBlock>
      </Section>

      <Section title="正規化による部分的防御">
        <p>Unicode 正規化（特に NFKC）は一部のホモグリフを統合できますが、すべてではありません:</p>
        <Table headers={["ホモグリフペア", "NFKC で解決?", "理由"]} rows={[
          ["Ａ (U+FF21) vs A (U+0041)", "はい", "NFKC が全角を ASCII にマップ"],
          ["ⅰ (U+2170) vs i (U+0069)", "はい", "NFKC がローマ数字を分解"],
          ["а (U+0430) vs a (U+0061)", "いいえ", "異なるスクリプト、互換等価ではない"],
          ["Α (U+0391) vs A (U+0041)", "いいえ", "ギリシャとラテンは別個"],
          ["𝐀 (U+1D400) vs A (U+0041)", "はい", "NFKC が数学用英数字をマップ"],
        ]} />
        <p className="mt-3">NFKC 正規化は有用な第一段階です &mdash; 互換変種と全角形式を除去します。しかしクロススクリプトのホモグリフ（ラテン vs キリル vs ギリシャ）は互換等価ではないため正規化を生き残ります。これらはたまたま同じ外見を持つ、真に異なる文字です。</p>
        <p className="mt-3">堅牢な防御には正規化<strong>と</strong>紛らわしい文字検出の<strong>両方</strong>が必要です。このツールはテキストの背後にある正確なコードポイントを表示し、文字が見た目通りでない場合を簡単に発見できます。</p>
        <div className="mt-4"><TryItButton text="AАΑ aа oоο">各文字の正体を明らかにする</TryItButton></div>
      </Section>
    </>
  );
}

export default function HomoglyphsContent() {
  return <LocaleSwitch en={<En />} ja={<Ja />} />;
}

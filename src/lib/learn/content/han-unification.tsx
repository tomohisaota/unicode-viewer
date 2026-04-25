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
      <Section title="The Problem: Same Origin, Different Shapes">
        <p>Chinese characters (漢字/汉字) are used across four major writing systems: Chinese (simplified and traditional), Japanese, Korean, and Vietnamese (historically). Over centuries, the same character evolved different shapes in each region.</p>
        <p className="mt-3">Consider the character meaning &ldquo;bone&rdquo;: in Japan it is written as 骨 with a slightly different stroke structure than the Chinese form. Should Unicode assign them the same code point or different ones?</p>
        <p className="mt-3">The Unicode Consortium chose <strong>Han Unification</strong>: characters that share the same origin and meaning are assigned a single code point, even if their glyphs differ across regions. The font and language tag determine which visual form is rendered.</p>
        <Table headers={["Concept", "Example", "Code point"]} rows={[
          ["Unified", "繋 (JP) vs 繋 (CN)", "Same: U+7E4B"],
          ["Not unified", "渡 vs 度", "Different: U+6E21 vs U+5EA6"],
        ]} />
        <div className="mt-4"><TryItButton text="繋">Inspect a unified character</TryItButton></div>
      </Section>

      <Section title="The Source Separation Rule">
        <p>The core principle governing Han Unification is the <strong>Source Separation Rule</strong>: if two characters were encoded as separate code points in any of the source standards (national character sets from China, Japan, Korea, Taiwan, etc.), they must remain separate in Unicode.</p>
        <p className="mt-3">Conversely, if a character appears in multiple source standards at what the IRG (Ideographic Rapporteur Group) judges to be the &ldquo;same position,&rdquo; it is unified into one code point.</p>
        <p className="mt-3">Each unified character carries <strong>source references</strong> (also called IRG source flags) that record which national standards include it:</p>
        <Table headers={["Source prefix", "Standard", "Country/Region"]} rows={[
          ["G", "GB 2312 / GB 18030 / etc.", "China (PRC)"],
          ["J", "JIS X 0208 / JIS X 0213", "Japan"],
          ["K", "KS X 1001 / KS X 1002", "Korea"],
          ["T", "CNS 11643", "Taiwan"],
          ["V", "TCVN", "Vietnam"],
          ["H", "HKSCS", "Hong Kong"],
        ]} />
        <p className="mt-3">This tool shows the IRG source flags for every CJK character, letting you trace exactly which standards contributed each code point.</p>
        <div className="mt-4"><TryItButton text="漢字">Check IRG sources for 漢字</TryItButton></div>
      </Section>

      <Section title="Reading IRG Source Flags">
        <p>When you inspect a CJK character in this tool, you may see source data like <C>G0-3A3A J0-3441 T1-4E5B K0-7956</C>. Here is how to decode these:</p>
        <Table headers={["Flag", "Meaning"]} rows={[
          ["G0-3A3A", "GB 2312 row 26, col 26 (China source)"],
          ["J0-3441", "JIS X 0208 row 20, col 33 (Japan source)"],
          ["T1-4E5B", "CNS 11643 plane 1, row 46, col 59 (Taiwan source)"],
          ["K0-7956", "KS X 1001 row 89, col 70 (Korea source)"],
        ]} />
        <p className="mt-3">The number after the letter indicates which level of the standard: G0 = GB 2312 (level 0), G1 = GB 12345, J0 = JIS X 0208, J1 = JIS X 0212, and so on.</p>
        <p className="mt-3">A character with sources from all four major regions (G, J, K, T) is strongly unified &mdash; all four national standards agreed this was one character. A character with only one source (e.g., only J) may be Japan-specific.</p>
      </Section>

      <Section title="CJK Extensions A through I">
        <p>The original CJK Unified Ideographs block (U+4E00&ndash;U+9FFF) holds 20,992 characters from the most common national standards. But this was not nearly enough. Unicode has added extensions over the decades:</p>
        <Table headers={["Block", "Range", "Count", "Year", "Note"]} rows={[
          ["CJK Unified", "U+4E00–9FFF", "20,992", "1993", "Core set (GB, JIS, KS, CNS)"],
          ["Extension A", "U+3400–4DBF", "6,592", "1999", "Rare characters from CNS, JIS X 0213"],
          ["Extension B", "U+20000–2A6DF", "42,720", "2001", "Historic, variant, rare"],
          ["Extension C", "U+2A700–2B73F", "4,154", "2009", "Additional rare characters"],
          ["Extension D", "U+2B740–2B81F", "222", "2010", "Urgent additions"],
          ["Extension E", "U+2B820–2CEAF", "5,762", "2015", "Continued expansion"],
          ["Extension F", "U+2CEB0–2EBEF", "7,473", "2017", "Further additions"],
          ["Extension G", "U+30000–3134F", "4,939", "2020", "Includes oracle bone script"],
          ["Extension H", "U+31350–323AF", "4,192", "2022", "Continued expansion"],
          ["Extension I", "U+2EBF0–2F7FF", "622", "2023", "CJK ideographs for personal names"],
        ]} />
        <p className="mt-3">Extensions B and beyond live in the Supplementary Ideographic Plane (SIP), requiring surrogate pairs in UTF-16. This means <C>"𠀀".length</C> in JavaScript returns 2, not 1.</p>
      </Section>

      <Section title="The Controversy">
        <p>Han Unification remains one of Unicode&apos;s most debated decisions. Critics argue:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Loss of distinction</strong>: Japanese and Chinese readers may expect different stroke forms for the same code point. Relying on <C>lang</C> attributes and fonts is fragile.</li>
          <li><strong>Font dependency</strong>: Without correct language tagging, a CJK character may render in the &ldquo;wrong&rdquo; regional form, confusing readers.</li>
          <li><strong>Philosophical objection</strong>: Some scholars argue that regional variants have diverged enough to be distinct characters, not merely glyph variants.</li>
        </ul>
        <p className="mt-3">Defenders counter:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Precedent</strong>: Latin &lsquo;a&rsquo; renders differently across fonts (serif vs sans-serif) without getting separate code points. Regional CJK glyph variation is analogous.</li>
          <li><strong>Practicality</strong>: Without unification, CJK blocks would be 3&ndash;4x larger, making interoperability harder.</li>
          <li><strong>IVS escape valve</strong>: Ideographic Variation Sequences allow specifying exact glyph forms when needed.</li>
        </ul>
      </Section>

      <Section title="CJK Compatibility Ideographs: The Exceptions">
        <p>Despite the unification philosophy, Unicode does include some duplicated CJK characters in the <strong>CJK Compatibility Ideographs</strong> block (U+F900&ndash;U+FAFF). These exist for round-trip compatibility with source standards that encoded the same character twice.</p>
        <p className="mt-3">For example, <C>U+F91D</C> (隷) is a CJK Compatibility Ideograph that duplicates <C>U+96B7</C> (隷). Under NFC normalization, the compatibility ideograph maps to the unified form:</p>
        <CodeBlock>{`// CJK Compatibility Ideograph → Unified form
"\\uF91D".normalize("NFC")
// → "隷" (U+96B7)

// Check if a character is in the compatibility block:
const cp = "隷".codePointAt(0); // U+F91D
const isCompat = cp >= 0xF900 && cp <= 0xFAFF;`}</CodeBlock>
        <p className="mt-3">There are 472 CJK Compatibility Ideographs. Most exist because the Korean KS X 1001 standard encoded some variant forms separately, and the Source Separation Rule required preserving them.</p>
        <div className="mt-4"><TryItButton text={"\uF91D"} norm={true}>Compare compatibility ideograph with NFC</TryItButton></div>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="問題: 同じ起源、異なる字形">
        <p>漢字は4つの主要な文字体系で使用されています: 中国語（簡体字・繁体字）、日本語、韓国語、そしてベトナム語（歴史的）。数世紀を経て、同じ文字が各地域で異なる字形に発展しました。</p>
        <p className="mt-3">例えば「骨」という文字: 日本では中国語の字形とわずかに異なる画構造で書かれます。Unicode は同じコードポイントを割り当てるべきでしょうか、それとも別々にすべきでしょうか?</p>
        <p className="mt-3">Unicode コンソーシアムは <strong>Han Unification（漢字統合）</strong>を選択しました: 同じ起源と意味を共有する文字は、地域間でグリフが異なっていても単一のコードポイントに割り当てられます。どの視覚形式でレンダリングされるかはフォントと言語タグによって決まります。</p>
        <Table headers={["概念", "例", "コードポイント"]} rows={[
          ["統合された", "繋（JP）vs 繋（CN）", "同一: U+7E4B"],
          ["統合されない", "渡 vs 度", "別々: U+6E21 vs U+5EA6"],
        ]} />
        <div className="mt-4"><TryItButton text="繋">統合された文字を検査する</TryItButton></div>
      </Section>

      <Section title="ソース分離規則">
        <p>漢字統合を統治する中核原則が<strong>ソース分離規則（Source Separation Rule）</strong>です: 2つの文字がいずれかのソース規格（中国、日本、韓国、台湾等の国家文字集合）で別々のコードポイントとしてエンコードされていた場合、Unicode でも別々のままでなければなりません。</p>
        <p className="mt-3">逆に、IRG（Ideographic Rapporteur Group、表意文字小委員会）が「同じ位置」と判断した文字が複数のソース規格に現れる場合、1つのコードポイントに統合されます。</p>
        <p className="mt-3">統合された各文字には<strong>ソース参照</strong>（IRG ソースフラグ）が付与され、どの国家規格がそれを含むか記録されています:</p>
        <Table headers={["ソース接頭辞", "規格", "国/地域"]} rows={[
          ["G", "GB 2312 / GB 18030 等", "中国（大陸）"],
          ["J", "JIS X 0208 / JIS X 0213", "日本"],
          ["K", "KS X 1001 / KS X 1002", "韓国"],
          ["T", "CNS 11643", "台湾"],
          ["V", "TCVN", "ベトナム"],
          ["H", "HKSCS", "香港"],
        ]} />
        <p className="mt-3">このツールはすべての CJK 文字の IRG ソースフラグを表示し、各コードポイントにどの規格が寄与したかを追跡できます。</p>
        <div className="mt-4"><TryItButton text="漢字">漢字の IRG ソースを確認する</TryItButton></div>
      </Section>

      <Section title="IRG ソースフラグの読み方">
        <p>このツールで CJK 文字を検査すると、<C>G0-3A3A J0-3441 T1-4E5B K0-7956</C> のようなソースデータが表示されることがあります。読み方は以下の通りです:</p>
        <Table headers={["フラグ", "意味"]} rows={[
          ["G0-3A3A", "GB 2312 26区26点（中国ソース）"],
          ["J0-3441", "JIS X 0208 20区33点（日本ソース）"],
          ["T1-4E5B", "CNS 11643 第1面 46区59点（台湾ソース）"],
          ["K0-7956", "KS X 1001 89区70点（韓国ソース）"],
        ]} />
        <p className="mt-3">文字の後の数字は規格のレベルを示します: G0 = GB 2312（レベル0）、G1 = GB 12345、J0 = JIS X 0208、J1 = JIS X 0212 など。</p>
        <p className="mt-3">4つの主要地域すべて（G, J, K, T）のソースを持つ文字は強く統合されています &mdash; 4つの国家規格がこれを1つの文字と認めたことを意味します。1つのソースのみ（例: J のみ）の文字は日本固有の可能性があります。</p>
      </Section>

      <Section title="CJK 拡張 A から I まで">
        <p>元の CJK 統合漢字ブロック（U+4E00&ndash;U+9FFF）は最も一般的な国家規格から 20,992 文字を収録しています。しかしこれでは全く足りませんでした。Unicode は数十年にわたり拡張を追加してきました:</p>
        <Table headers={["ブロック", "範囲", "文字数", "年", "備考"]} rows={[
          ["CJK 統合漢字", "U+4E00–9FFF", "20,992", "1993", "基本集合（GB, JIS, KS, CNS）"],
          ["拡張A", "U+3400–4DBF", "6,592", "1999", "CNS, JIS X 0213 の稀少文字"],
          ["拡張B", "U+20000–2A6DF", "42,720", "2001", "歴史的・異体・稀少文字"],
          ["拡張C", "U+2A700–2B73F", "4,154", "2009", "追加の稀少文字"],
          ["拡張D", "U+2B740–2B81F", "222", "2010", "緊急追加"],
          ["拡張E", "U+2B820–2CEAF", "5,762", "2015", "継続的拡張"],
          ["拡張F", "U+2CEB0–2EBEF", "7,473", "2017", "さらなる追加"],
          ["拡張G", "U+30000–3134F", "4,939", "2020", "甲骨文字を含む"],
          ["拡張H", "U+31350–323AF", "4,192", "2022", "継続的拡張"],
          ["拡張I", "U+2EBF0–2F7FF", "622", "2023", "人名用漢字"],
        ]} />
        <p className="mt-3">拡張B 以降は補助表意文字面（SIP）に配置され、UTF-16 ではサロゲートペアが必要です。つまり JavaScript では <C>{'"𠀀".length'}</C> は 1 ではなく 2 を返します。</p>
      </Section>

      <Section title="論争">
        <p>漢字統合は Unicode で最も議論の多い決定の一つであり続けています。批判側の主張:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>区別の喪失</strong>: 日本語と中国語の読者は同じコードポイントに対して異なる画形を期待する場合があります。<C>lang</C> 属性とフォントに頼る方式は脆弱です。</li>
          <li><strong>フォント依存</strong>: 正しい言語タグがなければ、CJK 文字が「間違った」地域形式でレンダリングされ、読者を混乱させてしまいます。</li>
          <li><strong>哲学的異議</strong>: 地域変種は十分に分岐しており、単なるグリフ変種ではなく別個の文字であると主張する学者もいます。</li>
        </ul>
        <p className="mt-3">擁護側の反論:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>先例</strong>: ラテン文字の &lsquo;a&rsquo; もフォントによって異なる形で描画されますが（セリフ vs サンセリフ）、別のコードポイントは与えられていません。地域的な CJK グリフ変種も同様です。</li>
          <li><strong>実用性</strong>: 統合なしでは CJK ブロックは 3〜4 倍の大きさになり、相互運用性が困難になります。</li>
          <li><strong>IVS という安全弁</strong>: 異体字シーケンス（IVS）により、必要時には正確なグリフ形式を指定できます。</li>
        </ul>
      </Section>

      <Section title="CJK 互換漢字: 例外">
        <p>統合の哲学にもかかわらず、Unicode には <strong>CJK 互換漢字</strong>ブロック（U+F900&ndash;U+FAFF）に重複した CJK 文字が含まれています。これらは同じ文字を2度エンコードしたソース規格との往復互換性のために存在します。</p>
        <p className="mt-3">例えば <C>U+F91D</C>（隷）は <C>U+96B7</C>（隷）を複製する CJK 互換漢字です。NFC 正規化では互換漢字は統合形式にマッピングされます:</p>
        <CodeBlock>{`// CJK 互換漢字 → 統合形式
"\\uF91D".normalize("NFC")
// → "隷" (U+96B7)

// 文字が互換ブロックにあるか確認:
const cp = "隷".codePointAt(0); // U+F91D
const isCompat = cp >= 0xF900 && cp <= 0xFAFF;`}</CodeBlock>
        <p className="mt-3">CJK 互換漢字は 472 文字あります。大半は韓国の KS X 1001 規格がいくつかの変種形式を個別にエンコードしていたため、ソース分離規則に従って保持されたものです。</p>
        <div className="mt-4"><TryItButton text={"\uF91D"} norm={true}>互換漢字を NFC と比較する</TryItButton></div>
      </Section>
    </>
  );
}

export default function HanUnificationContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

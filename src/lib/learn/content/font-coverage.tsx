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

function En() {
  return (
    <>
      <Section title="Registered ≠ Renderable">
        <p>A code point like 邉 (U+9089) has 32 Ideographic Variation Sequences registered in the Unicode IVD &mdash; the most of any character. But registration only says &ldquo;this combination is meaningful&rdquo;; whether you actually see a different glyph depends entirely on the font.</p>
        <p className="mt-3">Open one of the most comprehensive Japanese fonts on most operating systems (e.g. Yu Mincho, MS Mincho) and you will find that <strong>most of the 32 variants render identically to the default</strong>. The font simply doesn&apos;t carry distinct outlines for every registered IVS.</p>
        <div className="mt-4">
          <TryItButton text="邉󠄀邉󠄁邉󠄂邉󠄃邉󠄄邉󠄅邉󠄆邉󠄇邉󠄈邉󠄉邉󠄊邉󠄋邉󠄌邉󠄍邉󠄎邉󠄏邉󠄐邉󠄑邉󠄒邉󠄓邉󠄔邉󠄕邉󠄖邉󠄗邉󠄘邉󠄙邉󠄚邉󠄛邉󠄜邉󠄝邉󠄞邉󠄟">
            Inspect 邉 with all 32 registered IVS variants
          </TryItButton>
        </div>
      </Section>

      <Section title="Three IVD Collections, Three Schools of Thought">
        <p>The IVD is split into <em>collections</em>, each maintained by a different organisation with a different scope. A font typically targets one collection &mdash; not the whole IVD.</p>
        <Table
          headers={["Collection", "Maintainer", "Scope", "Reference font"]}
          rows={[
            ["Adobe-Japan1", "Adobe Type", "Adobe's own CJK glyph set, ~23,000 CIDs", "Source Han Serif / 源ノ明朝"],
            ["Hanyo-Denshi", "IPA / Hanyo-Denshi committee", "Variant glyphs for legal & academic use", "Hanazono Mincho"],
            ["Moji_Joho", "Moji Jōhō Kiban (IPA-led)", "MJ glyph set, ~60,000 variants for public registries", "IPAmj明朝"],
          ]}
        />
        <p className="mt-3">A single character can be registered in <em>multiple</em> collections under different VS numbers. For 邉:</p>
        <Table
          headers={["VS range", "Collection", "Variants"]}
          rows={[
            ["U+E0100–E010E", "Adobe-Japan1", "15 (CID 6930 + 14 alternates)"],
            ["U+E010F–E011F", "Hanyo-Denshi / Moji_Joho", "17 (overlap between the two)"],
          ]}
        />
        <p className="mt-3">A font that knows only about Adobe-Japan1 will leave the Moji_Joho range mapped to the default glyph. A font that knows only about Moji_Joho will leave the Adobe-Japan1 range alone. To render every variant correctly you need a font &mdash; or a combination of fonts &mdash; that covers <em>every</em> collection the character appears in.</p>
      </Section>

      <Section title="The &quot;Use Default&quot; Quirk">
        <p>Even within a single collection, some IVS entries are deliberately registered as <em>identical to the default glyph</em>. The font marks them in its cmap format-14 table with <C>None</C> as the glyph reference, meaning &ldquo;use the base character&apos;s default glyph here.&rdquo;</p>
        <p className="mt-3">This isn&apos;t a font bug or omission &mdash; it&apos;s the IVD&apos;s way of giving a stable identifier to a variant whose visual shape matches the default. For 邉:</p>
        <Table
          headers={["VS", "Status", "Reason"]}
          rows={[
            ["U+E0100", "= default", "Adobe-Japan1 CID+6930 (the canonical default 邉)"],
            ["U+E010F", "= default", "Hanyo-Denshi JA7821 / Moji_Joho MJ026190 — visually identical to default"],
            ["U+E011E", "distinct", "Hanyo-Denshi TK01090330 — actually a different glyph"],
          ]}
        />
        <p className="mt-3">The Unicode Viewer detail panel marks these three states with three different badge colours: <strong>blue</strong> for distinct IVS glyphs, <strong>cyan</strong> for &ldquo;= default&rdquo; entries, and <strong>grey</strong> for entries the font doesn&apos;t register at all.</p>
      </Section>

      <Section title="How This Site Combines Three Fonts">
        <p>To show every registered variant honestly, this site bundles a single Web font assembled from three upstream sources, each filling a role the others can&apos;t:</p>
        <Table
          headers={["Font", "License", "Role"]}
          rows={[
            ["Jigmo (Koichi Kamichi + GlyphWiki)", "CC0", "Base glyphs and every IVS in IVD 2025-07-14"],
            ["Source Han Serif JP / 源ノ明朝", "SIL OFL 1.1", "SVS for vertical-writing punctuation (、︁ 。︁ etc.)"],
            ["IPAmj明朝", "IPA Font License v1.0", "Final fallback for Moji_Joho-specific SVS"],
          ]}
        />
        <p className="mt-3">Why three? Because each is the only practical option for a particular gap:</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Jigmo</strong> is the only freely-licensed font with a full IVD 2025-07-14 implementation. Using it as the single source for IVS means base + variant glyphs share one type designer&apos;s style, so the side-by-side comparison in the detail panel highlights structural differences instead of typographic drift.</li>
          <li><strong>Source Han Serif</strong> ships a Standardized Variation Sequence (SVS) table that Jigmo lacks &mdash; without it, the centred punctuation forms (、︁ 。︁ used in vertical Japanese writing) would have no glyph at all.</li>
          <li><strong>IPAmj明朝</strong> covers a handful of Moji_Joho-specific SVS entries that Source Han Serif doesn&apos;t register.</li>
        </ul>
        <p className="mt-3">Where Source Han Serif provides the variant glyph for an SVS, the merge also overrides the base cmap entry to point at Source Han Serif&apos;s default glyph, so the bare character and its variant render in the same typeface. Without that step, comparing 。 with 。︁ would mix two designers&apos; hands and obscure the structural difference.</p>
      </Section>

      <Section title="What This Means for You">
        <p>If you build a tool, document, or website that relies on IVS for legal records, kanji name handling, or historical text, font choice is not cosmetic &mdash; it determines whether the variants are <em>visible at all</em>.</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li>Verify which IVD collections your target font covers. Adobe&apos;s site, the IPA mojikiban downloads, and Jigmo&apos;s README all publish their coverage.</li>
          <li>If a variant looks identical to the default, check whether the font actually has a distinct glyph or whether the IVD entry is a &ldquo;= default&rdquo; registration. The two situations need different fixes.</li>
          <li>For web delivery, consider chunked WOFF2 with <C>unicode-range</C> so the user only downloads what they actually render. This site uses 121 chunks of 256 code points each, ~14 MB total but typically &lt;1 MB per page view.</li>
        </ul>
      </Section>
    </>
  );
}

function Ja() {
  return (
    <>
      <Section title="登録されている ≠ 表示できる">
        <p>邉 (U+9089) は Unicode IVD に 32 個の異体字シーケンスが登録されており、これは全文字中最多です。しかし「登録」は「この組み合わせには意味がある」と宣言しているだけで、実際に異なる字形が表示されるかどうかはフォント次第です。</p>
        <p className="mt-3">代表的な日本語 OS 標準フォント (游明朝、MS 明朝など) で確認すると、<strong>32 個の異体字のうち多くがデフォルト字形と同じ見た目で描画される</strong>ことがわかります。フォントが全ての登録 IVS に対して個別のアウトラインを持っていないからです。</p>
        <div className="mt-4">
          <TryItButton text="邉󠄀邉󠄁邉󠄂邉󠄃邉󠄄邉󠄅邉󠄆邉󠄇邉󠄈邉󠄉邉󠄊邉󠄋邉󠄌邉󠄍邉󠄎邉󠄏邉󠄐邉󠄑邉󠄒邉󠄓邉󠄔邉󠄕邉󠄖邉󠄗邉󠄘邉󠄙邉󠄚邉󠄛邉󠄜邉󠄝邉󠄞邉󠄟">
            邉 の 32 IVS 全部を確認する
          </TryItButton>
        </div>
      </Section>

      <Section title="3 つの IVD コレクション、3 つの流儀">
        <p>IVD は<em>コレクション</em>に分かれていて、それぞれ別の組織が違うスコープで管理しています。フォントは普通そのうちの 1 つを対象にしていて、IVD 全体ではありません。</p>
        <Table
          headers={["コレクション", "管理団体", "スコープ", "代表的なフォント"]}
          rows={[
            ["Adobe-Japan1", "Adobe Type", "Adobe 独自の CJK 字形集 約23,000 CID", "源ノ明朝 (Source Han Serif)"],
            ["Hanyo-Denshi", "IPA / 汎用電子情報交換環境整備プログラム", "法務・学術用途の異体字", "花園明朝 (Hanazono Mincho)"],
            ["Moji_Joho", "文字情報基盤 (IPA 主導)", "MJ 字形集 約60,000、戸籍・公的台帳向け", "IPAmj明朝"],
          ]}
        />
        <p className="mt-3">同じ文字が<em>複数のコレクションに別の VS 番号で</em>登録されることもあります。邉の場合:</p>
        <Table
          headers={["VS 範囲", "コレクション", "異体字数"]}
          rows={[
            ["U+E0100–E010E", "Adobe-Japan1", "15 (CID 6930 + 14 異体字)"],
            ["U+E010F–E011F", "Hanyo-Denshi / Moji_Joho", "17 (両者で重複登録)"],
          ]}
        />
        <p className="mt-3">Adobe-Japan1 だけ知っているフォントは Moji_Joho 範囲をデフォルト字形のままにします。Moji_Joho だけ知っているフォントは Adobe-Japan1 範囲を放置します。全異体字を正しく描画するには、その文字が登録されている<em>全てのコレクション</em>をカバーするフォント、または複数のフォントの組み合わせが必要です。</p>
      </Section>

      <Section title="「デフォルトと同じ」という登録">
        <p>同じコレクション内でも、IVS のエントリが <em>意図的に「デフォルトと同じ字形」として登録される</em>ことがあります。フォントの cmap format-14 テーブルでは、これを <C>None</C> (グリフ参照なし、ベース文字のデフォルトを使う) で表します。</p>
        <p className="mt-3">これはフォントのバグや欠落ではなく、「字形は同じだが識別子としては別物」という IVD の設計です。邉の例:</p>
        <Table
          headers={["VS", "状態", "理由"]}
          rows={[
            ["U+E0100", "= デフォルト", "Adobe-Japan1 CID+6930 (邉の正規デフォルト)"],
            ["U+E010F", "= デフォルト", "Hanyo-Denshi JA7821 / Moji_Joho MJ026190 — デフォルトと同じ字形"],
            ["U+E011E", "異なる字形", "Hanyo-Denshi TK01090330 — 実際に別字形"],
          ]}
        />
        <p className="mt-3">Unicode Viewer の詳細パネルでは、この 3 つの状態をバッジの色で区別しています。<strong>青</strong>: 異なる字形あり (IVS)、<strong>シアン</strong>: 「デフォルトと同じ」登録、<strong>グレー</strong>: フォントに登録されていない、の 3 種です。</p>
      </Section>

      <Section title="本サイトが 3 フォントを使い分ける理由">
        <p>登録された全ての異体字を正直に表示するため、本サイトは 3 つのフォントから組み立てた単一の Web フォントを配信しています。それぞれが他では埋まらない役割を担当しています。</p>
        <Table
          headers={["フォント", "ライセンス", "役割"]}
          rows={[
            ["Jigmo (上地 幸一氏 + GlyphWiki)", "CC0", "ベース字形と IVD 2025-07-14 の全 IVS"],
            ["源ノ明朝 (Source Han Serif JP)", "SIL OFL 1.1", "縦書き句読点等の SVS (、︁ 。︁ など)"],
            ["IPAmj明朝", "IPA Font License v1.0", "Moji_Joho 固有の SVS の最終補完"],
          ]}
        />
        <p className="mt-3">なぜ 3 つも必要なのか? それぞれが特定の隙間を埋める唯一の現実解だからです。</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li><strong>Jigmo</strong> は IVD 2025-07-14 を完全実装した、自由に再配布可能な唯一のフォントです。IVS を全て同一フォントで賄うことで、ベースと異体字が同じ書体デザイナー由来になり、詳細パネルの並べ表示で「字形の構造差」と「書体の癖の差」が混ざらず、純粋に構造差だけを比較できます。</li>
          <li><strong>源ノ明朝</strong> には Jigmo にない SVS テーブル (Standardized Variation Sequence) が含まれます。これがないと、縦書きで使う中央寄せ句読点 (、︁ 。︁) のグリフが一切無くなります。</li>
          <li><strong>IPAmj明朝</strong> は源ノ明朝が登録していない Moji_Joho 固有の SVS をいくつか補完します。</li>
        </ul>
        <p className="mt-3">SVS グリフを源ノ明朝から取り込んだ文字については、ベース cmap (素のキャラクタ) も源ノ明朝の字形に書き換えています。これがないと、素の 。 と 。︁ で別の書体デザイナーの手が混ざってしまい、純粋な構造差が見えづらくなるためです。</p>
      </Section>

      <Section title="実用上の影響">
        <p>戸籍管理・氏名処理・古文書のデジタル化等で IVS に依存するツール / 文書 / Web サイトを作る場合、フォント選定は<em>装飾の話ではなく、変種が見えるか見えないかを決定する</em>致命的な選択です。</p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li>採用フォントが対応している IVD コレクションを確認しましょう。Adobe、文字情報基盤、Jigmo の README にそれぞれカバレッジが公開されています。</li>
          <li>異体字がデフォルトと同じに見える時、それは「フォントが実グリフを持っていない」のか「IVD で『デフォルトと同じ』として登録されている」のかを区別する必要があります。対処法が変わります。</li>
          <li>Web では <C>unicode-range</C> によるチャンク分割で、ユーザーが必要なグリフだけダウンロードする方式が現実的。本サイトは 256 コードポイントごとに 121 チャンクに分割、合計 14MB だが 1 ページ閲覧では通常 1MB 未満。</li>
        </ul>
      </Section>
    </>
  );
}

export default function FontCoverageContent({ locale }: { locale: "en" | "ja" }) {
  return locale === "ja" ? <Ja /> : <En />;
}

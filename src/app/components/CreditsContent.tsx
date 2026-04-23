type Locale = "en" | "ja";

type Entry = {
  name: string;
  version?: string;
  author: string;
  license: string;
  licenseUrl: string;
  purpose: { en: string; ja: string };
  url: string;
};

const FONTS: Entry[] = [
  {
    name: "Jigmo",
    version: "2025-09-12 (implements IVD 2025-07-14)",
    author: "Koichi Kamichi and GlyphWiki contributors",
    license: "CC0 1.0 (Public Domain Dedication)",
    licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
    purpose: {
      en: "Base CJK glyphs and every Ideographic Variation Sequence registered in Unicode IVD 2025-07-14 — including hard-to-find variants like 邉 E011E (Hanyo-Denshi TK01090330). Using a single typeface for every IVS means overlays in this tool compare structural differences rather than type-design drift. Glyphs are generated from GlyphWiki via the KAGE system.",
      ja: "CJK のベース字形と、Unicode IVD 2025-07-14 に登録された全異体字シーケンス（邉 E011E / Hanyo-Denshi TK01090330 のような入手困難な異体字も含む）。IVS 全体を同一書体で賄うことで、本ツールの重ね表示が「字形の構造差」のみを浮かび上がらせられるようにしています。グリフは GlyphWiki と KAGE システムから生成。",
    },
    url: "https://kamichikoichi.github.io/jigmo/",
  },
  {
    name: "IPAmj明朝 (IPAmj Mincho)",
    version: "006.01",
    author: "Information-technology Promotion Agency, Japan (IPA)",
    license: "IPA Font License v1.0",
    licenseUrl: "https://opensource.org/licenses/IPA",
    purpose: {
      en: "SVS (U+FE00-U+FE0F) overlay — Jigmo ships no SVS table, so IPAmj's Standardized Variation Sequence entries are layered on top (e.g. CJK punctuation 、︀ 、︁ 。︀).",
      ja: "SVS (U+FE00-FE0F) を補完。Jigmo には SVS テーブルがないため、CJK 句読点 (、︀ 、︁ 。︀ など) を含む Standardized Variation Sequence を IPAmj明朝から取り込んで重ねています。",
    },
    url: "https://moji.or.jp/mojikiban/font/",
  },
  {
    name: "Noto Sans Math",
    author: "Google / Noto Project",
    license: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org",
    purpose: {
      en: "Mathematical-symbol SVS variants (e.g. ∅ U+FE00).",
      ja: "数学記号の SVS 異体字（∅ U+FE00 など）。",
    },
    url: "https://fonts.google.com/noto/specimen/Noto+Sans+Math",
  },
  {
    name: "Geist / Geist Mono",
    author: "Vercel",
    license: "SIL Open Font License 1.1",
    licenseUrl: "https://openfontlicense.org",
    purpose: {
      en: "UI body and monospace typefaces.",
      ja: "UI 本文と等幅フォント。",
    },
    url: "https://vercel.com/font",
  },
];

const DATA: Entry[] = [
  {
    name: "Unicode Character Database (UCD)",
    version: "17.0.0",
    author: "The Unicode Consortium",
    license: "Unicode License",
    licenseUrl: "https://www.unicode.org/license.txt",
    purpose: {
      en: "Code point names, categories, blocks, grapheme break properties, and standardized variation sequences (SVS).",
      ja: "コードポイント名・カテゴリ・ブロック・書記素クラスタ境界・標準化異体字シーケンス (SVS)。",
    },
    url: "https://www.unicode.org/ucd/",
  },
  {
    name: "Unihan Database (IRG Sources)",
    version: "17.0.0",
    author: "Ideographic Research Group (IRG) / Unicode Consortium",
    license: "Unicode License",
    licenseUrl: "https://www.unicode.org/license.txt",
    purpose: {
      en: "IRG source flags (J/G/T/K) showing which CJK characters come from which national sources.",
      ja: "CJK 統合漢字の IRG ソース（日本・中国・台湾・韓国）情報。",
    },
    url: "https://www.unicode.org/charts/unihan.html",
  },
  {
    name: "Ideographic Variation Database (IVD)",
    version: "2022-09-13",
    author: "The Unicode Consortium",
    license: "Unicode License",
    licenseUrl: "https://www.unicode.org/license.txt",
    purpose: {
      en: "Registered IVS sequences across Adobe-Japan1, Hanyo-Denshi, and Moji_Joho collections.",
      ja: "Adobe-Japan1 / Hanyo-Denshi / Moji_Joho コレクションに登録された IVS シーケンス。",
    },
    url: "https://www.unicode.org/ivd/",
  },
  {
    name: "WHATWG Encoding Standard",
    author: "WHATWG",
    license: "Creative Commons Attribution 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
    purpose: {
      en: "Legacy encoding indices (Shift_JIS / GBK / Big5 / EUC-KR and ~20 more) as used by modern browsers.",
      ja: "モダンブラウザで使われるレガシーエンコーディング索引（Shift_JIS / GBK / Big5 / EUC-KR 他 20 種以上）。",
    },
    url: "https://encoding.spec.whatwg.org/",
  },
  {
    name: "Moji Jōhō Kiban (文字情報基盤)",
    author: "IPA / Moji Joho Kiban Project",
    license: "CC BY-SA 2.1 JP",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.1/jp/",
    purpose: {
      en: "MJ number assignments and the Moji_Joho IVD collection.",
      ja: "MJ 番号体系と Moji_Joho コレクションの IVS 登録元。",
    },
    url: "https://moji.or.jp/mojikiban/",
  },
];

const STRINGS: Record<Locale, {
  title: string;
  lede: string;
  fontsHeading: string;
  dataHeading: string;
  thanksHeading: string;
  thanks: string;
  licenseLabel: string;
  versionLabel: string;
  authorLabel: string;
  backToTool: string;
}> = {
  en: {
    title: "Credits & Licenses",
    lede: "Unicode Viewer is a thin UI over decades of careful work by many people. The fonts, data tables, and specifications that make accurate CJK variant rendering possible are listed below.",
    fontsHeading: "Fonts",
    dataHeading: "Data & Specifications",
    thanksHeading: "Thanks",
    thanks:
      "We are deeply grateful to the Information-technology Promotion Agency of Japan, Adobe Type, the Unicode Consortium, WHATWG, the Moji Jōhō Kiban Project, Koichi Kamichi, and the hundreds of volunteer contributors at GlyphWiki and elsewhere. This tool is only as useful as the work they have made freely available.",
    licenseLabel: "License",
    versionLabel: "Version",
    authorLabel: "By",
    backToTool: "← Open the tool",
  },
  ja: {
    title: "クレジットとライセンス",
    lede: "Unicode Viewer は、多くの方々の長年の緻密な仕事の上に立つ薄い UI にすぎません。CJK 異体字を正しく表示するために利用しているフォント・データ・仕様と、その作者の方々への謝辞を以下にまとめています。",
    fontsHeading: "フォント",
    dataHeading: "データ・仕様",
    thanksHeading: "謝辞",
    thanks:
      "情報処理推進機構 (IPA)、Adobe Type、Unicode コンソーシアム、WHATWG、文字情報基盤事業、上地幸一 (神鵄) 氏、そして GlyphWiki を支える数百人のボランティア貢献者の皆さまに深く感謝いたします。本ツールが提供できる価値は、皆さまが自由に公開してくださった成果に完全に依存しています。",
    licenseLabel: "ライセンス",
    versionLabel: "バージョン",
    authorLabel: "提供元",
    backToTool: "← ツールに戻る",
  },
};

function EntryCard({ entry, locale, t }: { entry: Entry; locale: Locale; t: typeof STRINGS["en"] }) {
  return (
    <div
      className="rounded-xl p-4 sm:p-5"
      style={{ boxShadow: "0px 0px 0px 1px var(--shadow-border)" }}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <a
          href={entry.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base sm:text-lg font-semibold no-underline"
          style={{ color: "var(--gray-900)", letterSpacing: "-0.3px" }}
        >
          {entry.name}
        </a>
        {entry.version && (
          <span
            className="text-xs font-mono"
            style={{ color: "var(--gray-500)" }}
          >
            {t.versionLabel}: {entry.version}
          </span>
        )}
      </div>
      <p
        className="text-sm mt-1"
        style={{ color: "var(--gray-500)", lineHeight: 1.6 }}
      >
        {t.authorLabel}: {entry.author}
      </p>
      <p
        className="text-sm mt-2"
        style={{ color: "var(--gray-700)", lineHeight: 1.7 }}
      >
        {entry.purpose[locale]}
      </p>
      <p className="text-xs mt-3" style={{ color: "var(--gray-500)" }}>
        {t.licenseLabel}:{" "}
        <a
          href={entry.licenseUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--accent-blue-text)" }}
        >
          {entry.license}
        </a>
      </p>
    </div>
  );
}

export default function CreditsContent({ locale }: { locale: Locale }) {
  const t = STRINGS[locale];
  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <header className="mb-8 sm:mb-10">
          <h1
            className="text-2xl sm:text-3xl font-semibold"
            style={{ color: "var(--gray-900)", letterSpacing: "-1px" }}
          >
            {t.title}
          </h1>
          <p
            className="text-sm sm:text-base mt-3"
            style={{ color: "var(--gray-500)", lineHeight: 1.75 }}
          >
            {t.lede}
          </p>
        </header>

        <section className="mb-10 sm:mb-12">
          <h2
            className="text-xs font-semibold uppercase mb-3 sm:mb-4"
            style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
          >
            {t.fontsHeading}
          </h2>
          <div className="flex flex-col gap-3">
            {FONTS.map((e) => (
              <EntryCard key={e.name} entry={e} locale={locale} t={t} />
            ))}
          </div>
        </section>

        <section className="mb-10 sm:mb-12">
          <h2
            className="text-xs font-semibold uppercase mb-3 sm:mb-4"
            style={{ color: "var(--gray-500)", letterSpacing: "0.04em" }}
          >
            {t.dataHeading}
          </h2>
          <div className="flex flex-col gap-3">
            {DATA.map((e) => (
              <EntryCard key={e.name} entry={e} locale={locale} t={t} />
            ))}
          </div>
        </section>

        <section
          className="rounded-xl p-5 sm:p-6 mb-10"
          style={{
            backgroundColor: "var(--gray-50)",
            boxShadow: "0px 0px 0px 1px var(--shadow-border)",
          }}
        >
          <h2
            className="text-sm font-semibold mb-2"
            style={{ color: "var(--gray-900)" }}
          >
            {t.thanksHeading}
          </h2>
          <p
            className="text-sm"
            style={{ color: "var(--gray-700)", lineHeight: 1.85 }}
          >
            {t.thanks}
          </p>
        </section>

        <footer>
          <a
            href="/"
            className="text-sm font-medium no-underline"
            style={{ color: "var(--accent-blue-text)" }}
          >
            {t.backToTool}
          </a>
        </footer>
      </main>
    </div>
  );
}

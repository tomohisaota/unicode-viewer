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

function CodeInline({ children }: { children: React.ReactNode }) {
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
              <th
                key={i}
                className="text-left px-3 py-2 text-xs font-semibold"
                style={{ color: "var(--gray-500)", borderBottom: "1px solid var(--gray-100)" }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  className="px-3 py-2 font-mono"
                  style={{ color: "var(--gray-700)", borderBottom: "1px solid var(--gray-100)" }}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function GraphemeClustersContent() {
  return (
    <>
      <Section title='The "One Character" Illusion'>
        <p>
          How many characters are in this string: <CodeInline>{"👨‍👩‍👧‍👦"}</CodeInline>?
        </p>
        <p className="mt-3">
          Most people answer &ldquo;one&rdquo; &mdash; it looks like a single family emoji.
          But ask JavaScript, and you get three different answers depending on how you count:
        </p>
        <Table
          headers={["Method", "Result", "What it counts"]}
          rows={[
            ['"👨‍👩‍👧‍👦".length', "11", "UTF-16 code units"],
            ['[..."👨‍👩‍👧‍👦"].length', "7", "Code points"],
            ["Intl.Segmenter", "1", "Grapheme clusters (visual characters)"],
          ]}
        />
        <p className="mt-3">
          The family emoji is composed of 7 code points: four person/child emoji joined by three Zero Width Joiners (ZWJ).
          In UTF-16 (JavaScript&rsquo;s internal encoding), each emoji above U+FFFF takes two code units (a surrogate pair),
          giving <CodeInline>.length</CodeInline> a count of 11.
        </p>
        <div className="mt-4">
          <TryItButton text="👨‍👩‍👧‍👦">Inspect the family emoji</TryItButton>
        </div>
      </Section>

      <Section title="Three Different Counts">
        <p>
          Understanding the three counts is fundamental to working with Unicode correctly:
        </p>
        <Table
          headers={["Unit", "What it is", "Example: 👍🏽"]}
          rows={[
            ["UTF-16 code units", "What .length counts. Includes surrogate pairs.", "4 units"],
            ["Code points", "Basic Unicode unit (U+XXXX). What [...str] gives.", "2 points"],
            ["Grapheme clusters", "What humans see as \"one character\".", "1 cluster"],
          ]}
        />
        <p className="mt-3">
          <CodeInline>👍🏽</CodeInline> is two code points: 👍 (U+1F44D) + skin tone modifier 🏽 (U+1F3FD).
          Each code point is above U+FFFF, so each takes two UTF-16 code units.
          But it renders as a single visible character &mdash; one grapheme cluster.
        </p>
        <div className="mt-4">
          <TryItButton text="👍🏽">Inspect skin tone modifier</TryItButton>
        </div>
      </Section>

      <Section title="Flag Emoji: Regional Indicator Math">
        <p>
          Flag emoji are another case where multiple code points form one grapheme cluster.
          Each flag is a pair of Regional Indicator symbols:
        </p>
        <Table
          headers={["Flag", "Code points", "Meaning"]}
          rows={[
            ["🇯🇵", "U+1F1EF + U+1F1F5", "Regional J + Regional P"],
            ["🇺🇸", "U+1F1FA + U+1F1F8", "Regional U + Regional S"],
            ["🇬🇧", "U+1F1EC + U+1F1E7", "Regional G + Regional B"],
          ]}
        />
        <p className="mt-3">
          Three flags, but <CodeInline>{"\"🇯🇵🇺🇸🇬🇧\".length"}</CodeInline> returns 12
          (6 code points, each taking 2 UTF-16 units). Only <CodeInline>Intl.Segmenter</CodeInline> correctly
          identifies 3 grapheme clusters.
        </p>
        <div className="mt-4">
          <TryItButton text="🇯🇵🇺🇸🇬🇧">Inspect flag emoji</TryItButton>
        </div>
      </Section>

      <Section title="When Normalization Changes the Count">
        <p>
          The string <CodeInline>caf&eacute;</CodeInline> can be encoded two ways in Unicode:
        </p>
        <Table
          headers={["Form", "Code points", "Bytes"]}
          rows={[
            ["NFC (composed)", "c a f é (4 CPs)", "é = U+00E9"],
            ["NFD (decomposed)", "c a f e ◌́ (5 CPs)", "e + combining acute = U+0065 U+0301"],
          ]}
        />
        <p className="mt-3">
          Both look identical on screen &mdash; 4 grapheme clusters either way.
          But code point count differs (4 vs 5), and so does <CodeInline>.length</CodeInline> (4 vs 5).
          Enable normalization comparison in the tool to see the difference:
        </p>
        <div className="mt-4">
          <TryItButton text="café" norm={true}>Compare NFC vs NFD for caf&eacute;</TryItButton>
        </div>
      </Section>

      <Section title="Practical Consequences">
        <p>
          Getting character counting wrong causes real bugs:
        </p>
        <ul className="list-disc pl-6 mt-2 flex flex-col gap-2">
          <li>
            <strong>String truncation</strong>: Cutting at <CodeInline>.length / 2</CodeInline> can split
            a surrogate pair, producing an invalid character (U+FFFD).
          </li>
          <li>
            <strong>Cursor movement</strong>: Moving &ldquo;one character&rdquo; in a text editor should
            skip the entire grapheme cluster, not individual code points.
          </li>
          <li>
            <strong>Input validation</strong>: &ldquo;Max 10 characters&rdquo; should count grapheme clusters,
            not <CodeInline>.length</CodeInline>.
          </li>
          <li>
            <strong>String reversal</strong>: <CodeInline>{"[...str].reverse().join(\"\")"}</CodeInline> breaks
            ZWJ sequences and flag emoji.
          </li>
        </ul>
      </Section>

      <Section title="The Solution: Intl.Segmenter">
        <p>
          <CodeInline>Intl.Segmenter</CodeInline> (available in all modern browsers since 2024) correctly
          segments text by grapheme cluster boundaries:
        </p>
        <div
          className="rounded-lg p-4 my-4 font-mono text-xs overflow-x-auto"
          style={{ backgroundColor: "var(--gray-50)" }}
        >
          <pre style={{ color: "var(--gray-700)" }}>{`const segmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme"
});

const text = "👨‍👩‍👧‍👦🇯🇵café";
const segments = [...segmenter.segment(text)];
console.log(segments.length); // 6 (correct!)

// Compare:
console.log(text.length);      // 18 (UTF-16 units)
console.log([...text].length); // 12 (code points)`}</pre>
        </div>
        <p className="mt-3">
          This tool uses <CodeInline>Intl.Segmenter</CodeInline> internally to split your input
          into grapheme clusters. Each cell in the grid represents one grapheme cluster &mdash;
          click any cell to see its internal structure.
        </p>
        <div className="mt-4">
          <TryItButton text="👨‍👩‍👧‍👦🇯🇵café">Try all examples together</TryItButton>
        </div>
      </Section>
    </>
  );
}

/**
 * Renders both en and ja content server-side (SEO-friendly).
 * CSS hides the non-matching locale based on html[data-locale]
 * set by a blocking <script> in <head> — no flash.
 */
export default function LocaleSwitch({
  en,
  ja,
}: {
  en: React.ReactNode;
  ja: React.ReactNode;
}) {
  return (
    <>
      <span data-locale-en="">{en}</span>
      <span data-locale-ja="">{ja}</span>
    </>
  );
}

import HomeAbout from "./components/HomeAbout";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import ToolGate from "./components/ToolGate";

/**
 * The home page is a server component so that the statically exported HTML
 * carries the header, the prose and the links even before any JavaScript runs.
 * Search engines render JS eventually; the crawlers that feed LLMs mostly do
 * not, and this page used to export an empty <body> for them.
 *
 * The tool itself needs the browser, so it sits behind <ToolGate />.
 */
export default function Home() {
  return (
    <div className="min-h-screen">
      <SiteHeader currentPage="tool" />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <ToolGate />
        <HomeAbout />
      </main>

      <SiteFooter />
    </div>
  );
}

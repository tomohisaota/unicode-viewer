import PageHeader from "./components/PageHeader";
import UnicodeViewer from "./components/UnicodeViewer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <PageHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <UnicodeViewer />
      </main>
    </div>
  );
}

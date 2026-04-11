"use client";

import { useEffect, useState } from "react";
import PageHeader from "./components/PageHeader";
import UnicodeViewer from "./components/UnicodeViewer";

export default function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) return null;

  return (
    <div className="min-h-screen">
      <PageHeader />
      <main className="max-w-6xl mx-auto px-6 py-8">
        <UnicodeViewer />
      </main>
    </div>
  );
}

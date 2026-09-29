"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // For Step 1, auto-redirect to /design-system
    router.push("/design-system");
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center font-mono">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4 animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-[var(--text-1)]">
        SAMANVAY (समन्वय) — Step 1 Scaffold
      </h1>
      <p className="text-xs text-[var(--text-2)] mt-2 max-w-md">
        Per Step 1 requirements, page construction is focused exclusively on the Design System showroom.
      </p>
      <Link
        href="/design-system"
        className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/30 transition shadow-[var(--glow)]"
      >
        <span>Open /design-system Showroom</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

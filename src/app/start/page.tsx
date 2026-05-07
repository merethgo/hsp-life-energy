"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/assessment");
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-10">
      <p className="text-sm text-[--muted]">正在进入测评…</p>
    </main>
  );
}

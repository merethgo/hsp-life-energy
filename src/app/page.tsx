import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-14 md:py-16">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[--muted] md:text-sm">
          HSP Life Energy
        </p>
        <h1 className="text-balance text-[31px] font-semibold tracking-tight text-[--foreground] md:text-6xl">
          高敏感生命能量测评
        </h1>
        <p className="mt-6 rounded-full border border-[--border] bg-[rgba(255,253,249,0.88)] px-5 py-2 text-sm text-[--muted] shadow-[0_12px_40px_rgba(47,58,53,0.06)]">
          本测评共 48 题，约 5 - 8 分钟，请按照真实状态作答
        </p>
        <div className="mt-9 flex flex-col items-center gap-4">
          <Link className="primary-button" href="/assessment">
            开始测评
          </Link>
        </div>
      </section>
    </main>
  );
}

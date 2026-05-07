"use client";

import Link from "next/link";
import { useState } from "react";
import { ReportActions } from "@/components/report-actions";
import { ReportView } from "@/components/report-view";
import type { AssessmentReportPayload, StaticStoredReport } from "@/lib/types";

const REPORT_KEY = "hsle_assessment_report";

type ReportState =
  | { status: "loading" }
  | { status: "empty" }
  | {
      status: "ready";
      createdAt?: string;
      name?: string;
      report: AssessmentReportPayload;
    };

function isStoredReport(value: unknown): value is StaticStoredReport {
  return (
    typeof value === "object" &&
    value !== null &&
    "report" in value &&
    "form" in value &&
    "createdAt" in value
  );
}

function readStoredReport(): ReportState {
  if (typeof window === "undefined") {
    return { status: "loading" };
  }

  const stored = localStorage.getItem(REPORT_KEY);
  if (!stored) return { status: "empty" };

  try {
    const parsed = JSON.parse(stored) as unknown;

    if (isStoredReport(parsed)) {
      return {
        status: "ready",
        createdAt: parsed.createdAt,
        name: parsed.form.name,
        report: parsed.report,
      };
    }

    return {
      status: "ready",
      report: parsed as AssessmentReportPayload,
    };
  } catch {
    return { status: "empty" };
  }
}

export default function ReportPage() {
  const [reportState] = useState<ReportState>(readStoredReport);

  if (reportState.status === "loading") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-10">
        <p className="text-sm text-[--muted]">正在准备报告…</p>
      </main>
    );
  }

  if (reportState.status === "empty") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
        <div className="card-surface w-full p-8 text-center">
          <p className="text-xs uppercase tracking-[0.28em] text-[--muted]">HSP Life Energy</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">还没有可查看的报告</h1>
          <p className="mt-4 text-sm leading-7 text-[--muted]">
            请先完成一次测评。报告会保存在当前设备的浏览器里，刷新后仍可继续查看。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link className="primary-button" href="/assessment">
              去开始测评
            </Link>
            <Link className="secondary-button" href="/">
              返回首页
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="report-print-shell mx-auto w-full max-w-6xl px-6 py-8 md:py-10"
      id="report-export-root"
    >
      <div className="mb-3 no-print pdf-ignore">
        <Link className="text-sm text-[--muted] underline underline-offset-4" href="/">
          返回首页
        </Link>
      </div>
      <ReportActions />
      <ReportView
        createdAt={reportState.createdAt}
        name={reportState.name}
        report={reportState.report}
      />
    </main>
  );
}

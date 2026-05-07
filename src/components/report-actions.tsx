"use client";

import { useState } from "react";

export function ReportActions() {
  const [isExporting, setIsExporting] = useState(false);

  function handleDownloadPdf() {
    if (isExporting) return;

    setIsExporting(true);

    try {
      window.print();
    } catch {
      window.alert("下载 PDF 失败，请稍后重试。");
    } finally {
      window.setTimeout(() => {
        setIsExporting(false);
      }, 120);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3 no-print pdf-ignore">
      <button className="primary-button" onClick={handleDownloadPdf} type="button">
        {isExporting ? "准备中…" : "下载 PDF"}
      </button>
    </div>
  );
}

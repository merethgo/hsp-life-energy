"use client";

import html2canvas from "html2canvas";
import { useMemo, useState } from "react";

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(max-width: 768px)").matches ||
    window.matchMedia("(pointer: coarse)").matches
  );
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function ReportActions() {
  const [isExporting, setIsExporting] = useState(false);
  const mobile = useMemo(() => isMobileDevice(), []);

  async function downloadReportImages() {
    const root = document.getElementById("report-export-root");
    if (!root) {
      window.alert("暂时找不到报告内容，请刷新后再试。");
      return;
    }

    const exportUnits = Array.from(
      root.querySelectorAll<HTMLElement>(".pdf-export-unit"),
    ).filter((node) => !node.classList.contains("pdf-ignore"));

    if (!exportUnits.length) {
      window.alert("暂时找不到可保存的报告内容，请刷新后再试。");
      return;
    }

    for (let index = 0; index < exportUnits.length; index += 1) {
      const node = exportUnits[index];
      const canvas = await html2canvas(node, {
        useCORS: true,
        backgroundColor: "#f7f4ee",
        scale: 1.4,
      });

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 0.92);
      link.download = `hsp-life-energy-report-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await wait(180);
    }
  }

  async function handleExport() {
    if (isExporting) return;

    setIsExporting(true);

    try {
      if (mobile) {
        await downloadReportImages();
      } else {
        window.print();
      }
    } catch {
      window.alert(mobile ? "保存报告图片失败，请稍后重试。" : "下载 PDF 失败，请稍后重试。");
    } finally {
      window.setTimeout(() => {
        setIsExporting(false);
      }, 160);
    }
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-end gap-3 no-print pdf-ignore">
      <button className="primary-button" onClick={handleExport} type="button">
        {isExporting ? "准备中…" : mobile ? "保存报告图片" : "下载 PDF"}
      </button>
    </div>
  );
}

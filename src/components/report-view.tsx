"use client";
import type { AssessmentReportPayload } from "@/lib/types";

type ReportViewProps = {
  report: AssessmentReportPayload;
  title?: string;
  subtitle?: string;
  createdAt?: string;
  name?: string;
};

type IconName =
  | "compass"
  | "balance"
  | "tag"
  | "grid"
  | "alert"
  | "steps"
  | "spark"
  | "profile";

function SectionIcon({ name }: { name: IconName }) {
  const common = "h-5 w-5 text-[--muted-strong] stroke-[1.8]";

  switch (name) {
    case "compass":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" stroke="currentColor" />
          <path d="m14.8 9.2-2.8 5.6-5.6 2.8 2.8-5.6 5.6-2.8Z" stroke="currentColor" />
        </svg>
      );
    case "balance":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M12 5v14" stroke="currentColor" />
          <path d="M7 7h10" stroke="currentColor" />
          <path d="M9 7 6 12h6L9 7Z" stroke="currentColor" />
          <path d="m15 7-3 5h6l-3-5Z" stroke="currentColor" />
          <path d="M9 19h6" stroke="currentColor" />
        </svg>
      );
    case "tag":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="m20 13-7 7-9-9V4h7l9 9Z" stroke="currentColor" />
          <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
        </svg>
      );
    case "grid":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M5 5h6v6H5zM13 5h6v6h-6zM5 13h6v6H5zM13 13h6v6h-6z" stroke="currentColor" />
        </svg>
      );
    case "alert":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M12 4 4.5 8v5.5c0 3.3 2.2 6.3 7.5 6.5 5.3-.2 7.5-3.2 7.5-6.5V8L12 4Z" stroke="currentColor" />
          <path d="M12 8.5v4.2" stroke="currentColor" />
          <circle cx="12" cy="15.9" fill="currentColor" r=".8" />
        </svg>
      );
    case "steps":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M5 17h5v-5h4V7h5" stroke="currentColor" />
          <path d="m15 7h4v4" stroke="currentColor" />
        </svg>
      );
    case "spark":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <path d="M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M15 9l2-2M7 17l2-2" stroke="currentColor" />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" />
        </svg>
      );
    case "profile":
      return (
        <svg className={common} fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" />
          <path d="M5.5 18.5c1.3-2.8 3.7-4.2 6.5-4.2s5.2 1.4 6.5 4.2" stroke="currentColor" />
        </svg>
      );
  }
}

function scoreTone(score: number) {
  if (score >= 75) return "bg-[--accent] text-[--foreground]";
  if (score >= 60) return "bg-[--accent-soft] text-[--foreground]";
  if (score >= 45) return "bg-[--card] text-[--foreground]";
  return "bg-[--card] text-[--muted-strong]";
}

function riskTone(score: number) {
  if (score >= 75) return "bg-[--danger-soft] text-[--danger-text]";
  if (score >= 60) return "bg-[--warning-soft] text-[--warning-text]";
  if (score >= 45) return "bg-[--accent] text-[--foreground]";
  return "bg-[--card] text-[--muted-strong]";
}

function splitLead(text: string) {
  const parts = text
    .split("。")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { lead: text, detail: "" };
  }

  return {
    lead: `${parts[0]}。`,
    detail: `${parts.slice(1).join("。")}。`,
  };
}

function RadarChart({
  data,
}: {
  data: { key: string; name: string; score: number }[];
}) {
  const width = 520;
  const height = 420;
  const centerX = width / 2;
  const centerY = height / 2 + 4;
  const radius = 112;
  const labelRadius = radius + 58;
  const levels = [20, 40, 60, 80, 100];

  const points = data.map((item, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / data.length;
    const scaled = (item.score / 100) * radius;

    return {
      ...item,
      x: centerX + Math.cos(angle) * scaled,
      y: centerY + Math.sin(angle) * scaled,
      axisX: centerX + Math.cos(angle) * radius,
      axisY: centerY + Math.sin(angle) * radius,
      labelX: centerX + Math.cos(angle) * labelRadius,
      labelY: centerY + Math.sin(angle) * labelRadius,
    };
  });

  const polygonPoints = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="report-radar-wrap">
      <svg
        aria-label="六维图谱"
        className="report-radar-svg block h-auto w-full max-w-[520px]"
        role="img"
        viewBox={`0 0 ${width} ${height}`}
      >
        {levels.map((level) => {
          const ring = data
            .map((_, index) => {
              const angle = -Math.PI / 2 + (Math.PI * 2 * index) / data.length;
              const ringRadius = (level / 100) * radius;
              const x = centerX + Math.cos(angle) * ringRadius;
              const y = centerY + Math.sin(angle) * ringRadius;
              return `${x},${y}`;
            })
            .join(" ");

          return (
            <polygon
              key={level}
              fill="none"
              points={ring}
              stroke="var(--border)"
              strokeWidth="1"
            />
          );
        })}

        {points.map((point) => (
          <line
            key={point.key}
            stroke="var(--border)"
            strokeWidth="1"
            x1={centerX}
            x2={point.axisX}
            y1={centerY}
            y2={point.axisY}
          />
        ))}

        <polygon
          fill="rgba(111, 143, 135, 0.14)"
          points={polygonPoints}
          stroke="var(--primary)"
          strokeWidth="2"
        />

        {points.map((point) => (
          <circle key={`${point.key}-dot`} cx={point.x} cy={point.y} fill="var(--primary)" r="4" />
        ))}

        {points.map((point) => (
          <text
            key={`${point.key}-label`}
            fill="var(--muted-strong)"
            fontSize="14"
            fontWeight="500"
            dominantBaseline="middle"
            textAnchor={
              point.labelX >= centerX + 10 ? "start" : point.labelX <= centerX - 10 ? "end" : "middle"
            }
            x={point.labelX}
            y={point.labelY}
          >
            {point.name}
          </text>
        ))}
      </svg>
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  hint,
  className,
}: {
  icon: IconName;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={`flex items-start gap-3 ${className ?? ""}`}>
      <span className="report-icon-badge">
        <SectionIcon name={icon} />
      </span>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {hint ? <p className="mt-2 text-sm leading-7 text-[--muted]">{hint}</p> : null}
      </div>
    </div>
  );
}

export function ReportView({
  report,
  title = "你的高敏感生命能量画像",
  subtitle = "这不是为了定义你，而是帮助你更清楚地理解自己当前的运作方式。",
  createdAt,
  name,
}: ReportViewProps) {
  const overviewParts = splitLead(report.overview);

  return (
    <div className="report-view-root space-y-6 md:space-y-7">
      <section className="report-hero pdf-export-unit">
        <div className="flex flex-wrap items-center gap-3">
          <span className="stat-chip">{name ? `给${name}的报告` : "测评报告"}</span>
          <span className="stat-chip">{report.archetype.title}</span>
          {createdAt ? (
            <span className="text-xs text-[--muted]">
              生成时间：{new Date(createdAt).toLocaleString("zh-CN")}
            </span>
          ) : null}
        </div>

        <div className="mt-5">
          <p className="text-sm uppercase tracking-[0.22em] text-[--muted-strong]">
            HSP Life Energy Report
          </p>
          <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-[--muted] md:text-base">{subtitle}</p>
        </div>
      </section>

      <section className="report-section report-section-highlight pdf-export-unit">
        <SectionHeading
          icon="compass"
          title="你当前的状态总览"
          hint="先看懂这段，会更容易理解后面所有指标和解释。"
        />
        <div className="mt-5 space-y-4">
          <p className="text-sm leading-8 text-[--foreground] md:text-[15px]">{overviewParts.lead}</p>
          {overviewParts.detail ? (
            <p className="text-sm leading-8 text-[--foreground] md:text-[15px]">{overviewParts.detail}</p>
          ) : null}
        </div>
      </section>

      <section className="report-section">
        <SectionHeading
          className="pdf-export-unit"
          icon="balance"
          title="先看懂这两个最重要的指标"
          hint="它们可以帮助你先看清：你现在到底是更累，还是更稳。"
        />
        <div className="report-print-grid-stack mt-5 grid gap-4 md:grid-cols-2">
          <div className="report-card-panel pdf-export-unit rounded-3xl border border-[--border] bg-[--card] p-5">
            <p className="text-sm text-[--muted]">当前透支指数</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-semibold">{report.coreIndices.burnout.score}</span>
              <span className="stat-chip">{report.coreIndices.burnout.label}</span>
            </div>
            <p className="mt-5 text-sm leading-8 text-[--foreground]">
              {report.coreIndices.burnout.description}
            </p>
          </div>

          <div className="report-card-panel pdf-export-unit rounded-3xl border border-[--border] bg-[--card] p-5">
            <p className="text-sm text-[--muted]">内在调节能力</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="text-4xl font-semibold">{report.coreIndices.selfRegulation.score}</span>
              <span className="stat-chip">{report.coreIndices.selfRegulation.label}</span>
            </div>
            <p className="mt-5 text-sm leading-8 text-[--foreground]">
              {report.coreIndices.selfRegulation.description}
            </p>
          </div>
        </div>
      </section>

      <section className="report-section">
        <SectionHeading
          className="pdf-export-unit"
          icon="tag"
          title="你当前更接近哪一种高敏感模式"
          hint="这个名字不是给你贴标签，而是帮你更快抓住自己当下最核心的运作方式。"
        />
        <div className="report-card-panel pdf-export-unit mt-5 rounded-3xl border border-[--border] bg-[--card] p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-semibold">{report.archetype.title}</h3>
            <span className="stat-chip">当前主模式</span>
          </div>
          <p className="mt-5 text-sm leading-8 text-[--foreground]">{report.archetype.summary}</p>
        </div>
      </section>

      <section className="report-section">
        <SectionHeading
          className="pdf-export-unit"
          icon="grid"
          title="你的高敏感，是怎样在生活里发生作用的"
          hint="先看整体图谱，再看每一个维度的具体解释。"
        />
        <div className="report-card-panel pdf-export-unit mt-5 rounded-3xl border border-[--border] bg-[--card] px-3 py-4 md:px-5 md:py-5">
          <RadarChart data={report.dimensionSummary} />
        </div>

        <div className="mt-5 grid gap-4">
          {report.dimensionDetails.map((item) => {
            const parts = splitLead(item.text);
            return (
              <article
                key={item.key}
                className="report-card-panel pdf-export-unit rounded-3xl border border-[--border] bg-[--card] p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className={`stat-chip ${scoreTone(item.score)}`}>{item.score}</span>
                </div>
                <p className="mt-5 text-sm leading-8 text-[--foreground]">{parts.lead}</p>
                {parts.detail ? (
                  <p className="mt-4 text-sm leading-8 text-[--foreground]">{parts.detail}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>

      <section className="report-section">
        <SectionHeading
          className="pdf-export-unit"
          icon="alert"
          title="这几个地方，值得你温柔地多留意一点"
          hint="这些提醒不是为了吓你，而是帮你更早看见哪里已经在默默消耗你。"
        />
        <div className="report-print-grid-risk mt-5 grid gap-4 md:grid-cols-2">
          {report.riskAlertDetails.map((item) => {
            const parts = splitLead(item.description);
            return (
              <div
                key={item.key}
                className="report-card-panel pdf-export-unit rounded-3xl border border-[--border] bg-[--card] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-medium">{item.name}</h3>
                  <span className={`stat-chip ${riskTone(item.score)}`}>{item.label}</span>
                </div>
                <div className="mt-4 flex items-end gap-3">
                  <p className="text-3xl font-semibold">{item.score}</p>
                  <span className="text-sm text-[--muted]">/ 100</span>
                </div>
                <p className="mt-5 text-sm leading-8 text-[--foreground]">{parts.lead}</p>
                {parts.detail ? (
                  <p className="mt-4 text-sm leading-8 text-[--foreground]">{parts.detail}</p>
                ) : null}
              </div>
            );
          })}
        </div>

        {report.validityFlags.length ? (
          <div className="report-card-panel pdf-export-unit mt-5 rounded-3xl border border-[--border] bg-[--card] p-5">
            <p className="text-sm font-medium text-[--danger-text]">作答提醒</p>
            <ul className="mt-3 space-y-2 text-sm leading-8 text-[--foreground]">
              {report.validityFlags.includes("authenticity_low") ? (
                <li>你的回答可能更接近你希望自己成为的样子，而不是最近的真实状态。</li>
              ) : null}
              {report.validityFlags.includes("defensiveness_high") ? (
                <li>你可能在个别题目里忽视了自己最真实的状态，所以这份结果更适合作为参考。</li>
              ) : null}
              {report.validityFlags.includes("attention_warning") ? (
                <li>本次作答中可能存在注意力波动，建议在状态更平稳时再次测评。</li>
              ) : null}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="report-section">
        <SectionHeading
          className="pdf-export-unit"
          icon="steps"
          title="如果你只先做三件事，我建议你从这里开始"
          hint="先做得更小、更稳，往往比一下子要求自己彻底改变更有用。"
        />
        <div className="report-print-grid-suggestions mt-5 grid gap-4 md:grid-cols-3">
          {[
            { title: "先停止", text: report.suggestions.stop, number: "1" },
            { title: "先建立", text: report.suggestions.build, number: "2" },
            { title: "先练习", text: report.suggestions.practice, number: "3" },
          ].map((item) => (
            <div
              key={item.title}
              className="report-card-panel pdf-export-unit rounded-3xl border border-[--border] bg-[--card] p-5"
            >
              <div className="flex items-center gap-3">
                <span className="report-step-badge">{item.number}</span>
                <p className="text-sm font-medium text-[--muted-strong]">{item.title}</p>
              </div>
              <p className="mt-5 text-sm leading-8 text-[--foreground]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="report-section report-section-soft pdf-export-unit">
        <SectionHeading
          icon="spark"
          title="给你的最后一句话"
          hint="把这句话留给现在的自己，也留给以后那些又开始怀疑、疲惫、委屈的时刻。"
        />
        <p className="mt-5 text-sm leading-8 text-[--foreground] md:text-[15px]">{report.closing}</p>
      </section>

      <section className="report-section report-section-appendix pdf-export-unit">
        <SectionHeading
          icon="profile"
          title="关于我"
          hint="如果这份报告刚好说中了你当下的困惑，你也可以继续找到我。"
        />
        <p className="mt-5 text-sm leading-8 text-[--foreground]">
          我是本测评的开发者北北，一名镜像卡牌心理赋能师，专注于帮高敏感人走出焦虑内耗，实现行知合一，过理想生活。如果你正面临着情绪、关系、事业、财富、自我等方面的困扰，欢迎来链接我（vx：seed2tree_bb），我将通过深度对话和陪跑，全面赋能你当下的生命状态。最后，祝我们每天都有好事发生！
        </p>
      </section>

      <p className="pb-2 text-center text-xs leading-6 text-[--muted] pdf-export-unit">
        本测试为一种自我探索工具，不涉及任何医疗诊断。
      </p>
    </div>
  );
}

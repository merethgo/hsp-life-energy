"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { questions } from "@/lib/config";
import { buildAssessmentReport } from "@/lib/report-engine";
import type {
  AssessmentAnswerMap,
  AssessmentFormInput,
  StaticStoredReport,
} from "@/lib/types";

const SCALE_LABELS = [
  { value: 1, label: "完全不符合" },
  { value: 2, label: "比较不符合" },
  { value: 3, label: "一般" },
  { value: 4, label: "比较符合" },
  { value: 5, label: "非常符合" },
];

const PROGRESS_KEY = "hsle_assessment_progress";
const REPORT_KEY = "hsle_assessment_report";
const AUTO_NEXT_DELAY_MS = 260;

const DEFAULT_FORM: AssessmentFormInput = {
  name: "",
  age_range: "",
  life_status: "",
  stress_level: "",
  contact: "",
};

function readProgress() {
  if (typeof window === "undefined") return { answers: {}, currentIndex: 0 };
  const storedProgress = localStorage.getItem(PROGRESS_KEY);

  if (!storedProgress) {
    return { answers: {}, currentIndex: 0 };
  }

  const parsedProgress = JSON.parse(storedProgress) as {
    answers?: AssessmentAnswerMap;
    currentIndex?: number;
  };

  return {
    answers: parsedProgress.answers ?? {},
    currentIndex:
      typeof parsedProgress.currentIndex === "number" ? parsedProgress.currentIndex : 0,
  };
}

export default function AssessmentPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(() => readProgress().currentIndex);
  const [answers, setAnswers] = useState<AssessmentAnswerMap>(() => readProgress().answers);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [autoAdvancing, setAutoAdvancing] = useState(false);

  const question = useMemo(() => questions[currentIndex], [currentIndex]);
  const total = questions.length;

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify({ answers, currentIndex }));
  }, [answers, currentIndex, ready]);

  function answerQuestion(value: number) {
    const nextAnswers = { ...answers, [question.id]: value };
    const allAnswered = questions.every((item) => typeof nextAnswers[item.id] === "number");

    setAnswers(nextAnswers);
    setError("");

    if (currentIndex < total - 1) {
      setAutoAdvancing(true);
      window.setTimeout(() => {
        if (allAnswered) {
          setCurrentIndex(total - 1);
        } else {
          setCurrentIndex((index) => Math.min(index + 1, total - 1));
        }
        setAutoAdvancing(false);
      }, AUTO_NEXT_DELAY_MS);
    }
  }

  function handleSubmit() {
    const firstUnansweredIndex = questions.findIndex(
      (item) => typeof answers[item.id] !== "number",
    );

    if (firstUnansweredIndex !== -1) {
      setCurrentIndex(firstUnansweredIndex);
      setError("还有题目没有完成，我已经带你回到第一道漏答题。");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const report = buildAssessmentReport(answers, DEFAULT_FORM);
      const reportContext: StaticStoredReport = {
        createdAt: new Date().toISOString(),
        form: DEFAULT_FORM,
        report,
      };

      localStorage.removeItem(PROGRESS_KEY);
      localStorage.setItem(REPORT_KEY, JSON.stringify(reportContext));
      router.push("/report");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "提交失败，请稍后再试。";
      setError(message);
      setSubmitting(false);
      return;
    }

    setSubmitting(false);
  }

  if (!ready) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-10">
        <p className="text-sm text-[--muted]">正在准备测评…</p>
      </main>
    );
  }

  const answeredCount = questions.filter((item) => typeof answers[item.id] === "number").length;
  const currentAnswer = answers[question.id];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10">
      <div className="card-surface w-full p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[--muted]">高敏感生命能量测评</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">
              第 {currentIndex + 1} 题
            </h1>
          </div>
          <p className="text-sm text-[--muted]">
            {currentIndex + 1} / {total}
          </p>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[--border]">
          <div
            className="h-full rounded-full bg-[--primary] transition-all"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>

        <div className="mt-10">
          <p className="text-xl leading-9 md:text-2xl md:leading-10">{question.text}</p>
          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-[--muted]">
            <span>
              已完成 {answeredCount} / {total}
            </span>
            <span>
              {currentAnswer
                ? `当前选择：${SCALE_LABELS.find((item) => item.value === currentAnswer)?.label}`
                : "请选择最贴近你最近两周状态的选项"}
            </span>
          </div>
          <div className="mt-8 grid gap-3">
            {SCALE_LABELS.map((item) => {
              const isActive = currentAnswer === item.value;
              return (
                <button
                  key={item.value}
                  className={`scale-button text-left ${
                    isActive ? "border-[--primary] bg-[--accent-soft]" : ""
                  }`}
                  data-selected={isActive}
                  onClick={() => answerQuestion(item.value)}
                  type="button"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-sm text-[--muted]">{item.value}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            className="secondary-button"
            disabled={currentIndex === 0 || autoAdvancing}
            onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
            type="button"
          >
            上一题
          </button>

          {currentIndex === total - 1 ? (
            <button
              className="primary-button"
              disabled={submitting || !currentAnswer || autoAdvancing}
              onClick={handleSubmit}
              type="button"
            >
              {submitting ? "生成中…" : "提交测评"}
            </button>
          ) : (
            <button
              className="secondary-button"
              disabled={!currentAnswer || autoAdvancing}
              onClick={() => setCurrentIndex((index) => Math.min(index + 1, total - 1))}
              type="button"
            >
              {autoAdvancing ? "正在跳转…" : "下一题"}
            </button>
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-[--danger-text]">{error}</p> : null}
      </div>
    </main>
  );
}

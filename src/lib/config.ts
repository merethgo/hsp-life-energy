import questionBankRaw from "../../data/question-bank.json";
import type { QuestionConfig } from "./types";

export const questionBank = questionBankRaw as {
  meta: Record<string, unknown>;
  questions: QuestionConfig[];
};

export const questions = questionBank.questions;
export const questionMap = new Map(questions.map((question) => [question.id, question]));

export const dimensionNames: Record<string, string> = {
  input: "感知输入强度",
  emotion: "情绪负荷",
  processing: "过度加工倾向",
  boundary: "边界稳定度",
  recovery: "恢复能力",
  environment: "环境适配度",
  risk: "风险提醒",
  validity: "效度",
};

export const ageOptions = [
  { value: "under_18", label: "18岁以下" },
  { value: "18-24", label: "18-24" },
  { value: "25-30", label: "25-30" },
  { value: "31-35", label: "31-35" },
  { value: "36-45", label: "36-45" },
  { value: "46+", label: "46+" },
];

export const lifeStatusOptions = [
  { value: "student", label: "学生" },
  { value: "employee", label: "上班族" },
  { value: "freelancer", label: "自由职业" },
  { value: "founder", label: "创业中" },
  { value: "resting", label: "暂时休整中" },
  { value: "other", label: "其他" },
];

export const stressOptions = [
  { value: "very_low", label: "很低" },
  { value: "low", label: "偏低" },
  { value: "medium", label: "一般" },
  { value: "high", label: "偏高" },
  { value: "very_high", label: "很高" },
];

export function getAgeLabel(value: string) {
  return ageOptions.find((item) => item.value === value)?.label ?? value;
}

export function getLifeStatusLabel(value: string) {
  return lifeStatusOptions.find((item) => item.value === value)?.label ?? value;
}

export function getStressLabel(value: string) {
  return stressOptions.find((item) => item.value === value)?.label ?? value;
}

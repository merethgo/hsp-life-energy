export type DimensionKey =
  | "input"
  | "emotion"
  | "processing"
  | "boundary"
  | "recovery"
  | "environment"
  | "risk"
  | "validity";

export type ValidityTag = "authenticity" | "defensiveness" | "attention" | null;

export interface QuestionConfig {
  id: number;
  text: string;
  dimension: DimensionKey;
  sub_dimension?: string;
  reverse: boolean;
  weight: number;
  risk_tag?: string[];
  resource_tag?: string[];
  validity_tag?: ValidityTag;
}

export interface AssessmentFormInput {
  name?: string;
  age_range: string;
  life_status: string;
  stress_level: string;
  contact: string;
}

export type AssessmentAnswerMap = Record<number, number>;

export interface AssessmentScoreResult {
  rawScores: Record<string, number>;
  displayScores: Record<string, number>;
  burnoutIndex: number;
  selfRegulationIndex: number;
  riskAlerts: Record<string, number>;
  archetype: {
    key: string;
    title: string;
    summary: string;
  };
  validityFlags: string[];
}

export interface AssessmentReportPayload extends AssessmentScoreResult {
  overview: string;
  coreIndices: {
    burnout: { score: number; label: string; description: string };
    selfRegulation: { score: number; label: string; description: string };
  };
  dimensionSummary: {
    key: string;
    name: string;
    score: number;
  }[];
  dimensionDetails: {
    key: string;
    name: string;
    score: number;
    text: string;
  }[];
  riskAlertDetails: {
    key: string;
    name: string;
    score: number;
    label: string;
    description: string;
  }[];
  suggestions: {
    stop: string;
    build: string;
    practice: string;
  };
  supportNotice?: string;
  closing: string;
}

export interface StaticStoredReport {
  createdAt: string;
  form: AssessmentFormInput;
  report: AssessmentReportPayload;
}

export interface StoredSubmission {
  id: string;
  createdAt: string;
  form: AssessmentFormInput;
  answers: AssessmentAnswerMap;
  report: AssessmentReportPayload;
}

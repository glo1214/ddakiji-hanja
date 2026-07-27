// 리포트 칸의 데이터 층 — attempts(★ 모든 분석의 원천)를 읽어
//   ① 일별 정답률 추이(양적)  ② 문제별 풀이 기록(LLM 분석 입력)
// 을 만들고, AI 사고유형 분석 결과는 students/{id}/reports 에 회차로 쌓아
// "지난 분석의 약점이 나아졌는지"를 추적할 수 있게 한다.
//
// 사고유형 4축은 오류 태그(①~⑥)와 별개인 리포트 전용 렌즈다:
//   구체적 기억 · 지식의 범주화 · 논리적 연결 · 연상

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { normalizePhone } from "../storage";
import { getConcept } from "./concepts";
import { getContent } from "./content/sci_03";
import type { Attempt } from "./types";

// ── 사고유형 4축 ─────────────────────────────────────────────────
export const THINKING_AXES = [
  "구체적 기억",
  "지식의 범주화",
  "논리적 연결",
  "연상",
] as const;
export type ThinkingAxis = (typeof THINKING_AXES)[number];

export interface AxisResult {
  score: number; // 0~100
  comment: string; // 실제 답안을 근거로 든 한두 문장
}

export interface ThinkingReport {
  id?: string;
  axes: Record<ThinkingAxis, AxisResult>;
  pattern: string; // 전체 사고 패턴 분석
  strengths: string[];
  weaknesses: string[];
  focus: string[]; // 향후 학습 중점(개선점)
  progress: string | null; // 지난 리포트 대비 변화 코멘트
  attempt_count: number; // 분석에 쓴 기록 수(새 기록 유무 판단용)
  created_at: number; // ms
}

// ── attempts 읽기 ────────────────────────────────────────────────
export async function fetchAttempts(phone: string): Promise<Attempt[]> {
  const id = normalizePhone(phone) || phone;
  try {
    const snap = await getDocs(
      query(collection(db, "students", id, "attempts"), orderBy("created_at", "asc"))
    );
    return snap.docs.map((d) => {
      const raw = d.data();
      const ts = raw.created_at;
      return {
        ...(raw as Attempt),
        id: d.id,
        created_at:
          ts instanceof Timestamp ? ts.toMillis() : typeof ts === "number" ? ts : Date.now(),
      };
    });
  } catch (e) {
    console.error("[fetchAttempts] 실패:", e);
    return [];
  }
}

// ── 일별 정답률 추이 ─────────────────────────────────────────────
export interface DailyTrend {
  date: string; // YYYY-MM-DD (로컬)
  total: number;
  correct: number; // correct + explained
  rate: number; // 0~100
}

export function localDateStr(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function buildDailyTrend(attempts: Attempt[]): DailyTrend[] {
  const byDate = new Map<string, { total: number; correct: number }>();
  for (const a of attempts) {
    const date = localDateStr(a.created_at ?? Date.now());
    const cur = byDate.get(date) ?? { total: 0, correct: 0 };
    cur.total += 1;
    if (a.result === "correct" || a.result === "explained") cur.correct += 1;
    byDate.set(date, cur);
  }
  return Array.from(byDate.entries())
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, ...v, rate: Math.round((v.correct / v.total) * 100) }));
}

// ── 문제별 풀이 기록 (LLM 입력 + 화면 표시) ──────────────────────
export interface QuestionRecord {
  date: string;
  concept: string; // 개념 이름 (예: 관성)
  kind: string; // 객관식·정의형 | 설명하기·서술 등
  prompt: string;
  answer: string; // 고른 보기 원문 또는 서술 답안 원문
  correct: boolean;
  tags: string[]; // 오류 태그 ①~⑥
}

export function buildQuestionRecords(attempts: Attempt[]): QuestionRecord[] {
  const out: QuestionRecord[] = [];
  for (const a of attempts) {
    const concept = getConcept(a.concept_id);
    const content = getContent(a.concept_id);
    const date = localDateStr(a.created_at ?? Date.now());
    if (a.stage === "objective") {
      const item = content?.quiz.find((q) => q.id === a.quiz_item_id);
      if (!item) continue; // 콘텐츠가 내려간 문항은 건너뜀
      const chosen =
        typeof a.chosen_option === "number" ? item.options[a.chosen_option] : undefined;
      out.push({
        date,
        concept: concept?.name ?? a.concept_id,
        kind: `객관식·${item.type}`,
        prompt: item.prompt,
        answer: chosen?.text ?? "(기록 없음)",
        correct: a.result === "correct",
        tags: a.tags ?? [],
      });
    } else {
      out.push({
        date,
        concept: concept?.name ?? a.concept_id,
        kind: "설명하기·서술",
        prompt: content?.explain.prompt ?? "개념을 내 말로 설명하기",
        answer: a.answer_text ?? "(기록 없음)",
        correct: a.result === "explained",
        tags: a.tags ?? [],
      });
    }
  }
  return out;
}

// ── 리포트 저장/조회 (students/{id}/reports) ─────────────────────
export async function fetchReports(phone: string): Promise<ThinkingReport[]> {
  const id = normalizePhone(phone) || phone;
  try {
    const snap = await getDocs(
      query(collection(db, "students", id, "reports"), orderBy("created_at", "asc"))
    );
    return snap.docs.map((d) => ({ ...(d.data() as ThinkingReport), id: d.id }));
  } catch (e) {
    console.error("[fetchReports] 실패:", e);
    return [];
  }
}

export async function saveReport(phone: string, r: Omit<ThinkingReport, "id">): Promise<void> {
  const id = normalizePhone(phone) || phone;
  try {
    await addDoc(collection(db, "students", id, "reports"), r);
  } catch (e) {
    console.error("[saveReport] 실패:", e);
  }
}

// ── AI 분석 호출 (/api/report) ───────────────────────────────────
export interface PreviousSummary {
  created_at: number;
  axes: Record<ThinkingAxis, number>; // 축별 점수만
  weaknesses: string[];
}

export interface AnalysisPayload {
  records: QuestionRecord[];
  trend: DailyTrend[];
  previous: PreviousSummary | null;
}

/** 분석 성공 시 저장 직전 형태의 리포트를, 실패 시 null을 돌려준다. */
export async function requestAnalysis(payload: AnalysisPayload): Promise<ThinkingReport | null> {
  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Omit<ThinkingReport, "attempt_count" | "created_at">;
    return {
      ...data,
      attempt_count: payload.records.length,
      created_at: Date.now(),
    };
  } catch {
    return null;
  }
}

// 핸드오프 문서 §4 "데이터 스키마 초안" + §3 "핵심 개념 3가지"의 코드 표현.
// 이 파일이 학습 흐름(5단계)·교차분석·진단의 공통 타입 출처다.

// ── §3 오류 태그 (①~⑥) — 구현 상수 ─────────────────────────────
export const ERROR_TAGS = {
  CATEGORY: "①범주", // 상위어로 답함 (correct_subject 대신 over_general)
  TERM: "②용어", // 닫는명사를 못 꺼냄 ('것/거' + 멈칫)
  STRUCTURE: "③구조", // 순서·연결 깨짐
  CORE: "④핵심", // core_elements 누락
  CONFUSION: "⑤혼동", // confusable 짝개념과 섞음
  EXPRESSION: "⑥표현", // 구어체·부정확 표현
} as const;

export type ErrorTag = (typeof ERROR_TAGS)[keyof typeof ERROR_TAGS];

export const ALL_ERROR_TAGS: ErrorTag[] = Object.values(ERROR_TAGS);

// ── §3 4유형(진입점) — 단계 enum과 1:1 ───────────────────────────
export type EntryType = "느낌먼저" | "개념정리" | "따라해보기" | "크게보기";

// 학습 5단계
export type Stage = "느낌" | "개념" | "따라해보기" | "크게보기" | "설명하기";
export const STAGES: Stage[] = ["느낌", "개념", "따라해보기", "크게보기", "설명하기"];

/** 진입점(4유형) → 시작 단계. 길을 '나누지' 않고 시작점만 바꾼다(§2 원칙). */
export const ENTRY_START_STAGE: Record<EntryType, Stage> = {
  느낌먼저: "느낌",
  개념정리: "개념",
  따라해보기: "따라해보기",
  크게보기: "크게보기",
};

// ── concepts (시드 JSON에서 import) ─────────────────────────────
export interface Hanja {
  char: string; // 慣
  mean: string; // 익숙할
}

export interface Concept {
  id: string; // sci22_30
  subject: string; // 과학 | 사회
  unit?: string; // 대단원 (예: 열과 우리 생활)
  name: string; // 관성
  kind: "개별" | "세트"; // v2 시드 `성격`
  setName: string; // v2 시드 `세트명`
  structureStrategy: string; // v2 시드 `구조전략`
  connectionStrategy: string; // v2 시드 `연결전략`
  correct_subject: string; // 물체            (①기준)
  over_general: string[]; // [힘, 운동, 에너지]  (① 감지)
  closing_noun: string; // 성질            (② 감지)
  core_elements: string[]; // [...]           (④ 체크리스트)
  confusable: string[]; // [힘, 가속도]      (⑤ 감지)
  hanja: Hanja[];
  target_errors: string[]; // 참고용
}

// ── quiz_items (따라해보기 객관식) ──────────────────────────────
export interface QuizOption {
  text: string;
  is_correct: boolean;
  tag?: ErrorTag | null; // 오답 보기의 오류 태그 ← 교차분석 핵심
}

export interface QuizItem {
  id: string;
  concept_id: string;
  prompt: string;
  options: QuizOption[];
  type: "정의형" | "적용형" | "변별형";
}

// ── attempts (★ 모든 분석의 원천) ───────────────────────────────
export type AttemptStage = "objective" | "subjective";
export type AttemptResult = "correct" | "incorrect" | "explained" | "failed";

export interface Attempt {
  id?: string;
  student_id: string;
  concept_id: string;
  stage: AttemptStage;
  result: AttemptResult;
  chosen_option?: number | null; // obj: 고른 보기 index
  quiz_item_id?: string | null; // obj: 어떤 문항인지(교차분석용)
  answer_text?: string | null; // subj: 답안 원문
  tags: string[]; // ①~⑥ (복수)
  scaffold_used?: boolean; // subj: 2단 비계 호출 여부
  hesitation_count?: number; // subj: 멈칫·수정 횟수
  created_at?: number; // ms (클라이언트 미러; 서버엔 serverTimestamp)
}

// ── word_progress (단어별 진행) ─────────────────────────────────
export interface WordProgress {
  student_id: string;
  concept_id: string;
  stages_visited: Stage[];
  status: "learning" | "review";
  updated_at?: number;
}

// ── diagnostics (파생·캐시) ─────────────────────────────────────
export interface Diagnostics {
  student_id: string;
  tag_freq: Partial<Record<ErrorTag, number>>;
  updated_at?: number;
}

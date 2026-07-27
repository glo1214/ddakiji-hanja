export type Difficulty = "쉬움" | "보통" | "어려움";

export interface Hanja {
  sound: string;
  meaning: string;
}

// 선택지 인덱스 -> 오답 사고패턴 태그
export type WrongTagMap = Record<number, string>;

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  hint: string;
  wrongTags?: WrongTagMap;
}

export interface Explanation {
  keywords: string[];
  minRequired: number;
  modelAnswer: string;
}

export interface Concept {
  id: string;
  term: string;
  subject: string;
  difficulty: Difficulty;
  hanja: Hanja[];
  easyMeaning: string;
  example: string;
  quiz: QuizQuestion[];
  explanation?: Explanation;
  prerequisites: string[];
  isBonus?: boolean;
}

export interface ConceptProgress {
  done: boolean;
  score: number;
  /** 완료 시각(ms). 추후 복습 기능에서 사용. */
  completedAt?: number;
}

export type Progress = Record<string, ConceptProgress>;
export type WrongTagCounts = Record<string, number>;

export interface Student {
  name: string;
  phone: string;
  /** 학생 1명 시연용 로컬 세션. Firestore 등록 없이 앱 흐름을 체험한다. */
  isDemo?: boolean;
  /** 학년 (예: "1학년"). 이름-타일 로그인에서 그룹으로 쓰인다. */
  grade?: string;
  /** 선생님이 작성한 보고서 코멘트(학부모 전달용). */
  reportComment?: string;
  /** 4유형(진입점) — 초기 추정 후 행동으로 갱신. 학습 흐름 시작 단계를 정한다. */
  entry_type?: import("@/lib/learn/types").EntryType;
  /** 뇌유형(렌즈, 비공개) — 태그 패턴에서 추론, 처방 톤만 조정. */
  lens_type?: string;
}

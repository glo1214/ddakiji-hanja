// 유형 진단 — 유형_진단_설계_v1.md 구현.
// 4유형(진입점)은 '물어봐서' 정하고(초기 6문항) '행동으로' 갱신한다(행동이 이긴다).
// 뇌유형(렌즈)은 안 물어보고 오류 태그 패턴에서 추론한다(diagnostics.ts).

import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { normalizePhone } from "../storage";
import { ENTRY_START_STAGE, type EntryType, type Stage } from "./types";

// 단계(Stage) ↔ 진입 유형(EntryType) 매핑
export const STAGE_TO_ENTRY: Record<Exclude<Stage, "설명하기">, EntryType> = {
  느낌: "느낌먼저",
  개념: "개념정리",
  따라해보기: "따라해보기",
  크게보기: "크게보기",
};

// ── ⓐ 초기 6문항 (콜드 스타트) ──────────────────────────────────
export interface DiagnoseOption {
  label: string;
  type: EntryType;
}
export interface DiagnoseQuestion {
  q: string;
  options: DiagnoseOption[];
}

export const DIAGNOSE_QUESTIONS: DiagnoseQuestion[] = [
  {
    q: "처음 보는 개념을 만나면 먼저…",
    options: [
      { label: "이걸 왜 배우지? 내 생활이랑 무슨 상관?", type: "느낌먼저" },
      { label: "정확한 뜻이 뭐지? 정의부터.", type: "개념정리" },
      { label: "일단 문제 하나 풀어보자.", type: "따라해보기" },
      { label: "전체 그림이 어떻게 생겼지?", type: "크게보기" },
    ],
  },
  {
    q: "설명을 들을 때 제일 답답한 건…",
    options: [
      { label: "왜 하는지 안 알려줄 때", type: "느낌먼저" },
      { label: "뜻이 애매할 때", type: "개념정리" },
      { label: "직접 안 해볼 때", type: "따라해보기" },
      { label: "큰 틀을 안 줄 때", type: "크게보기" },
    ],
  },
  {
    q: "외울 때 나는…",
    options: [
      { label: "이야기·상황으로", type: "느낌먼저" },
      { label: "정의·기준으로", type: "개념정리" },
      { label: "문제 풀며", type: "따라해보기" },
      { label: "연결·흐름으로", type: "크게보기" },
    ],
  },
  {
    q: "노트를 정리하면…",
    options: [
      { label: "예시·느낌 메모", type: "느낌먼저" },
      { label: "또박또박 정의", type: "개념정리" },
      { label: "풀이 과정", type: "따라해보기" },
      { label: "화살표·지도", type: "크게보기" },
    ],
  },
  {
    q: "시험 전에 제일 든든한 건…",
    options: [
      { label: "왜 중요한지 알 때", type: "느낌먼저" },
      { label: "정의를 외웠을 때", type: "개념정리" },
      { label: "문제를 많이 풀었을 때", type: "따라해보기" },
      { label: "흐름을 꿰뚫을 때", type: "크게보기" },
    ],
  },
  {
    q: "친구에게 설명할 때…",
    options: [
      { label: "비슷한 상황 들어서", type: "느낌먼저" },
      { label: "정확히 정의해서", type: "개념정리" },
      { label: "예제 같이 풀어서", type: "따라해보기" },
      { label: "큰 그림 그려서", type: "크게보기" },
    ],
  },
];

const ENTRY_ORDER: EntryType[] = ["느낌먼저", "개념정리", "따라해보기", "크게보기"];

/** 가장 많이 고른 유형 = 진입점. 동점이면 느낌먼저(느낌 기본값). */
export function scoreEntryType(choices: EntryType[]): EntryType {
  const count: Record<EntryType, number> = { 느낌먼저: 0, 개념정리: 0, 따라해보기: 0, 크게보기: 0 };
  for (const c of choices) count[c] += 1;
  let best: EntryType = "느낌먼저";
  for (const t of ENTRY_ORDER) if (count[t] > count[best]) best = t;
  return best;
}

// ── ⓑ 행동 기반 데이터 + 갱신 ───────────────────────────────────
export interface BehaviorSummary {
  // 선택 단계에 끝까지 머문 횟수(참여) / 건너뛴 횟수
  engage: Partial<Record<Exclude<Stage, "설명하기">, number>>;
  skip: Partial<Record<Exclude<Stage, "설명하기">, number>>;
}

const EMPTY_BEHAVIOR: BehaviorSummary = { engage: {}, skip: {} };

/** 선택 단계의 참여/건너뛰기를 누적 (students/{phone}/behavior/summary). */
export async function recordStageBehavior(
  phone: string,
  stage: Stage,
  action: "engage" | "skip"
): Promise<void> {
  if (stage === "설명하기") return; // 필수 단계는 신호 아님
  const id = normalizePhone(phone) || phone;
  try {
    await setDoc(
      doc(db, "students", id, "behavior", "summary"),
      { [action]: { [stage]: increment(1) }, updated_at: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.error("[recordStageBehavior] 실패:", e);
  }
}

export async function getBehavior(phone: string): Promise<BehaviorSummary> {
  const id = normalizePhone(phone) || phone;
  try {
    const snap = await getDoc(doc(db, "students", id, "behavior", "summary"));
    if (!snap.exists()) return EMPTY_BEHAVIOR;
    const d = snap.data();
    return { engage: d.engage ?? {}, skip: d.skip ?? {} };
  } catch {
    return EMPTY_BEHAVIOR;
  }
}

/**
 * 행동에서 진입 유형을 추론. 선택 단계별 (참여 − 건너뛰기) 점수가 가장 높은 단계.
 * 충분한 신호(총 참여 ≥ 3)가 없으면 null → 초기 진단을 유지.
 */
export function inferEntryFromBehavior(b: BehaviorSummary): EntryType | null {
  const stages = Object.keys(STAGE_TO_ENTRY) as (keyof typeof STAGE_TO_ENTRY)[];
  const totalEngage = stages.reduce((s, st) => s + (b.engage[st] ?? 0), 0);
  if (totalEngage < 3) return null;
  let best: keyof typeof STAGE_TO_ENTRY | null = null;
  let bestScore = -Infinity;
  for (const st of stages) {
    const score = (b.engage[st] ?? 0) - (b.skip[st] ?? 0);
    if (score > bestScore) {
      bestScore = score;
      best = st;
    }
  }
  return best ? STAGE_TO_ENTRY[best] : null;
}

export interface ResolvedStart {
  stage: Stage;
  entry: EntryType;
  source: "behavior" | "initial" | "default";
}

/** 진입점 결정: 행동(확신) > 초기 진단 > 느낌 기본값. ("행동이 이긴다") */
export function resolveStart(
  initial: EntryType | undefined,
  behavior: BehaviorSummary
): ResolvedStart {
  const fromBehavior = inferEntryFromBehavior(behavior);
  if (fromBehavior) return { entry: fromBehavior, stage: ENTRY_START_STAGE[fromBehavior], source: "behavior" };
  if (initial) return { entry: initial, stage: ENTRY_START_STAGE[initial], source: "initial" };
  return { entry: "느낌먼저", stage: "느낌", source: "default" };
}

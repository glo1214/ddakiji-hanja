// 교차분석·진단 집계 — 객관식x주관식_교차분석_v1.md 구현.
// students/{phone}/attempts 만 읽어 2×2 매트릭스·태그 빈도·태그 일치(확정)·처방을 파생한다.
// (선생님 리포트 #5 단계. 개념별 교차 학생 집계가 필요하면 collectionGroup('attempts').)

import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { normalizePhone } from "../storage";
import { CONCEPTS, getConcept } from "./concepts";
import { ALL_ERROR_TAGS, type Attempt, type ErrorTag } from "./types";

// 태그 → 처방 한 줄 (콘텐츠_관성_풀세트 채점표 + 교차분석 §3)
export const TAG_PRESCRIPTION: Record<ErrorTag, string> = {
  "①범주": "범주화 훈련 — 상위어 대신 정확한 갈래(정확주어)로 닫기",
  "②용어": "용어 인출 연습 — 닫는명사 빈칸 채우기, 정의문 반복",
  "③구조": "구조·순서 잡기 — 재료→과정→결과 슬롯으로 잇기",
  "④핵심": "핵심요소 점검 — 빠진 요소를 체크리스트로 확인",
  "⑤혼동": "짝개념 대조 — 헷갈리는 짝을 표로 가르기(크게보기)",
  "⑥표현": "표현 다듬기 — 구어체를 정의문 형식으로",
};

// ── 뇌유형(렌즈) 추론 — 유형_진단_설계 §3. 안 물어보고 태그 패턴에서 읽음. ──
export type LensType = "전체인식형" | "순차인식형" | "직관형" | "감각형";

export interface LensInference {
  lens: LensType;
  signalTag: ErrorTag; // 근거가 된 우세 태그
  tone: string; // 처방 톤 조정
}

const LENS_BY_TAG: Record<string, LensInference> = {
  "④핵심": { lens: "전체인식형", signalTag: "④핵심", tone: "“세부 하나씩 채우기” 강조" },
  "③구조": { lens: "순차인식형", signalTag: "③구조", tone: "“위로 묶어 이름 붙이기” 강조" },
  "⑤혼동": { lens: "직관형", signalTag: "⑤혼동", tone: "“정의로 한 번 확인” 강조" },
  "②용어": { lens: "감각형", signalTag: "②용어", tone: "“전체 흐름 먼저 보기” 강조" },
};

/** ②③④⑤ 중 가장 잦은 태그로 렌즈를 추론. 신호가 약하면(빈도 0) null. */
export function inferLens(tagFreq: Partial<Record<ErrorTag, number>>): LensInference | null {
  const candidates = (Object.keys(LENS_BY_TAG) as ErrorTag[])
    .map((t) => ({ tag: t, n: tagFreq[t] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n);
  if (!candidates.length) return null;
  return LENS_BY_TAG[candidates[0].tag];
}

export type MatrixCell = "A" | "B" | "C" | "D";

export const CELL_MEANING: Record<MatrixCell, { title: string; rx: string }> = {
  A: { title: "완전 이해", rx: "다음 개념·심화로" },
  B: { title: "재인은 되나 산출 안 됨", rx: "설명하기 반복 · 닫는명사 비계" },
  C: { title: "표현은 되나 변별 약함", rx: "보기 비교 · 짝개념 대조표" },
  D: { title: "미습득", rx: "느낌·개념 단계부터 되돌림" },
};

export interface ConceptMatrix {
  conceptId: string;
  conceptName: string;
  objAttempts: number;
  objCorrect: number;
  objWrong: number;
  /** 최신 주관식 판정. null = 설명하기 기록 없음. */
  subjExplained: boolean | null;
  objTags: ErrorTag[];
  subjTags: ErrorTag[];
  /** 두 단계가 가리킨 같은 태그 = 약점 '확정'(§4). */
  confirmedTags: ErrorTag[];
  cell: MatrixCell | null; // 두 축이 다 있을 때만
}

export interface LearnDiagnostics {
  attemptsCount: number;
  tagFreq: Partial<Record<ErrorTag, number>>;
  byConcept: ConceptMatrix[];
  /** 학생 전체에서 객·주 양쪽에 등장한 태그 = 과목 무관 확정 패턴. */
  confirmedTags: ErrorTag[];
  /** 처방 우선순위 — 확정 태그 먼저, 그다음 빈도순. */
  prescription: { tag: ErrorTag; text: string; confirmed: boolean }[];
  /** 뇌유형(렌즈) 추론 — 처방 톤 조정용. null = 신호 부족. */
  lens: LensInference | null;
}

/** students/{phone}/attempts 전부 읽기 (시간순). */
export async function fetchAttempts(phone: string): Promise<Attempt[]> {
  const id = normalizePhone(phone) || phone;
  const q = query(collection(db, "students", id, "attempts"), orderBy("created_at", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      student_id: data.student_id ?? id,
      concept_id: data.concept_id,
      stage: data.stage,
      result: data.result,
      chosen_option: data.chosen_option ?? null,
      quiz_item_id: data.quiz_item_id ?? null,
      answer_text: data.answer_text ?? null,
      tags: (data.tags as string[]) ?? [],
      scaffold_used: data.scaffold_used ?? false,
      hesitation_count: data.hesitation_count ?? 0,
      created_at: data.created_at?.toMillis?.() ?? undefined,
    } as Attempt;
  });
}

function uniqTags(tags: string[]): ErrorTag[] {
  return ALL_ERROR_TAGS.filter((t) => tags.includes(t));
}

/** 객·주 축으로 2×2 칸을 정한다. 객관식은 오답이 하나라도 있으면 '틀림'으로 본다. */
function cellOf(objCorrect: number, objWrong: number, subjExplained: boolean | null): MatrixCell | null {
  const objRight = objWrong === 0 && objCorrect > 0 ? true : objWrong > 0 ? false : null;
  if (objRight === null || subjExplained === null) return null;
  if (objRight && subjExplained) return "A";
  if (objRight && !subjExplained) return "B";
  if (!objRight && subjExplained) return "C";
  return "D";
}

export function buildDiagnostics(attempts: Attempt[]): LearnDiagnostics {
  const tagFreq: Partial<Record<ErrorTag, number>> = {};
  for (const a of attempts) for (const t of uniqTags(a.tags)) tagFreq[t] = (tagFreq[t] || 0) + 1;

  // 개념별 묶기
  const ids = Array.from(new Set(attempts.map((a) => a.concept_id)));
  const byConcept: ConceptMatrix[] = ids.map((cid) => {
    const list = attempts.filter((a) => a.concept_id === cid);
    const obj = list.filter((a) => a.stage === "objective");
    const subj = list.filter((a) => a.stage === "subjective");
    const objCorrect = obj.filter((a) => a.result === "correct").length;
    const objWrong = obj.filter((a) => a.result === "incorrect").length;
    const latestSubj = subj.length ? subj[subj.length - 1] : null;
    const subjExplained = latestSubj ? latestSubj.result === "explained" : null;

    const objTags = uniqTags(obj.flatMap((a) => a.tags));
    const subjTags = uniqTags(subj.flatMap((a) => a.tags));
    const confirmedTags = objTags.filter((t) => subjTags.includes(t));

    return {
      conceptId: cid,
      conceptName: getConcept(cid)?.name ?? cid,
      objAttempts: obj.length,
      objCorrect,
      objWrong,
      subjExplained,
      objTags,
      subjTags,
      confirmedTags,
      cell: cellOf(objCorrect, objWrong, subjExplained),
    };
  });

  // 학생 전체 확정 태그: 객·주 양쪽에 한 번이라도 등장
  const allObjTags = uniqTags(attempts.filter((a) => a.stage === "objective").flatMap((a) => a.tags));
  const allSubjTags = uniqTags(attempts.filter((a) => a.stage === "subjective").flatMap((a) => a.tags));
  const confirmedTags = allObjTags.filter((t) => allSubjTags.includes(t));

  // 처방 우선순위: 확정 먼저, 그다음 빈도순
  const prescription = (Object.keys(tagFreq) as ErrorTag[])
    .sort((a, b) => {
      const ca = confirmedTags.includes(a) ? 1 : 0;
      const cb = confirmedTags.includes(b) ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return (tagFreq[b] || 0) - (tagFreq[a] || 0);
    })
    .map((tag) => ({ tag, text: TAG_PRESCRIPTION[tag], confirmed: confirmedTags.includes(tag) }));

  return {
    attemptsCount: attempts.length,
    tagFreq,
    byConcept,
    confirmedTags,
    prescription,
    lens: inferLens(tagFreq),
  };
}

/** 사용 가능한 개념 목록(분석 화면 안내용). */
export const ALL_CONCEPT_NAMES = CONCEPTS.map((c) => ({ id: c.id, name: c.name }));

// 설명하기(주관식) 자동 태깅 — README §5의 "규칙(싸고 확실)" 층.
// 최종 판정은 LLM 하이브리드로 넘기는 것이 권장안이나(README §5), 그 전에
// 규칙만으로 태그 후보 + 근거를 만든다. 학생_데이터모델 문서의 raw signal 표를 구현.

import { ERROR_TAGS, type Concept, type ErrorTag } from "./types";

export interface AutoTagInput {
  answerText: string;
  hesitationCount: number;
  concept: Concept;
  /** 콘텐츠 모듈이 주는 ④ 판정용 핵심 키워드. 없으면 concept.core_elements 사용. */
  coreKeywords?: string[];
}

export interface AutoTagResult {
  tags: ErrorTag[];
  reasons: string[]; // 태그별 근거 한 줄
  result: "explained" | "failed";
  coreMatched: number; // 충족한 핵심요소 수
}

function includesAny(text: string, words: string[]): string | null {
  for (const w of words) {
    const key = w.split(/[ (·]/)[0]; // "양분(포도당)" → "양분", "외부 힘" → "외부"
    if (key && text.includes(key)) return w;
  }
  return null;
}

export function autoTag(input: AutoTagInput): AutoTagResult {
  const text = input.answerText.trim();
  const { concept, hesitationCount } = input;
  const coreKeywords = input.coreKeywords ?? concept.core_elements;

  const tags = new Set<ErrorTag>();
  const reasons: string[] = [];

  // ① 범주: 정확주어 대신 상위어로 답함
  const overGeneralHit = includesAny(text, concept.over_general);
  const hasCorrectSubject = !!includesAny(text, [concept.correct_subject]);
  if (overGeneralHit && !hasCorrectSubject) {
    tags.add(ERROR_TAGS.CATEGORY);
    reasons.push(`상위어 '${overGeneralHit}' 등장(정확주어 '${concept.correct_subject}' 없음) → ①범주`);
  }

  // ② 용어: 닫는명사를 못 꺼내고 '것/거' + 멈칫
  const hasClosingNoun = text.includes(concept.closing_noun);
  const fillerCount = (text.match(/것|거|뭐냐면/g) || []).length;
  if (!hasClosingNoun && (fillerCount >= 1 || hesitationCount >= 1)) {
    tags.add(ERROR_TAGS.TERM);
    reasons.push(
      `닫는명사 '${concept.closing_noun}' 없이 '것/거'×${fillerCount}·멈칫×${hesitationCount} → ②용어`
    );
  }

  // ④ 핵심: 핵심요소 충족 부족
  const coreMatched = coreKeywords.filter((k) => includesAny(text, [k])).length;
  if (coreMatched < Math.min(2, coreKeywords.length)) {
    tags.add(ERROR_TAGS.CORE);
    reasons.push(`핵심요소 ${coreMatched}/${coreKeywords.length} 충족 → ④핵심`);
  }

  // ⑤ 혼동: 짝개념과 섞음 (관성=성질인데 '힘이다/가속도' 식으로 단정)
  const confusableHit = includesAny(text, concept.confusable);
  const confusedAssertion =
    confusableHit &&
    new RegExp(`관성[은는이가]?[^.]{0,8}(${concept.confusable.join("|")})`).test(text);
  if (confusableHit && (confusedAssertion || !hasClosingNoun)) {
    tags.add(ERROR_TAGS.CONFUSION);
    reasons.push(`짝개념 '${confusableHit}' 혼입 → ⑤혼동`);
  }

  // ③ 구조: 연결어/순서 신호 없음 (답이 충분히 긴데도)
  const hasConnective = /그래서|때문|따라서|그러면|면|니까/.test(text);
  if (text.length >= 25 && !hasConnective) {
    tags.add(ERROR_TAGS.STRUCTURE);
    reasons.push("연결어(그래서·때문에 등) 없이 나열 → ③구조");
  }

  // explained 판정: 핵심 2개 이상 + 범주오류 없음
  const passed = coreMatched >= Math.min(2, coreKeywords.length) && !tags.has(ERROR_TAGS.CATEGORY);

  return {
    tags: Array.from(tags),
    reasons,
    result: passed ? "explained" : "failed",
    coreMatched,
  };
}

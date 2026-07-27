// 시드 JSON(개념_시드_미래엔2022_중1_v2.json)을 앱 내부 `concepts` 데이터로 import.
// 이 파일이 미래엔 2022 개정 중1 과학1+사회① 235개 개념의 단일 출처다.
// 동일 데이터를 Firestore `concepts` 컬렉션으로도 올리려면 scripts/seed_concepts.mjs 사용.

import seed from "@/개념_시드_미래엔2022_중1_v2.json";
import type { Concept } from "./types";

interface RawConcept {
  id: string;
  subject: string;
  unit?: string;
  concept: string;
  hanja?: string[][]; // [["慣","익숙할"], ...]
  성격?: "개별" | "세트";
  세트명?: string;
  구조전략?: string;
  연결전략?: string;
  correct_subject?: string;
  over_general?: string[];
  closing_noun?: string;
  core_elements?: string[];
  confusable?: string[];
  target_errors?: string[];
}

function fallbackClosingNoun(name: string): string {
  if (name.endsWith("량")) return "양";
  if (name.endsWith("성")) return "성질";
  if (name.endsWith("주의")) return "생각";
  if (name.endsWith("화")) return "변화";
  return "개념";
}

function mapConcept(c: RawConcept): Concept {
  const kind = c.성격 ?? "개별";
  const coreElements = c.core_elements ?? [c.concept];

  return {
    id: c.id,
    subject: c.subject,
    unit: c.unit,
    name: c.concept,
    kind,
    setName: c.세트명 ?? "",
    structureStrategy: c.구조전략 ?? "",
    connectionStrategy: c.연결전략 ?? "",
    correct_subject: c.correct_subject ?? c.concept,
    over_general: c.over_general ?? [],
    closing_noun: c.closing_noun ?? fallbackClosingNoun(c.concept),
    core_elements: coreElements,
    confusable: c.confusable ?? [],
    hanja: (c.hanja ?? []).map(([char, mean]) => ({ char, mean })),
    target_errors: c.target_errors ?? [],
  };
}

export const CONCEPTS: Concept[] = (seed.concepts as RawConcept[]).map(mapConcept);

export const CONCEPT_COUNTS = CONCEPTS.reduce(
  (counts, concept) => {
    if (concept.subject === "과학") counts.science += 1;
    if (concept.subject === "사회") counts.social += 1;
    counts.total += 1;
    return counts;
  },
  { total: 0, science: 0, social: 0 },
);

export function getConcept(id: string): Concept | undefined {
  return CONCEPTS.find((c) => c.id === id);
}

export function getConceptsBySet(setName: string): Concept[] {
  return CONCEPTS.filter((c) => c.setName === setName);
}
